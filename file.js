const fs = require('fs');
const path = require('path');

const {getPath} = require('./util');

function storeData({uri, data}, rootPath) {
  if (!data) {
    return Promise.reject(new Error('No segment data'));
  }

  if (!path.isAbsolute(rootPath)) {
    rootPath = path.join(process.cwd(), rootPath);
  }

  const localPath = path.join(rootPath, getPath(uri));

  // Create directory
  const dir = path.dirname(localPath);
  if (!fs.existsSync(dir) || !fs.lstatSync(dir).isDirectory()) {
    fs.mkdirSync(dir, {recursive: true});
  }

  if (typeof data.pipe !== 'function') {
    // Text or Buffer
    return new Promise((resolve, reject) => {
      fs.writeFile(localPath, data, err => {
        if (err) {
          return reject(err);
        }
        return resolve(localPath);
      });
    });
  }

  // Stream
  return new Promise((resolve, reject) => {
    data.pipe(fs.createFileWriter(localPath))
    .on('finish', () => {
      return resolve(localPath);
    })
    .on('error', err => {
      return reject(err);
    });
  });
}

module.exports = {
  storeData
};
