var express = require('express');
var mongoose = require('mongoose');
var config = require('./lib/config/config');

// Setup mongoose
require('./lib/config/mongoose')(mongoose, config);

// Setup Express
var app = express();

// Setup api
require('./lib/config/api')(app);

module.exports = app;
