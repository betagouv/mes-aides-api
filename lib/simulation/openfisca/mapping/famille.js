var _ = require('lodash');
var common = require('./common');

module.exports = {
    parents: {
        fn: function(situation) {
            return _.pluck(_.filter(situation.individus, function(individu) {
                return _.contains(['demandeur', 'conjoint'], individu.role);
            }), '_id');
        }
    },
    enfants: {
        fn: common.getEnfants
    },
    proprietaire_proche_famille: {
        fn: function(situation) {
            return situation.logement.membreFamilleProprietaire;
        }
    }
};
