var assert = require('assert')
  , Readable = require('stream').Readable
  ;

function TailableCappedArray (size) {
  assert(typeof size === 'number' && size > 0);
  this.size = size;
  this._array = new Array();

  this._streams = [];
}

TailableCappedArray.prototype.push = function (/* item1, item2,... */) {
  var items = Array.prototype.slice.call(arguments);
  items = items.filter(function (it) { return (it !== undefined && it !== null) });
  if (items.length === 0) return;

  this._array.push.apply(this._array, items);

  while (this._array.length > this.size) {
    this._array.shift();
  }

  // push each item to each stream
  this._streams.forEach(function (stream) {
    items.forEach(stream.push.bind(stream));
  })
}

TailableCappedArray.prototype.toArray = function () {
  return this._array.slice();
}

TailableCappedArray.prototype.createReadStream = function () {

  var stream = new Readable({ objectMode: true });
  var self = this;

  // send array contents front to back (front is oldest)
  this._array.forEach(stream.push.bind(stream));

  // add the new stream to the list of created streams
  this._streams.push(stream);

  function cleanUpSteam () {
    var i = self._array.indexOf(stream);
    if (i > -1) {
      array.splice(i, 1);
    }
  }

  stream.on('error', cleanUpSteam);
  stream.on('close', cleanUpSteam);

  return stream;
}

TailableCappedArray.prototype.destroy = function () {
  this._streams.forEach(function(stream) {
    stream.push(null);
  });
  this._streams = [];
  this._array = [];
}

module.exports = TailableCappedArray;
