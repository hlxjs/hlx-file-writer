const stream = require('stream');
const test = require('ava');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const HLS = require('hls-parser');
const {tryCatch} = require('hlx-util');

const {Segment} = HLS.types;

let msn = 0;
let dsn = 0;

function createSegment(uri) {
  return new Segment({
    uri,
    data: Buffer.alloc(10),
    mediaSequenceNumber: msn++,
    discontinuitySequence: dsn++
  });
}

class MockReadStream extends stream.Readable {
  constructor() {
    super({objectMode: true});
    this.consumed = false;
  }

  _read() {
    if (this.consumed) {
      return;
    }
    let data;
    data = HLS.parse(`
      #EXTM3U
      #EXT-X-STREAM-INF:BANDWIDTH=1280000,AVERAGE-BANDWIDTH=1000000,CODECS="avc1.640029,mp4a.40.2"
      /media.example.com/low.m3u8
      #EXT-X-STREAM-INF:BANDWIDTH=2560000,AVERAGE-BANDWIDTH=2000000,CODECS="avc1.640029,mp4a.40.2"
      /media.example.com/mid.m3u8
      #EXT-X-STREAM-INF:BANDWIDTH=7680000,AVERAGE-BANDWIDTH=6000000,CODECS="avc1.640029,mp4a.40.2"
      /media.example.com/high.m3u8
    `);
    data.uri = '/media.example.com/master.m3u8';
    this.push(data);
    data = HLS.parse(`
      #EXTM3U
      #EXT-X-VERSION:3
      #EXT-X-TARGETDURATION:10
      #EXTINF:9.009,
      /media.example.com/low/01.ts
      #EXTINF:9.009,
      /media.example.com/low/02.ts
      #EXTINF:3.003,
      /media.example.com/low/03.ts
      #EXT-X-ENDLIST
    `);
    data.uri = '/media.example.com/low.m3u8';
    this.push(data);
    this.push(createSegment('/media.example.com/low/01.ts'));
    this.push(createSegment('/media.example.com/low/02.ts'));
    this.push(createSegment('/media.example.com/low/03.ts'));
    data = HLS.parse(`
      #EXTM3U
      #EXT-X-VERSION:3
      #EXT-X-TARGETDURATION:10
      #EXTINF:9.009,
      /media.example.com/mid/01.ts
      #EXTINF:9.009,
      /media.example.com/mid/02.ts
      #EXTINF:3.003,
      /media.example.com/mid/03.ts
      #EXT-X-ENDLIST
    `);
    data.uri = '/media.example.com/mid.m3u8';
    this.push(data);
    this.push(createSegment('/media.example.com/mid/01.ts'));
    this.push(createSegment('/media.example.com/mid/02.ts'));
    this.push(createSegment('/media.example.com/mid/03.ts'));
    data = HLS.parse(`
      #EXTM3U
      #EXT-X-VERSION:3
      #EXT-X-TARGETDURATION:10
      #EXTINF:9.009,
      /media.example.com/high/01.ts
      #EXTINF:9.009,
      /media.example.com/high/02.ts
      #EXTINF:3.003,
      /media.example.com/high/03.ts
      #EXT-X-ENDLIST
    `);
    data.uri = '/media.example.com/high.m3u8';
    this.push(data);
    this.push(createSegment('/media.example.com/high/01.ts'));
    this.push(createSegment('/media.example.com/high/02.ts'));
    this.push(createSegment('/media.example.com/high/03.ts'));
    this.push(null);
    this.consumed = true;
  }
}

class NullWriteStream extends stream.Writable {
  constructor() {
    super({objectMode: true});
  }

  _write(chunk, encoding, cb) {
    setImmediate(cb);
  }
}

test.cb('writeStream.onlySegments', t => {
  const mockFs = {
    writeFile(path, _, cb) {
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
  const mockFile = proxyquire('../../file', {fs: mockFs, 'hlx-util': mockUtil});
  const WriteStream = proxyquire('../../writable', {'./file': mockFile});
  const spyWriteFile = sinon.spy(mockFs, 'writeFile');

  const src = new MockReadStream();
  const fileOutput = new WriteStream({outputDir: '/var/foo/'});
  const dest = new NullWriteStream();
  src.pipe(fileOutput).pipe(dest)
  .on('finish', () => {
    t.is(spyWriteFile.callCount, 9);
    t.end();
  });
});

test.cb('writeStream.all', t => {
  const mockFs = {
    writeFile(path, _, cb) {
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
  const mockFile = proxyquire('../../file', {fs: mockFs, 'hlx-util': mockUtil});
  const WriteStream = proxyquire('../../writable', {'./file': mockFile});
  const spyWriteFile = sinon.spy(mockFs, 'writeFile');

  const src = new MockReadStream();
  const fileOutput = new WriteStream({outputDir: '/var/foo/', storePlaylist: true});
  const dest = new NullWriteStream();
  src.pipe(fileOutput).pipe(dest)
  .on('finish', () => {
    t.is(spyWriteFile.callCount, 13);
    t.end();
  });
});
