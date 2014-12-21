var mongoose = require('mongoose');
var _s = require('underscore.string');
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
            
            // name => name + keywords
            if (acceptanceTest.name.indexOf('[') >= 0) {
                var regexp = /\[(.*?)\]/g;

                // Extract tags to populate keywords
                var tags = acceptanceTest.name.match(regexp).map(function (tag) {
                    return _s.clean(_s.trim(tag.toLowerCase(), '[ ]'));
                });

                acceptanceTest.set('name', acceptanceTest.name.replace(regexp, '').trim());
                acceptanceTest.set('keywords', tags);
            }

            acceptanceTest.set('priority', 'normal');

            // comment => rejectionMessage
            acceptanceTest.set('rejectionMessage', acceptanceTest.get('comment', { strict: false }));
            acceptanceTest.set('comment', undefined, { strict: false });

            // droitsAttendus => expectedResults
            acceptanceTest.set('expectedResults', acceptanceTest.get('droitsAttendus', { strict: false }));
            acceptanceTest.set('droitsAttendus', undefined, { strict: false });

            // derniereExecution => []
            acceptanceTest.set('derniereExecution', undefined, { strict: false });

            // createdBy => user
            acceptanceTest.set('user', acceptanceTest.get('createdBy', { strict: false }));
            acceptanceTest.set('createdBy', undefined, { strict: false });

            var tasks = [function (cb) { acceptanceTest.save(cb); }];

            if (acceptanceTest._created && acceptanceTest.user) {
                tasks.push(function (cb) {
                    acceptanceTest.createActivity({ 
                        type: 'creation',
                        date: acceptanceTest._created,
                        user: acceptanceTest.user
                    }, cb); 
                });
            }

            async.parallel(tasks, function(err) {
                if (err) return done(err);
                done(null, acceptanceTest);
            });

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
