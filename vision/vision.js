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
  console.log(camera);  
  
  camera.read(function(err, im) {
      if (err) throw err;
      if(lastImage) {
        console.log(im, lastImage);
        var diff = new cv.Matrix(im.width(), im.height());
        aaa = diff.absDiff(im, lastImage);
        console.log(im.bitwiseAnd(im, lastImage));
        console.log(diff.countNonZero());
      }
      lastImage = im;
    });



  // setInterval(function() {
  //   camera.read(function(err, im) {
  //     if (err) throw err;
  //     if(lastImage) {
  //       console.log(im, lastImage);
  //       var diff = new cv.Matrix(im.width(), im.height());
  //       aaa = diff.absDiff(im, lastImage);
  //       console.log(im.bitwiseAnd(im, lastImage));
  //       console.log(diff.countNonZero());
  //     }
  //     lastImage = im;
  //   });
  // }, 250);
  
} catch (e){
  console.log("Couldn't start camera:", e)
}

/*

[ 'row: function row() { [native code] }',
  'col: function col() { [native code] }',
  'pixelRow: function pixelRow() { [native code] }',
  'pixelCol: function pixelCol() { [native code] }',
  'empty: function empty() { [native code] }',
  'get: function get() { [native code] }',
  'set: function set() { [native code] }',
  'pixel: function pixel() { [native code] }',
  'width: function width() { [native code] }',
  'height: function height() { [native code] }',
  'size: function size() { [native code] }',
  'clone: function clone() { [native code] }',
  'crop: function crop() { [native code] }',
  'toBuffer: function toBuffer() { [native code] }',
  'toBufferAsync: function toBufferAsync() { [native code] }',
  'ellipse: function ellipse() { [native code] }',
  'rectangle: function rectangle() { [native code] }',
  'line: function line() { [native code] }',
  'save: function save() { [native code] }',
  'saveAsync: function saveAsync() { [native code] }',
  'resize: function resize() { [native code] }',
  'rotate: function rotate() { [native code] }',
  'copyTo: function copyTo() { [native code] }',
  'pyrDown: function pyrDown() { [native code] }',
  'pyrUp: function pyrUp() { [native code] }',
  'channels: function channels() { [native code] }',
  'convertGrayscale: function convertGrayscale() { [native code] }',
  'convertHSVscale: function convertHSVscale() { [native code] }',
  'gaussianBlur: function gaussianBlur() { [native code] }',
  'medianBlur: function medianBlur() { [native code] }',
  'bilateralFilter: function bilateralFilter() { [native code] }',
  'copy: function copy() { [native code] }',
  'flip: function flip() { [native code] }',
  'roi: function roi() { [native code] }',
  'ptr: function ptr() { [native code] }',
  'absDiff: function absDiff() { [native code] }',
  'addWeighted: function addWeighted() { [native code] }',
  'bitwiseXor: function bitwiseXor() { [native code] }',
  'bitwiseNot: function bitwiseNot() { [native code] }',
  'bitwiseAnd: function bitwiseAnd() { [native code] }',
  'countNonZero: function countNonZero() { [native code] }',
  'canny: function canny() { [native code] }',
  'dilate: function dilate() { [native code] }',
  'erode: function erode() { [native code] }',
  'findContours: function findContours() { [native code] }',
  'drawContour: function drawContour() { [native code] }',
  'drawAllContours: function drawAllContours() { [native code] }',
  'goodFeaturesToTrack: function goodFeaturesToTrack() { [native code] }',
  'houghLinesP: function houghLinesP() { [native code] }',
  'houghCircles: function houghCircles() { [native code] }',
  'inRange: function inRange() { [native code] }',
  'adjustROI: function adjustROI() { [native code] }',
  'locateROI: function locateROI() { [native code] }',
  'threshold: function threshold() { [native code] }',
  'adaptiveThreshold: function adaptiveThreshold() { [native code] }',
  'meanStdDev: function meanStdDev() { [native code] }',
  'cvtColor: function cvtColor() { [native code] }',
  'split: function split() { [native code] }',
  'merge: function merge() { [native code] }',
  'equalizeHist: function equalizeHist() { [native code] }',
  'floodFill: function floodFill() { [native code] }',
  'matchTemplate: function matchTemplate() { [native code] }',
  'templateMatches: function templateMatches() { [native code] }',
  'minMaxLoc: function minMaxLoc() { [native code] }',
  'pushBack: function pushBack() { [native code] }',
  'putText: function putText() { [native code] }',
  'getPerspectiveTransform: function getPerspectiveTransform() { [native code] }',
  'warpPerspective: function warpPerspective() { [native code] }',
  'copyWithMask: function copyWithMask() { [native code] }',
  'setWithMask: function setWithMask() { [native code] }',
  'meanWithMask: function meanWithMask() { [native code] }',
  'shift: function shift() { [native code] }',
  'detectObject: function (classifier, opts, cb){\n  var face_cascade;\n  opts = opts || {};\n  cv._detectObjectClassifiers = cv._detectObjectClassifiers || {};\n\n  if (!(face_cascade = cv._detectObjectClassifiers[classifier])){\n    face_cascade = new cv.CascadeClassifier(classifier);\n    cv._detectObjectClassifiers[classifier] = face_cascade;\n  }\n\n  face_cascade.detectMultiScale(this, cb, opts.scale, opts.neighbors\n    , opts.min && opts.min[0], opts.min && opts.min[1]);\n}',
  'inspect: function (){\n  var size = (this.size()||[]).join(\'x\');\n  return "[ Matrix " + size + " ]";\n}' ]
node: /home/travis/.node-gyp/0.10.36/src/node_object_wrap.h:60: static T* node::ObjectWrap::Unwrap(v8::Handle<v8::Object>) [with T = Matrix]: Assertion `!handle.IsEmpty()' failed.



-*/