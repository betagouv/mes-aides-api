var mongoose = require('mongoose');
var es = require('event-stream');
var config = require('../lib/config/config');
var _ = require('lodash');

require('../lib/config/mongoose')(mongoose, config);

var Situation = mongoose.model('Situation');

Situation.find({ status: 'test' }).stream()
    .pipe(es.map(function (situation, done) {

        var isSituationUpdated = false;
        if (situation.logement.type == 'gratuit') {
            situation.logement.type = 'heberge';
            situation.logement.participationFrais = false;
            isSituationUpdated = true;
        }
        if (situation.logement.type == 'payant') {
            situation.logement.type = 'heberge';
            situation.logement.participationFrais = true;
            isSituationUpdated = true;
        }

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
