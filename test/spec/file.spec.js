const test = require('ava');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

test.cb('file.storeData.Buffer', t => {
  const mockFs = {
    writeFile(path, data, cb) {
      setImmediate(() => {
        cb(null, path);
      });
    },
    existsSync() {
      return true;
    },
    lstatSync() {
      return {
        isDirectory() {
          return true;
        }
      };
    }
  };

  delete require.cache[require.resolve('fs')];
  const {storeData} = proxyquire('../../file', {fs: mockFs});
  const spyWriteFile = sinon.spy(mockFs, 'writeFile');

  storeData({uri: 'ghi.mp4', data: Buffer.alloc(10)}, '/abc/def/')
  .then(destPath => {
    t.is(destPath, '/abc/def/ghi.mp4');
    t.is(spyWriteFile.callCount, 1);
    t.end();
  });
});

test.cb('file.storeData.Buffer.path', t => {
  const mockFs = {
    writeFile(path, data, cb) {
      setImmediate(() => {
        cb(null, path);
      });
    },
    existsSync() {
      return true;
    },
    lstatSync() {
      return {
        isDirectory() {
          return true;
        }
      };
    }
  };

  delete require.cache[require.resolve('fs')];
  const {storeData} = proxyquire('../../file', {fs: mockFs});
  const spyWriteFile = sinon.spy(mockFs, 'writeFile');

  storeData({uri: '/abc/def/ghi/jkl.mp4', data: Buffer.alloc(10)}, '/abc/def/')
  .then(destPath => {
    t.is(destPath, '/abc/def/ghi/jkl.mp4');
    t.is(spyWriteFile.callCount, 1);
    t.end();
  });
});

test.cb('file.storeData.Stream', t => {
  const mockFs = {
    createWriteStream(path) {
      return {path};
    },
    existsSync() {
      return true;
    },
    lstatSync() {
      return {
        isDirectory() {
          return true;
        }
      };
    }
  };

  delete require.cache[require.resolve('fs')];
  const {storeData} = proxyquire('../../file', {fs: mockFs});
  const spyCreateWriteStream = sinon.spy(mockFs, 'createWriteStream');

  const data = {
    pipe({path}) {
      return {
        on(event, callback) {
          if (event === 'finish') {
            setImmediate(() => {
              callback(path);
            });
          }
          return {on: () => {}};
        }
      };
    }
  };

  storeData({uri: 'ghi.mp4', data}, '/abc/def/')
  .then(destPath => {
    t.is(destPath, '/abc/def/ghi.mp4');
    t.is(spyCreateWriteStream.callCount, 1);
    t.end();
  });
});
