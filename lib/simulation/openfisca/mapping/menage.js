var _ = require('lodash');
var mapping = require('./');

module.exports = {
    personne_de_reference: {
        fn: function(logement, situation) {
            return _.find(situation.individus, { role: 'demandeur' })._id;
        }
    },
    conjoint: {
        fn: function(logement, situation) {
            var conjoint = _.find(situation.individus, { role: 'conjoint' });
            return conjoint ? conjoint._id : null;
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
    statut_occupation: {
        fn: function(logement) {
            var statusOccupationMap = {
                'proprietaireprimoaccedant': 1,
                'proprietaire': 2,
                'locatairenonmeuble': 4,
                'locatairemeublehotel': 5,
                'gratuit': 6,
                'locatairefoyer': 7,
                'sans_domicile' : 8
            };
            var type = logement.type;
            if (type) {
                var statusOccupationId = type;
                if (logement.primoAccedant) statusOccupationId += 'primoaccedant';
                if (logement.locationType) statusOccupationId += logement.locationType;
                return statusOccupationMap[statusOccupationId];
            }
        }
    },
    loyer: {
        src: 'loyer',
        round: true
    },
    charges_locatives: {
        src: 'charges',
        round: true
    },
    depcom: {
        fn: function(logement) { return logement.adresse.codeInsee || null; }
    },
    parisien: {
        fn: function(logement) { return logement.inhabitantForThreeYearsOutOfLastFive; }
    }
};
