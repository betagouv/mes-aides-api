var mongoose = require('mongoose');
var es = require('event-stream');
var config = require('../lib/config/config');
var _ = require('lodash');

require('../lib/config/mongoose')(mongoose, config);

var Situation = mongoose.model('Situation');

// When running this migration script, situationsPro must be temporarily added to the situation model.

Situation.find({ status: 'test' }).stream()
    .pipe(es.map(function (situation, done) {
        var isSituationUpdated = false;
        if (situation['_id'] == "55afb3b984c8730b6e7431b9" && situation.individus[4]) {
            var newIndividus = _.clone(situation.individus);
            newIndividus = newIndividus.slice(0, 4);
            situation.individus = newIndividus;
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
