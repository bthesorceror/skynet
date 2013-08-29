var Mustache = require('mustache');
var EventEmitter = require('events').EventEmitter;
var highlight_list = document.querySelector('#highlighters');

module.exports = function() {
  var emitter = new EventEmitter();

  var highlight_form = document.querySelector('form#highlight_form');
  var new_hightlight = highlight_form.querySelector('input[type="text"]');
  var highlight_list = document.querySelector('#highlighters');
  var template = "<li>{{highlight}}</li>";

  highlight_form.addEventListener('submit', function(e) {
    e.preventDefault();
    var val = new_hightlight.value;
    emitter.emit('highlight', val, new RegExp('(' + val + ')', 'g'), function() {
      var li = Mustache.render(template, { highlight: val })
      highlight_list.innerHTML = li + highlight_list.innerHTML;
    });
    new_hightlight.value = "";
  });

  return emitter;
}
