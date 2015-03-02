var mongoose = require('mongoose');
var es = require('event-stream');
var config = require('../lib/config/config');

require('../lib/config/mongoose')(mongoose, config);

var Situation = mongoose.model('Situation');

Situation.find({ status: 'test' }).stream()
    .pipe(es.map(function (situation, done) {
        situation.individus.forEach(function (individu) {
            individu.interruptedRessources = [];
        });
        situation.save(function (err) {
            if (err) {
                console.log('Cannot save migrated situation %s', situation.id);
                console.trace(err);
            }
            else console.log('Situation migrée');
            done();
        });
    }))
    .on('end', function() {
        console.log('Terminé');
        process.exit();
    })
    .on('error', function(err) {
        console.trace(err);
        process.exit();
    })
    .resume();
