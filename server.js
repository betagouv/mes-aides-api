var express = require('express');
var errorHandler = require('errorhandler');
var morgan = require('morgan');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Setup Express
var app = express();
var env = app.get('env');

if ('development' === env) {
    app.use(morgan('dev'));
}

if ('production' === env) {
    app.use(morgan());
}

// Setup app
app.use('/api', require('./'));

if ('development' === env) {
    app.use(errorHandler());
}

// Start server
app.listen(process.env.PORT, function () {
    console.log('Express server listening on %d, in %s mode', process.env.PORT, app.get('env'));
});

exports = module.exports = app;
