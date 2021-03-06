[![Build Status](https://travis-ci.org/hlxjs/hlx-file-writer.svg?branch=master)](https://travis-ci.org/hlxjs/hlx-file-writer)
[![Coverage Status](https://coveralls.io/repos/github/hlxjs/hlx-file-writer/badge.svg?branch=master)](https://coveralls.io/github/hlxjs/hlx-file-writer?branch=master)
[![Dependency Status](https://david-dm.org/hlxjs/hlx-file-writer.svg)](https://david-dm.org/hlxjs/hlx-file-writer)
[![Development Dependency Status](https://david-dm.org/hlxjs/hlx-file-writer/dev-status.svg)](https://david-dm.org/hlxjs/hlx-file-writer#info=devDependencies)
[![Known Vulnerabilities](https://snyk.io/test/github/hlxjs/hlx-file-writer/badge.svg)](https://snyk.io/test/github/hlxjs/hlx-file-writer)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

# hlx-file-writer
A writable stream to save HLS playlists/segments as local files

## Features
* Being used with other [`hlx`](https://github.com/hlxjs) objects, it provides a functionality to write every HLS related data (playlist and segments) to your local filesystem.
* It determines the local path for each files based on the `uri` described in the HLS playlist.
* The hostname contained in the `uri` will be ignored (e.g. "https://foo.bar/abc/def.m3u8" is translated into "{outputDir}/abc/def.m3u8")
* If the `uri` is a file url, users can specify a root directory (`inputDir`) from which the file should be read (e.g. "file://path/to/abc/def.m3u8", inputDir="/path/to", is translated into "{outputDir}/abc/def.m3u8")

## Install
[![NPM](https://nodei.co/npm/hlx-file-writer.png?mini=true)](https://nodei.co/npm/hlx-file-writer/)

## Usage

```js
const {createReadStream} = require('hlx-file-reader');
const {createUrlRewriter} = require('hlx-url-rewriter');
const {createWriteStream} = require('hlx-file-writer'); // file-writer
const {createTerminator} = require('hlx-terminator')

const src = createReadStream('https://foo.bar/sample.m3u8');
const rewrite = createUrlRewriter();
const save = createWriteStream({
  outputDir: '/var/www/media/',
  storePlaylist: true
});
const dest = createTerminator();

// Write all playlists/segments to your local filesystem
src.pipe(rewrite).pipe(save).pipe(dest)
.on('error', err => {
  console.log(err.stack);
});
```
## API
The features are built on top of the Node's [transform streams](https://nodejs.org/api/stream.html#stream_class_stream_transform).

### `createWriteStream([options])`
Creates a new `TransformStream` object.

#### params
| Name    | Type   | Required | Default | Description   |
| ------- | ------ | -------- | ------- | ------------- |
| options | object | No       | {}      | See below     |

#### options
| Name        | Type   | Default | Description                       |
| ----------- | ------ | ------- | --------------------------------- |
| inputDir | string | / | The root directory from which all the files are read (This option is only used in case of file urls) |
| outputDir | string | process.CWD()     | The root directory to which all the files are written |
| storePlaylist | boolean | false   | If true, the playlist files are also stored as local files |

#### return value
An instance of `TransformStream`.
