const stream = require('stream');
const debug = require('debug');
const HLS = require('hls-parser');

const {storeData} = require('./file');

const print = debug('hlx-file-writer');

class WriteStream extends stream.Transform {
  constructor(options) {
    super({objectMode: true});
    this.outputDir = options.outputDir || process.cwd();
    this.inputDir = options.inputDir || '/';
    this.shouldStorePlaylist = Boolean(options.storePlaylist);
  }

  _transform(data, _, cb) {
    if (!data || (data.type === 'playlist' && !this.shouldStorePlaylist)) {
      this.push(data);
      return cb();
    }

    let params = data;

    if (data.type === 'playlist') {
      params = {uri: data.uri, parentUri: data.parentUri, data: HLS.stringify(data)};
    }

    storeData(params, this)
    .then(path => {
      print(`The data is written to ${path}`);
      this.push(data);
      cb();
    })
    .catch(err => {
      console.error(err.stack);
      this.push(data);
      cb();
    });
  }
}

module.exports = WriteStream;
