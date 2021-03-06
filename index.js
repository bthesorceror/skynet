var environment = process.env.NODE_ENV || 'development';

if (environment === 'development')
  (require('dotenv')()).load();

var Mustache   = require('mustache');
var Journeyman = require('journeyman');
var Rudder     = require('rudder');
var Lightning  = require('lightning_strike');
var Rivulet    = require('rivulet');
var path       = require('path');
var fs         = require('fs');
var Skynet     = require('./lib/skynet');

var skynet     = new Skynet(process.env.IRC_SERVER, process.env.IRC_NICK, process.env.IRC_PASSWORD);
var journeyman = new Journeyman(process.env.PORT);
var rudder     = new Rudder();
var rivulet    = new Rivulet();
var lightning  = new Lightning(path.join(__dirname, 'static'));

skynet.on('error', function(error) {
  console.log(error);
});

skynet.on('joined', function(channel) {
  rivulet.send('all', { action: 'join', channel: channel });
});

skynet.on('channel_message', function(channel, nick, message) {
  rivulet.send('messages_' + channel, { nick: nick, message: message });
  rivulet.send('all', {
    action: 'message',
    channel: channel,
    nick: nick,
    message: message
  });
});

rudder.get("/channels/([a-zA-Z0-9.]+)", function(req, res, channel) {
  res.writeHead(200);
  skynet.join(channel, function() {
    res.render('channel', { channel: channel });
  });
});

rudder.get("/", function(req, res) {
  res.writeHead(200);
  res.render('index', { channels: skynet.channels });
});

journeyman.use(rudder.middleware());

journeyman.use(function(req, res, next) {
  res.render = function(filepath, params) {
    var fullpath = path.join(__dirname, 'views', filepath + '.mustache');
    res.writeHead(200, { 'Content-type': 'text/html' });
    res.end(Mustache.render(fs.readFileSync(fullpath, 'utf8'), params));
  }

  res.renderOut = function(filepath, params) {
    var fullpath = path.join(__dirname, 'views', filepath + '.mustache');
    return Mustache.render(fs.readFileSync(fullpath, 'utf8'), params);
  }
  next();
});

journeyman.use(lightning.middleware());
journeyman.use(rivulet.middleware());

if (environment == 'development')
  journeyman.use((new Lightning(path.join(__dirname, 'ui'), { prefix: '/ui' })).middleware());

journeyman.use(function(req, res, next) {
  if (req.url === "/favicon.ico")
    res.end();
  else
    next();
});

skynet.once('connected', function() {
  journeyman.listen();
});

