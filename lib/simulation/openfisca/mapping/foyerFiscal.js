var _ = require('lodash');
var moment = require('moment');

module.exports = {
    declarants: {
        fn: function(situation) {
            return _.pluck(_.filter(situation.individus, function(individu) {
                return _.contains(['demandeur', 'conjoint'], individu.role);
            }), '_id');
        }
    },
    personnes_a_charge: {
        fn: function(situation) {
            var enfants = _.pluck(_.filter(situation.individus, { role: 'enfant' }), '_id');
            var personnesACharge = _.pluck(_.filter(situation.individus, { role: 'personneACharge' }), '_id');
            return enfants.concat(personnesACharge);
        }
    },
    rfr: {
        fn: function (situation) {
            if (situation.ressourcesYearMoins2Captured) {
                var anneeFiscaleN2 = moment(situation.dateDeValeur).subtract(2, 'years').year();
                var result = {};
                result[anneeFiscaleN2] = situation.rfr;
                return result;
            }
        }
    }
};
