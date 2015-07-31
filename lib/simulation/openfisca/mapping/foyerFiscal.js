var _ = require('lodash');
var moment = require('moment');
var common = require('./common');

module.exports = {
    declarants: {
        fn: function(situation) {
            return _.pluck(_.filter(situation.individus, function(individu) {
                return _.contains(['demandeur', 'conjoint'], individu.role);
            }), '_id');
        }
    },
    // Aujourd'hui, dans mes-aides, tous les enfant et seuls les enfants sont transmis à Openfisca comme personnes à charge
    personnes_a_charge: {
        fn: common.getEnfants
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
