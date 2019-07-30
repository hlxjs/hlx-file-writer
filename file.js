const fs = require('fs');
const path = require('path');
const {URL} = require('url');
const debug = require('debug');
const {tryCatch, mkdirP} = require('hlx-util');

const print = debug('hlx-file-writer');

function storeData({uri, parentUri, data}, {inputDir, outputDir}) {
  if (!data) {
    return Promise.reject(new Error('No segment data'));
  }

  if (!path.isAbsolute(outputDir)) {
    outputDir = path.join(process.cwd(), outputDir);
  }

  let localPath;

  print(`storeData: uri=${uri}, parentUri=${parentUri}, inputDir=${inputDir}, outputDir=${outputDir}`);

  if (path.isAbsolute(uri)) {
    localPath = path.join(outputDir, uri);
  } else {
    const obj = tryCatch(
      () => new URL(uri),
      () => new URL(uri, parentUri),
      () => null
    );
    if (obj) {
      localPath = path.join(outputDir, obj.pathname);
    } else {
      const pathname = path.relative(inputDir, path.join(parentUri, uri));
      localPath = path.join(outputDir, pathname);
    }
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
