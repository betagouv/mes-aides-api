var mongoose = require('mongoose');
var es = require('event-stream');
var async = require('async');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('../lib/config/config');
require('../lib/config/mongoose')(mongoose, config);

var AcceptanceTest = mongoose.model('AcceptanceTest');
var AcceptanceTestExecution = mongoose.model('AcceptanceTestExecution');

function migrateAcceptanceTests(stepDone) {

    AcceptanceTest.find().stream()
        .pipe(es.map(function (acceptanceTest, done) {
            
            acceptanceTest.expectedResults.forEach(function (expectedResult) {
                expectedResult.set('expectedValue', expectedResult.get('value', { strict: false }));
                expectedResult.set('value', undefined, { strict: false });
            });

            acceptanceTest.save(done);

        }))
        .on('end', function() {
            console.log('Tests migrés !');
            stepDone();
        })
        .on('error', function(err) {
            console.trace(err);
            stepDone(err);
        })
        .resume();

}

function cleanExecutions(stepDone) {
    AcceptanceTestExecution.remove({}, function(err) {
        if (err) {
            console.trace(err);
            return stepDone(err);
        }

        console.log('Historique d\'exécution des tests nettoyé !');
        stepDone();
    });
}

var steps = [
    migrateAcceptanceTests,
    cleanExecutions
];

async.parallel(steps, function(err) {
    if (err) {
        console.log('Une erreur est survenue !');
    } else {
        console.log('Migration terminée !');
    }
    process.exit();
});
