const WriteStream = require('./writable');

function createFileWriter(options = {}) {
  return new WriteStream(options);
}

module.exports = {createFileWriter};
// es2015 default export compatibility
module.exports.default = module.exports;
