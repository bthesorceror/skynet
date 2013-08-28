var Mustache = require('mustache');

var template    = "<li><b>{{nick}}</b> -- {{message}}</li>";
var channel     = document.querySelector('meta[name="channel"]').getAttribute('content');
var eventsource = new EventSource('/rivulets/messages_' + channel);
var list        = document.querySelector('ul#messages');

function addMessage(data) {
  var rendered = Mustache.render(template, data);
  list.innerHTML = rendered + list.innerHTML;
}

eventsource.addEventListener('message', function(message) {
  addMessage(JSON.parse(message.data));
});
