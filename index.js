var express = require('express');
var app = express();
var fs = require('fs-extra');
var pics = [];

var limit = 5;
var interval = 1 * 10 * 1000; // 1 minute
var imagesDir = __dirname + '/public/img/';

console.log(imagesDir);

fs.readdir(imagesDir, function (err, files) {
  console.log('got here');

  if (err) {
    console.log('error reading old images', err);
    return;
  }

  console.log(files);

  files.forEach(function (file) {
    if (file.match(/\.jpg$/)) {
      pics.unshift({
        src : '/public/img/' + file
      });
    }
  });

  console.log(pics);
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
        console.log('error removing file', oldest, err);
        return;
      }

      console.log('cleanup complete');
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

  console.log('taking a picture', filename);

  exec('fswebcam -r 640*480 -d /dev/video0 ' + fullFilename, function (err, stdout, stderr) {
    if (err) {
      console.log('error taking picture', err);
      return;
    }

    console.log('took a picture');

    pics.push({ src : '/public' + filename });
    cleanup();
  });
}

app.listen(3000);
takePicture();

console.log('app started on localhost:3000');
