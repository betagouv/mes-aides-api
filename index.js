var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var openfisca = require('./lib/simulation/openfisca');
var config = require('./lib/config/config');

// Ping OpenFisca
openfisca.ping();
setInterval(openfisca.ping, 30*1000);

// Setup mongoose
require('./lib/config/mongoose')(mongoose, config);

// Setup Passport
require('./lib/config/passport')(passport);

// Setup Express
var app = express();

// Setup api
require('./lib/config/api')(app, passport, config);

module.exports = app;
