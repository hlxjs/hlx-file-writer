const fs = require('fs');
const path = require('path');
const {mkdirP, buildLocalPath} = require('hlx-util');

function storeData({uri, parentUri, data}, {inputDir, outputDir}) {
  if (!data) {
    return Promise.reject(new Error('No segment data'));
  }

  if (!path.isAbsolute(outputDir)) {
    outputDir = path.join(process.cwd(), outputDir);
  }

  const localPath = buildLocalPath(uri, parentUri, inputDir, outputDir);

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
