var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var fs = require('fs-extra');
var pics = [];

var limit = 5;
var interval = 1 * 20 * 1000; // 20 seconds
var imagesDir = __dirname + '/public/img/';

fs.readdir(imagesDir, function (err, files) {
  if (err) {
    console.error('error reading old images', err);
    return;
  }

  files.forEach(function (file) {
    if (file.match(/\.jpg$/)) {
      pics.push({
        src : '/public/img/' + file
      });
    }
  });
});

app.use(express.logger());
app.use('/public', express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.render('index.jade', {
    pageTitle : 'Olivercam',
    pictures : [].concat(pics).reverse(),
    hostname : '10.0.1.9'
  });
});

app.engine('jade', require('jade').__express);

function cleanup () {
  if (pics.length > limit) {
    var picsToRemove = pics.slice(0, limit * -1 + 1);
    var startIndex = 0;

    picsToRemove.forEach(function (pic) {
      fs.remove(pic.src, function (err) {
        if (err) {
          console.error('error removing file', oldest, err);
          startIndex++;
          return;
        }

        pics.splice(startIndex, 1);
      });
    });
  }
}

function takePicture (waitForNextPicture) {
  var exec = require('child_process').exec;
  var filename = '/img/olivercam-' + new Date().getTime() + '.jpg';
  var fullFilename = __dirname + '/public' + filename

  exec('fswebcam -r 640x480 -d /dev/video0 ' + fullFilename, function (err, stdout, stderr) {
    if (err) {
      console.error('error taking picture', err);
      return;
    }

    pics.push({ src : '/public' + filename });
    io.sockets.emit('pictures', { pictures : [].concat(pics).reverse() });
    cleanup();

    if (!waitForNextPicture) {
      setTimeout(takePicture, interval);
    }
  });
}

server.listen(3000);
takePicture();

console.log('app started on localhost:3000');
