var Mustache = require('mustache');
var highlighter = require('./highlighting')();

var highlighters = {};

highlighter.on('highlight', function(val, regex, list) {
  if(!highlighters[val]) {
    highlighters[val] = regex;
    list();
  }
});

(function() {
  var template    = "<li><b>{{nick}}</b> -- {{{message}}}</li>";
  var channel     = document.querySelector('meta[name="channel"]').getAttribute('content');
  var eventsource = new EventSource('/rivulets/messages_' + channel);
  var list        = document.querySelector('ul.messages');

  function addMessage(data) {
    var rendered = Mustache.render(template, data);
    list.innerHTML = rendered + list.innerHTML;
  }

  function preprocess(data) {
    for(var key in highlighters) {
      data.message = data.message.replace(highlighters[key], '<span class="highlight">$1</span>');
    }
    return data;
  }

  eventsource.addEventListener('message', function(message) {
    addMessage(preprocess(JSON.parse(message.data)));
  });
})();
