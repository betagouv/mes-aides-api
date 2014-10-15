var _ = require('lodash');

module.exports = {
    parents: {
        fn: function(situation) {
            return _.pluck(_.filter(situation.individus, function(individu) {
                return _.contains(['demandeur', 'conjoint'], individu.role);
            }), '_id');
        }
    },
    enfants: {
        fn: function(situation) {
            var enfants = _.pluck(_.filter(situation.individus, {role: 'enfant'}), '_id');
            var personnesACharge = _.pluck(_.filter(situation.individus, {role: 'personneACharge'}), '_id');
            return enfants.concat(personnesACharge); 
        }
    },
    proprietaire_proche_famille: {
        fn: function(situation) {
            return situation.logement.membreFamilleProprietaire;
        }
    }
};
