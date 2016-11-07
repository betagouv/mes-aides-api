var mongoose = require('mongoose');
var es = require('event-stream');
var config = require('../lib/config/config');
var _ = require('lodash');


require('../lib/config/mongoose')(mongoose, config);

var Situation = mongoose.model('Situation');
var DEPRECATED_STATUT_MARITAUX = ['celibataire', 'separe', 'divorce', 'veuf', 'pacs_rompu', 'concubinage_rompu']

// When running this migration script, situationsPro must be temporarily added to the situation model.
function removeSituationsPro(individu) {
    var isSituationUpdated = false;

    if (_.isEmpty(individu.situationsPro) || _.isEqual(individu.situationsPro, individu.specificSituations)) {
            individu.situationsPro = undefined;
            isSituationUpdated = true;
    } else {
        console.log('Inconsistency error');
        console.log(individu.situationsPro);
        console.log(individu.specificSituations);
    }
    return isSituationUpdated;
}

// When running this migration script, specificSituations must be temporarily set to Object (instead of String) in the situation model.
function migrateSpecificSituations(individu) {
    var shouldUpdateSituation = _.isObject(individu.specificSituations[0]);
    if (shouldUpdateSituation) {
        individu.specificSituations = individu.specificSituations.map(function (specificSituation) {
            return specificSituation.situation;
        });
    }
    return shouldUpdateSituation;
}

function migrateStatusMaritaux(individu) {
    var isSituationUpdated = false;
    if (individu.statutMarital && DEPRECATED_STATUT_MARITAUX.indexOf(individu.statutMarital) >= 0) {
        individu.statutMarital = undefined;
        isSituationUpdated = true;
    }
    return isSituationUpdated;
}


Situation.find({ status: 'test' }).stream()
    .pipe(es.map(function (situation, done) {
        var isSituationUpdated = false;
        situation.individus.forEach(function (individu) {
            isSituationUpdated = removeSituationsPro(individu) || isSituationUpdated;
            isSituationUpdated = migrateSpecificSituations(individu) || isSituationUpdated;
            isSituationUpdated = migrateStatusMaritaux(individu) || isSituationUpdated;
        });
        situation.save(function (err) {
            if (err) {
                console.log('Cannot save migrated situation %s', situation.id);
                console.trace(err);
            }
            else if (isSituationUpdated)
                console.log('Situation ' + situation['_id'] + ' migrated');
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
