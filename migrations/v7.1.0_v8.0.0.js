var _ = require('lodash');
var migrateAllSituations = require('./migrations').migrateAllSituations;

migrateAllSituations(function(situation) {
    if (situation.logement.adresse) {
        situation.logement.commune = situation.logement.adresse;
        situation.logement.adresse = undefined;
        return true;
    }
});
