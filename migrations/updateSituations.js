var mongoose = require('mongoose');
var es = require('event-stream');
var config = require('../lib/config/config');

require('../lib/config/mongoose')(mongoose, config);

var Situation = mongoose.model('Situation');

Situation.find({ status: 'test' }).stream()
    .pipe(es.map(function (situation, done) {
        var isSituationUpdated = false;
        situation.individus.forEach(function (individu) {
            if (individu.role == 'personneACharge') {
                individu.role = 'enfant';
                isSituationUpdated  = true;
            }
            if (individu.statutMarital == 'relation_libre') {
                individu.statutMarital = 'union_libre';
                isSituationUpdated  = true;
            }
            individu.ressources.forEach(function (ressource) {
                if (ressource.type == 'allocationLogement') {
                    ressource.type = 'aide_logement';
                    isSituationUpdated  = true;
                }
                if (ressource.type == 'revenusNonSalarie') {
                    ressource.type = 'caAutoEntrepreneur';
                    console.log('Change ressource.type from "revenusNonSalarie" to "caAutoEntrepreneur" in ' + situation.id);
                    isSituationUpdated  = true;
                }
                if (ressource.type == 'paje') {
                    ressource.type = 'paje_base';
                    isSituationUpdated  = true;
                }
            });
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
