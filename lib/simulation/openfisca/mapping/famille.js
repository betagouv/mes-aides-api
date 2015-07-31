var _ = require('lodash');
var mapping = require('./');

module.exports = {
    parents: {
        fn: function(situation) {
            return _.pluck(_.filter(situation.individus, function(individu) {
                return _.contains(['demandeur', 'conjoint'], individu.role);
            }), '_id');
        }
    },
    enfants: {
        fn: mapping.getEnfants
    },
    proprietaire_proche_famille: {
        fn: function(situation) {
            return situation.logement.membreFamilleProprietaire;
        }
    }
};
