var _ = require('lodash');

var periods = require('./periods');
var PRESTATIONS = require('../prestations');


module.exports = function reverseMap(openFiscaResponse, situation) {
    var period = periods.map(situation.dateDeValeur);

    var injectedRessources = _.uniq(_.flatten(_.map(situation.individus, function(individu) {
        return _.collect(individu.ressources, 'type');
    })));
    var injectedPrestations = _.intersection(_.keys(PRESTATIONS), injectedRessources);

    // Openfisca famille object, which contains the values of computed prestations
    var openFiscaFamille = openFiscaResponse.value[0].familles[0];

    return _.mapValues(PRESTATIONS, function(format, prestationName) {

        // For prestations that have been injected by the user and not calculated by the simulator, put null to allow specific treatment in the ui
        if (_.contains(injectedPrestations, prestationName)) {
            return null;
        }

        var type = format.type,
            computedPrestation = openFiscaFamille[prestationName],
            result = computedPrestation[period];

        var uncomputabilityReason = openFiscaFamille[prestationName + '_non_calculable'] && openFiscaFamille[prestationName + '_non_calculable'][period];

        if (uncomputabilityReason) {
            return uncomputabilityReason;
        }

        if (format.montantAnnuel) {
            result *= 12;
        }

        if (type == Number) {
            result = Number(result.toFixed(2));
        }
        return result;
    });
};
