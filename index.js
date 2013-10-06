var express = require('express');
var app = express();
var fs = require('fs-extra');
var pics = [];

var limit = 5;
var interval = 1 * 60 * 1000; // 1 minute

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
    var oldest = pics.shift();
    fs.remove(oldest, function (err) {
      if (err) {
        console.log('error removing file', oldest, err);
        return;
      }

      setTimeout(takePicture, interval);
    });
  }
}

function takePicture () {
  var exec = require('child_process').exec;
  var filename = '/img/olivercam-' + new Date().getTime() + '.jpg';
  var fullFilename = __dirname + '/public' + filename

  exec('fswebcam -r 640*480 -d /dev/video0 ' + fullFilename, function (err, stdout, stderr) {
    if (err) {
      console.log('error taking picture', err);
      return;
    }

    pics.push({ src : filename });
    cleanup();
  });
}

app.listen(3000);