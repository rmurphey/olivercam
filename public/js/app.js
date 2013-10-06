(function () {

var picturesEl = document.getElementById('pictures');

var socket = io.connect('http://10.0.1.9');

socket.on('pictures', function (data) {
  console.log('got data', data);

  var frag = document.createDocumentFragment();

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
