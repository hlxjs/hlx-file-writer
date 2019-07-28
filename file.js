const fs = require('fs');
const path = require('path');

const {tryCatch, mkdirP} = require('hlx-util');

function storeData({uri, data}, rootPath) {
  if (!data) {
    return Promise.reject(new Error('No segment data'));
  }

  if (!path.isAbsolute(rootPath)) {
    rootPath = path.join(process.cwd(), rootPath);
  }

  let localPath;

  if (path.isAbsolute(uri)) {
    localPath = path.join(rootPath, uri);
  } else {
    const obj = tryCatch(
      () => new URL(uri),
      () => new URL(uri, rootPath),
      () => null
    );
    localPath = path.join(rootPath, obj ? obj.pathname : uri);
  }

  // Create directory
  mkdirP(path.dirname(localPath));

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
    data.pipe(fs.createWriteStream(localPath))
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
