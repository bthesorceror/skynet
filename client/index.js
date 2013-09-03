var Mustache = require('mustache');
var fs = require('fs');

(function() {
  var template    = "<li><b>{{nick}}</b> -- {{{message}}}</li>";
  var eventsource = new EventSource('/rivulets/all');
  var channel_template = fs.readFileSync(__dirname + '/index_channel.mustache');
  var container = document.querySelector('section#channels');

  function addMessage(data) {
    var list = document.querySelector('section#' + data.channel + ' ul.messages');
    var rendered = Mustache.render(template, data);
    list.innerHTML = rendered + list.innerHTML;
  }

  function addChannel(data) {
    var rendered = Mustache.render(channel_template, data);
    container.innerHTML += rendered;
  }

  eventsource.addEventListener('message', function(message) {
    var data = JSON.parse(message.data);
    switch (data.action) {
      case 'join':
        addChannel(data);
        break;
      case 'message':
        addMessage(data);
        break;
    }
  });
})();
