var config = require('../config.json');
var path = require('path');
var execSync = require('child_process').execSync;

// clean and move to deploy directory
execSync('rm -rf ' + path.normalize(config.path + '/*'));
execSync('cp dist/* ' + path.normalize(config.path));