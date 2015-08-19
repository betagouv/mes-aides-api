var _ = require('lodash');

var periods = require('./periods');
var PRESTATIONS = require('../prestations');


module.exports = function reverseMap(openFiscaFamille, date, injectedRessources) {
    var period = periods.map(date);
    var injectedPrestations = _.intersection(_.keys(PRESTATIONS), injectedRessources)

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
