var _ = require('lodash');
var common = require('./common');

module.exports = {
    personne_de_reference: {
        fn: function(situation) {
            return _.find(situation.individus, { role: 'demandeur' }).id;
        },
        copyTo3PreviousMonths: false,
    },
    conjoint: {
        fn: function(situation) {
            var conjoint = _.find(situation.individus, { role: 'conjoint' });
            return conjoint ? conjoint.id : null;
        },
        copyTo3PreviousMonths: false,
    },
    enfants: {
        fn: common.getEnfants,
        copyTo3PreviousMonths: false,
    },
    statut_occupation_logement: {
        fn: function(situation) {
            var statusOccupationMap = {
                'proprietaireprimoaccedant': 'Accédant à la propriété',
                'proprietaire': 'Propriétaire (non accédant) du logement',
                'locatairenonmeuble': 'Locataire ou sous-locataire d‘un logement loué vide non-HLM',
                'locatairemeublehotel': 'Locataire ou sous-locataire d‘un logement loué meublé ou d‘une chambre d‘hôtel',
                'heberge': 'Logé gratuitement par des parents, des amis ou l‘employeur',
                'locatairefoyer': 'Locataire d‘un foyer (résidence universitaire, maison de retraite, foyer de jeune travailleur, résidence sociale...)',
                'sansDomicile' : 'Sans domicile stable'
            };
            var logement = situation.logement;
            var type = logement.type;
            if (type) {
                var statusOccupationId = type;
                if (type == 'proprietaire' && logement.primoAccedant) {
                    statusOccupationId = 'proprietaireprimoaccedant';
                }
                if (type == 'locataire' && logement.locationType) {
                    statusOccupationId += logement.locationType;
                }
                return statusOccupationMap[statusOccupationId];
            }
        }
    },
    loyer: {
        fn: function (situation) { return situation.logement.loyer; }
    },
    charges_locatives: {
        fn: function (situation) { return situation.logement.charges; }
    },
    depcom: {
        fn: function (situation) { return situation.logement.adresse.codeInsee || null; }
    },
    participation_frais: {
        fn: function (situation) { return situation.logement.participationFrais; }
    },
    coloc: {
        fn: function (situation) {
            return (situation.logement.type == 'locataire' && situation.logement.colocation) || situation.logement.colocation;
        }
    },
    logement_chambre: {
        fn: function (situation) {
            return (situation.logement.type == 'locataire' && situation.logement.isChambre) || situation.logement.isChambre;
        }
    },
};
