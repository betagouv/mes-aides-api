var mongoose = require('mongoose');
var _ = require('lodash');
var moment = require('moment');
var config = require('../lib/config/config');

require('../lib/config/mongoose')(mongoose, config);

var AcceptanceTest = mongoose.model('AcceptanceTest');

var stream = AcceptanceTest.find().stream();

stream.on('data', function(acceptanceTest) {
    var droitsAttendus = _.map(acceptanceTest.droitsAttendus, function(droitAttendu) {
        droitAttendu = droitAttendu.toObject();
        return { code: droitAttendu.id, value: droitAttendu.expectedValue };
    });

    acceptanceTest
        .set('droitsAttendus', droitsAttendus)
        .save(function(err) {
            if (err) return console.trace(err);
            console.log('saved');
        });
});

stream.on('end', function() {
    console.log('completed!')
    // process.exit();
});

stream.on('error', function(err) {
    console.trace(err);
});
