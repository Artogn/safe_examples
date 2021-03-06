'use strict';

var gulp = require('gulp');
var utils = require('./utils');
var gutil = require('gulp-util');
var fs = require('fs');
var os = require('os');
var childProcess = require('child_process');
var pathUtil = require('path');
var electronVersion = require(pathUtil.resolve('./node_modules/electron-prebuilt/package.json')).version;

var BINARY_NAME = 'maidsafe_demo_app';
var OUT_FOLDER = 'app_dist';

var packagerPath = pathUtil.resolve('./node_modules/.bin/electron-packager');
if (process.platform === 'win32') {
  packagerPath += '.cmd';
}

var packageForOs = {
  osx: {
    icon: 'resources/osx/icon.icns',
    unpack: '*.dylib',
    platform: 'darwin'
  },
  linux: {
    icon: 'resources/windows/icon.ico',
    unpack: '*.so',
    platform: 'linux'
  },
  windows: {
    icon: 'resources/windows/icon.ico',
    unpack: '*.dll',
    platform: 'win32'
  }
};

var onPackageCompleted = function(code) {
  if (code !== 0) {
    return;
  }
  var packagePath = pathUtil.resolve('.', OUT_FOLDER, BINARY_NAME + '-' + os.platform() + '-' + os.arch());
  var versionFileName = 'version';
  var filesToRemove = [ 'LICENSE', 'LICENSES.chromium.html' ];
  var appVersion = require(pathUtil.resolve('./app/package.json')).version;

  var versionFilePath = pathUtil.resolve(packagePath, versionFileName);

  filesToRemove.forEach(function(fileName) {
    fileName = pathUtil.resolve(packagePath, fileName);
    try {
      fs.unlinkSync(fileName);
    } catch (e) {
      if (e.code === 'ENOENT') {
        gutil.log('%s file not present to be deleted', fileName);
      } else {
        throw e;
      }
    }
  });
  gutil.log('Updating version file');
  fs.writeFileSync(versionFilePath, appVersion);
};

var packageApp = function() {
  var config = packageForOs[utils.os()];
  childProcess.spawn(packagerPath, [
    'build',
    BINARY_NAME,
    '--icon=' + config.icon,
    '--platform=' + config.platform,
    '--prune',
    '--asar',
    '--asar-unpack=' + config.unpack,
    '--out=' + OUT_FOLDER,
    '--arch=' + os.arch(),
    '--version=' + electronVersion,
    '--overwrite'
  ], {
    stdio: 'inherit'
  }).on('exit', onPackageCompleted);
};

gulp.task('package', ['build'], packageApp);
