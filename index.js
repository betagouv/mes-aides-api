var express = require('express');
var mongoose = require('mongoose');
var config = require('./lib/config/config');
var ludwigApi = require('ludwig-api');

// Setup mongoose
require('./lib/config/mongoose')(mongoose, config);

// Setup Express
var app = express();

// Mount Ludwig API
var Situation = mongoose.model('Situation');

app.use(ludwigApi({

    mongoose: mongoose,

    possibleValues: require('./config/ludwig'),

    simulate: function (acceptanceTest, done) {
        Situation.findById(acceptanceTest.scenario.situationId).exec(function (err, situation) {
            if (err) return done(err);
            if (!situation) return done(new Error('Situation not found'));
            situation.simulate(done);
        });
    },

    onCreate: function (acceptanceTest, done) {
        var situationId = acceptanceTest.scenario.situationId;

        Situation.findById(situationId).exec(function (err, situation) {
            if (err) return done(err);
            if (!situation) return done(new Error('Situation not found'));
            situation.set('status', 'test');
            situation.save(done);
        });
    }

}));

// Setup api
require('./lib/config/api')(app);

module.exports = app;
