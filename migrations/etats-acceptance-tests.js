'use strict';

var mongoose = require('mongoose');
var config = require('../lib/config/config');

require('../lib/config/mongoose')(mongoose, config);

var AcceptanceTest = mongoose.model('AcceptanceTest');

var stream = AcceptanceTest.find().stream();

stream.on('data', function(acceptanceTest) {
    var currentState = acceptanceTest.get('state');

    if (typeof currentState !== 'undefined') {
        console.log('nothing to do');
        return;
    }

    var validated = acceptanceTest.get('validated');
    var state;
    if (typeof validated === 'undefined') {
        state = 'pending';
    } else if (validated === true) {
        state = 'validated';
    } else {
        state = 'error';
    }

    acceptanceTest
        .set('validated', undefined, {strict: false})
        .set('state', state)
        .save(function(err) {
            if (err) return console.trace(err);
            console.log('saved');
        });
});

stream.on('end', function() {
    console.log('completed!');
    //process.exit();
});

stream.on('error', function(err) {
    console.trace(err);
});
