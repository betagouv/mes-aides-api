var _ = require('lodash');
var migrateAllSituations = require('./migrations').migrateAllSituations;

migrateAllSituations(function(situation) {
    var isSituationUpdated = false;
    ['revenusLocatifs', 'revenusDuCapital'].forEach(function(revenuType) {
        if (! _.isEmpty(situation.patrimoine[revenuType])) {
            situation.patrimoine[revenuType].forEach(function(revenu) {
                revenu.type = revenuType;
                situation.individus[0].ressources.push(revenu);
            });
        }
        situation.patrimoine[revenuType] = undefined;
        isSituationUpdated = true;
    });
    return isSituationUpdated;
});
