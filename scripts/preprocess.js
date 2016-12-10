var pp = require('preprocess');
var config = require('../config');

config.appConfig = JSON.stringify(config.appConfig);

// Preprocess files synchronously 
pp.preprocessFileSync('src/index.html', 'www/index.html', config);