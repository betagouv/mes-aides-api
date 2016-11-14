var _ = require('lodash');
var common = require('./common');

module.exports = {
    personne_de_reference: {
        fn: function(situation) {
            return _.find(situation.individus, { role: 'demandeur' })._id;
        }
    },
    conjoint: {
        fn: function(situation) {
            var conjoint = _.find(situation.individus, { role: 'conjoint' });
            return conjoint ? conjoint._id : null;
        }
    },
    enfants: {
        fn: common.getEnfants
    },
    statut_occupation_logement: {
        fn: function(situation) {
            var statusOccupationMap = {
                'proprietaireprimoaccedant': 1,
                'proprietaire': 2,
                'locatairenonmeuble': 4,
                'locatairemeublehotel': 5,
                'heberge': 6,
                'locatairefoyer': 7,
                'sans_domicile' : 8
            };
            var logement = situation.logement;
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
        fn: function (situation) { return situation.logement.loyer; },
        round: true
    },
    charges_locatives: {
        fn: function (situation) { return situation.logement.charges; },
        round: true
    },
    depcom: {
        fn: function (situation) { return situation.logement.adresse.codeInsee || null; }
    },
    participation_frais: {
        fn: function (situation) { return situation.logement.participationFrais; }
    },
    coloc: {
        fn: function (situation) {
            return situation.logement.type == 'locataire' && situation.logement.colocation;
        }
    },
    logement_chambre: {
        fn: function (situation) {
            return situation.logement.type == 'locataire' && situation.logement.isChambre;
        }
    },
};
