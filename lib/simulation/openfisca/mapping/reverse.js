var _ = require('lodash');

var periodTools = require('./periodTools');
var PRESTATIONS = require('../prestations');
var ressourcesMapping = require('./ressources');


module.exports = function reverseMap(openfiscaResponse, situation) {
    var period = periodTools.toOpenFiscaFormat(situation.dateDeValeur);

    var injectedRessources = _.uniq(_.flatten(_.map(situation.individus, function(individu) {
        return _.collect(individu.ressources, 'type');
    })));

    var injectedPrestations = _.keys(PRESTATIONS).filter(function(prestationOpenFiscaId) {
        var prestationMesAidesId = ressourcesMapping.famille[prestationOpenFiscaId] || ressourcesMapping.individu[prestationOpenFiscaId];
        return injectedRessources.indexOf(prestationMesAidesId) >= 0;
    });

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
