var _ = require('lodash');
var common = require('./common');

module.exports = {
    parents: {
        fn: function(situation) {
            return _.map(_.filter(situation.individus, function(individu) {
                return _.includes(['demandeur', 'conjoint'], individu.role);
            }), '_id');
        },
        isNotDated: true,
    },
    enfants: {
        fn: common.getEnfants,
        isNotDated: true,
    },
    proprietaire_proche_famille: {
        fn: function(situation) {
            return situation.logement.membreFamilleProprietaire;
        }
    },
    rsa_isolement_recent: {
        fn: function(situation) {
            return situation.individus[0].isolementRecent;
        }
    },
    parisien: {
        fn: function(situation) { return situation.logement.inhabitantForThreeYearsOutOfLastFive; }
    },

};
