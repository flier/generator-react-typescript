'use strict';

let path = require('path');
let _ = require('underscore.string');

function baseDir() {
    return path.basename(process.cwd());
}

function appName(appName) {
    return _.camelize(_.slugify(_.humanize(appName || baseDir())));
}

module.exports = {
    baseDir: baseDir,
    appName: appName
};