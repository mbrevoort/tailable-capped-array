var TCA = require('..')
  , assert = require("assert")
  ;



describe('TailableCappedArray', function(){
  describe('#push()', function(){

    it('should return array of items pushed', function(){
      var arr = new TCA(3);
      var l = [1,2,3];
      l.forEach(function (it) { arr.push(it) });
      assert.deepEqual(arr.toArray(), l);
    })

    it('should filter out null or undefined items pushed', function(){
      var arr = new TCA(5);
      var l = [null,undefined,0, -1, 1];
      var expected = [0,-1,1];
      l.forEach(function (it) { arr.push(it) });
      assert.deepEqual(arr.toArray(), expected);
    })

    it('should return truncated array of items pushed', function(){
      var arr = new TCA(3);
      var l = [1,2,3,4,5];
      var expected = [3,4,5];
      l.forEach(function (it) { arr.push(it) });
      assert.deepEqual(arr.toArray(), expected);
    })

    it('should stream pushed values', function(done){
      var arr = new TCA(3);
      var l = [1,2,3];
      var result = [];
      var count = 0;
      l.forEach(function (it) { arr.push(it) });
      var rs = arr.createReadStream();

      rs.on('data', function (item) {
        result.push(item);
        count++;
        if (count == l.length) {
          assert.deepEqual(l, result);
          arr.destroy();
          done();
        }
      });
    })

    it('should stream truncated pushed values', function(done){
      var arr = new TCA(3);
      var l = [1,2,3,4,5];
      var expected = [3,4,5];
      var result = [];
      var count = 0;

      l.forEach(function (it) { arr.push(it) });
      var rs = arr.createReadStream();

      rs.on('data', function (item) {
        result.push(item);
        count++;
        if (count == expected.length) {
          assert.deepEqual(expected, result);
          arr.destroy();
          done();
        }
      });
    })

    it('should continue to stream pushed values', function(done){
      var arr = new TCA(3);
      var l = [1,2,3];
      var additional = [4,5,6];
      var expected = [1,2,3,4,5,6];
      var result = [];
      var count = 0;
      var assertions = 0;

      l.forEach(function (it) { arr.push(it) });

      var rs = arr.createReadStream();

      rs.on('data', function (item) {
        result.push(item);
        count++;
        if (count === l.length) {
          assert.deepEqual(arr.toArray(), l); assertions++;
          additional.forEach(function (it) { arr.push(it) });
        }
        else if (count === expected.length) {
          assert.deepEqual(expected, result); assertions++;
          assert.equal(assertions, 2);
          arr.destroy();
          done();
        }
      });
    })

    it('should hold stream open', function(done){
      var arr = new TCA(3);
      var l = [1,2,3];
      var assertions = 0;

      l.forEach(function (it) { arr.push(it) });

      var rs = arr.createReadStream();

      rs.on('data', function () {});

      setTimeout(function () {
        assert(rs.readable);
        arr.destroy();
        setTimeout(function() {
          assert(!rs.readable);
          done();
        }, 25);
      }, 100);
    })

    it('destroy should end stream', function(done){
      var arr = new TCA(3);
      var l = [1,2,3];
      var result = [];
      var count = 0;
      l.forEach(function (it) { arr.push(it) });
      var rs = arr.createReadStream();

      rs.on('data', function (item) {
        result.push(item);
        count++;
        if (count == l.length) {
          assert.deepEqual(l, result);
          arr.destroy();
        }
      });

      rs.on('end', function () {
        done();
      });
    })

    it('require a length', function(){
      assert.throws(
        function() {
           new TCA();
        },
        Error
      );
    })

    it('require a positive length', function(){
      assert.throws(
        function() {
           new TCA(-2);
        },
        Error
      );
    })

  })
})
