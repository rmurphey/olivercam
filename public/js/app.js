(function () {

var picturesEl;
var scripts = document.getElementsByTagName('script');
var thisScript = scripts[scripts.length - 1];
var hostname = thisScript.getAttribute('data-hostname');

var socket = io.connect('http://' + hostname);

socket.on('pictures', function (data) {
  picturesEl = picturesEl || document.getElementById('pictures');

  var frag = document.createDocumentFragment();
  var li = document.createElement('li');

  li.innerHTML = 'Auto-updated at ' + new Date().toString();
  frag.appendChild(li);

  data.pictures.forEach(function (pic) {
    var li = document.createElement('li');
    var img = document.createElement('img');
    img.src = pic.src;
    li.appendChild(img);
    frag.appendChild(li);
  });

  picturesEl.innerHTML = '';
  picturesEl.appendChild(frag);
});

}());
