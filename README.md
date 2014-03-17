Tailable Capped Array
=====================

This is a simple fixed length list that supports tailable readable streams. In
other words, the steam is not ended once all the known data in the array is
written to the stream. Rather the stream remains open and will continue to
stream new items that are pushed.

This is useful for retaining a window of history for live streaming data.

Intended to be used in node.js. If you want it in the browser, I would love a
pull request.

## Install

`npm install tailable-capped-array`


## Sample Usage

    var TCA = require('tailable-capped-array');
    var arr = new TCA(3);
    arr.push(1);
    arr.push(2);
    arr.push('three');
    arr.toArray();  // [1,2,'three']

    arr.push(4,5);
    arr.toArray();  // ['three',4,5]

    var rs = arr.createReadStream();

    rs.on('data', function (item) {
      // called 3 times initially for 'three', 4 and 5
      // called once more when 6 is pushed below
    });

    arr.push(6);

    // end will be called when the array is destroyed
    rs.on('end', function () {...});
    arr.destroy();


#### new TCA(size)

Create a new capped array with `size`

#### push(arg1, arg2, ...)

Push one or multiple items to the list

#### createReadStream()

Returns a tailable readable stream

#### destroy()

Dereferences the array and closes the streams

## License

MIT = see LICENSE file
