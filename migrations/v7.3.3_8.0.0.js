var _ = require('lodash');
var migrateAllSituations = require('./migrations').migrateAllSituations;

var mapping = {
    'clca': 'paje_clca',
    'prepare': 'paje_prepare',
    'primeActivite': 'ppa'
};

var keys = _.keys(mapping);

migrateAllSituations(function(situation) {
    var isSituationUpdated = false;
    situation.individus.forEach(function (individu) {
        keys.forEach(function(key) {
            var index = _.indexOf(individu.interruptedRessources, key);
            if (index> -1) {
                individu.interruptedRessources[index] = mapping[key];
                isSituationUpdated = true;
            }
        });
        individu.ressources.forEach(function(ressource) {
            if (_.contains(keys, ressource.type)) {
                ressource.type = mapping[ressource.type];
                isSituationUpdated = true;
            }
        });
    });
    return isSituationUpdated;
});
