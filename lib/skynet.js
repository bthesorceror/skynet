var IrcClient  = require('irc').Client;

function Skynet(server, nick, password) {
  this.server = server;
  this.nick = nick;
  this.password = password;
  this.client = new IrcClient(server, nick);
  this.client.setMaxListeners(0);
  this.client.on('registered', this.onConnect.bind(this));
  this.client.on('error', function(error) {
    this.emit('error', error);
  }.bind(this));
}

(require('util')).inherits(Skynet, (require('events').EventEmitter));

Skynet.prototype.setRivulet = function(rivulet) {
  this.rivulet = rivulet;
}

Skynet.prototype.onConnect = function(message) {
  this.channels = [];
  this.client.say('NickServ', 'IDENTIFY ' + this.password);
  process.nextTick(function() {
    this.emit('connected');
  }.bind(this));
}

Skynet.prototype.isInChannel = function(channel) {
  return this.channels.indexOf(channel) >= 0;
}

Skynet.prototype.handleJoin = function(channel) {
  this.channels.push(channel);
  this.emit('joined', channel);
  if (this.rivulet) {
    this.client.on('message#' + channel, function(nick, message) {
      this.rivulet.send('messages_' + channel, { nick: nick, message: message });
      this.rivulet.send('all', { channel: channel, nick: nick, message: message });
    }.bind(this));
  }
}

Skynet.prototype.join = function(channel, cb) {
  if (!this.isInChannel(channel)) {
    this.client.join('#' + channel, function() {
      this.handleJoin(channel);
      cb();
    }.bind(this));
  } else {
    cb();
  }
}

module.exports = Skynet;
