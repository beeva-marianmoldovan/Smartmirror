var cv = require('opencv');

// camera properties
var camWidth = 320;
var camHeight = 240;
var camFps = 10;
var camInterval = 1000 / camFps;

var lastImage;

function getMethods(obj) {
  var result = [];
  for (var id in obj) {
    try {
      if (typeof(obj[id]) == "function") {
        result.push(id + ": " + obj[id].toString());
      }
    } catch (err) {
      result.push(id + ": inaccessible");
    }
  }
  return result;
}


try {
  var camera = new cv.VideoCapture(0);
  var window = new cv.NamedWindow('Video', 0)
  
  setInterval(function() {
    camera.read(function(err, im) {
      if (err) throw err;
      if(lastImage){
        cv.ImageSimilarity(lastImage, im, function (err, dissimilarity) {
          if (err) throw err;

          console.log('Dissimilarity: ', dissimilarity);
        });
      }
      lastImage = im;
    });
  }, 100);
  
} catch (e){
  console.log("Couldn't start camera:", e)
}