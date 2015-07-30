var _ = require('lodash');
var moment = require('moment');
var mapping = require('./');

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
            var enfants = _.filter(situation.individus, function(individu) {
                return mapping.isIndividuValid(individu, situation) && individu.role == 'enfant';
            });
            return _.pluck(enfants, '_id');
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
