var _ = require('lodash');

var periods = require('./periods');
var PRESTATIONS = require('../prestations');


module.exports = function reverseMap(openFiscaFamille, date) {
    var period = periods.map(date);

    return _.mapValues(PRESTATIONS, function(format, prestationName) {
        var type = format.type,
            computedPrestation = openFiscaFamille[prestationName],
            result = computedPrestation[period];

        if (format.montantAnnuel) {
            result *= 12;
        }

        if (type == Number) {
            result = Number(result.toFixed(2));
        }

        if (openFiscaFamille[prestationName + '_non_calculable'] && openFiscaFamille[prestationName + '_non_calculable'][period]) {
            result = NaN;
        }

        return result;
    });
};
