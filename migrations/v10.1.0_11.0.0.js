var _ = require('lodash');
var migrateAllSituations = require('./migrations').migrateAllSituations;

migrateAllSituations(function(situation) {
    situation.individus.forEach(function(individu) {
        individu.id = individu._id;
        delete individu._id;
    });
    return true;
});
