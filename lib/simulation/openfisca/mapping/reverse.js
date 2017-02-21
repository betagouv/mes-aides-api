var _ = require('lodash');

var periodTools = require('./periodTools');
var PRESTATIONS = require('../prestations');


module.exports = function reverseMap(openfiscaResponse, situation) {
    var period = periodTools.toOpenFiscaFormat(situation.dateDeValeur);

    var injectedRessources = _.uniq(_.flatten(_.map(situation.individus, function(individu) {
        return _.collect(individu.ressources, 'type');
    })));
    var injectedPrestations = _.intersection(_.keys(PRESTATIONS), injectedRessources);

    // Computed prestations can be in the 'familles' or 'individus' openfisca entity
    var openfiscaResults = _.merge(openfiscaResponse.value[0].familles[0], openfiscaResponse.value[0].individus[0]);

    var calculatedPrestations = _.pick(PRESTATIONS, function(format, prestationName) {
        return injectedPrestations.indexOf(prestationName) < 0;
    });

    return {
        injectedPrestations: injectedPrestations,
        calculatedPrestations: _.mapValues(calculatedPrestations, function(format, prestationName) {
            var result = openfiscaResults[prestationName] && openfiscaResults[prestationName][period],
                uncomputabilityReason = openfiscaResults[prestationName + '_non_calculable'] && openfiscaResults[prestationName + '_non_calculable'][period];

            if (uncomputabilityReason) {
                return uncomputabilityReason;
            }

            if (format.type == Number) {
                result = Number(result.toFixed(2));
            }
            return result;
        }),
    };
};
