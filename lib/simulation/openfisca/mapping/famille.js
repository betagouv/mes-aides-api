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
        fn: function(situation) {
            var enfants = _.filter(situation.individus, function(individu) {
                return mapping.isIndividuValid(individu, situation) && individu.role == 'enfant';
            });
            return _.pluck(enfants, '_id');
        }
    },
    proprietaire_proche_famille: {
        fn: function(situation) {
            return situation.logement.membreFamilleProprietaire;
        }
    }
};
