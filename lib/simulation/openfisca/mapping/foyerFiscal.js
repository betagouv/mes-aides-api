var _ = require('lodash');

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
    }
};
