var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var fs = require('fs-extra');
var pics = [];
var sockets = [];

var limit = 5;
var interval = 1 * 60 * 1000; // 1 minute
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
    pictures : pics
  });
});

app.engine('jade', require('jade').__express);

function cleanup () {
  if (pics.length > limit) {
    fs.remove(pics.shift(), function (err) {
      if (err) {
        console.error('error removing file', oldest, err);
        return;
      }

      setTimeout(takePicture, interval);
    });
  } else {
    setTimeout(takePicture, interval);
  }
}

function takePicture () {
  var exec = require('child_process').exec;
  var filename = '/img/olivercam-' + new Date().getTime() + '.jpg';
  var fullFilename = __dirname + '/public' + filename

  exec('fswebcam -r 640x480 -d /dev/video0 ' + fullFilename, function (err, stdout, stderr) {
    if (err) {
      console.error('error taking picture', err);
      return;
    }

    pics.push({ src : '/public' + filename });
    io.sockets.emit('pictures', { pictures : pics });
    cleanup();
  });
}

app.listen(3000);
takePicture();

console.log('app started on localhost:3000');
