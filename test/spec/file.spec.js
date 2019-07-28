const test = require('ava');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const {tryCatch} = require('hlx-util');

test.cb('file.storeData.Buffer', t => {
  const mockFs = {
    writeFile(path, data, cb) {
      setImmediate(() => {
        cb(null, path);
      });
    }
  };

  const mockUtil = {
    tryCatch,
    mkdirP() {
      // NOP
    }
  };

  delete require.cache[require.resolve('fs')];
  const {storeData} = proxyquire('../../file', {fs: mockFs, 'hlx-util': mockUtil});
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
    }
  };

  const mockUtil = {
    tryCatch,
    mkdirP() {
      // NOP
    }
  };

  delete require.cache[require.resolve('fs')];
  const {storeData} = proxyquire('../../file', {fs: mockFs, 'hlx-util': mockUtil});
  const spyWriteFile = sinon.spy(mockFs, 'writeFile');

  storeData({uri: '/abc/def/ghi/jkl.mp4', data: Buffer.alloc(10)}, '/path/to/')
  .then(destPath => {
    t.is(destPath, '/path/to/abc/def/ghi/jkl.mp4');
    t.is(spyWriteFile.callCount, 1);
    t.end();
  });
});

test.cb('file.storeData.Stream', t => {
  const mockFs = {
    createWriteStream(path) {
      return {path};
    }
  };

  const mockUtil = {
    tryCatch,
    mkdirP() {
      // NOP
    }
  };

  delete require.cache[require.resolve('fs')];
  const {storeData} = proxyquire('../../file', {fs: mockFs, 'hlx-util': mockUtil});
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
