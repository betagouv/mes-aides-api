var _ = require('lodash');
var migrateAllSituations = require('./migrations').migrateAllSituations;

var ressourceMapping = {
    'allocationsChomage': 'chomage_net',
    'allocationSecurisationPro' : 'allocation_securisation_professionnelle',
    'autresRevenusTns' : 'tns_autres_revenus',
    'autresRevenusTnsActiviteType': 'tns_autres_revenus_type_activite',
    'clca': 'paje_clca',
    'prepare': 'paje_prepare',
    'primeActivite': 'ppa'
};

var ressourceKeys = _.keys(ressourceMapping);

var individuPropertyMapping = {
    'autresRevenusTnsActiviteType': 'tns_autres_revenus_type_activite'
};

var individuPropertyKeys = _.keys(individuPropertyMapping);

migrateAllSituations(function(situation) {
    var isSituationUpdated = false;
    situation.individus.forEach(function (individu) {

        individuPropertyKeys.forEach(function(key) {
            if (individu[key]) {
                individu[individuPropertyMapping[key]] = individu.autresRevenusTnsActiviteType;
                delete individu[key];
                isSituationUpdated = true;
            }
        });

        ressourceKeys.forEach(function(key) {
            var index = _.indexOf(individu.interruptedRessources, key);
            if (index> -1) {
                individu.interruptedRessources[index] = ressourceMapping[key];
                isSituationUpdated = true;
            }
        });
        individu.ressources.forEach(function(ressource) {
            if (_.contains(ressourceKeys, ressource.type)) {
                ressource.type = ressourceMapping[ressource.type];
                isSituationUpdated = true;
            }
        });
    });
    return isSituationUpdated;
});
