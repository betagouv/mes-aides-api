var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var config = require('./lib/config/config');

// Setup mongoose
require('./lib/config/mongoose')(mongoose, config);

// Setup Passport
require('./lib/config/passport')(passport);

// Setup Express
var app = express();

// Setup api
require('./lib/config/api')(app, passport, config);

module.exports = app;
