var mongoose = require('mongoose');
var es = require('event-stream');
var config = require('../lib/config/config');

require('../lib/config/mongoose')(mongoose, config);

var Situation = mongoose.model('Situation');

// When running this migration script, situationsPro must be temporarily added to the situation model.

Situation.find({ status: 'test' }).stream()
    .pipe(es.map(function (situation, done) {
        var isSituationUpdated = false;
        situation.individus.forEach(function (individu) {
            individu.specificSituations = individu.situationsPro;
            delete individu.situationsPro;
            isSituationUpdated = true;
        });
        situation.save(function (err) {
            if (err) {
                console.log('Cannot save migrated situation %s', situation.id);
                console.trace(err);
            }
            else if (isSituationUpdated)
                console.log('Situation migrée');
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
