var moment = require('moment');
var _ = require('lodash');

module.exports = {
    birth: {
        src: 'dateDeNaissance',
        fn: function(value) {
            return moment(value).format('YYYY-MM-DD');
        }
    },
    statmarit: {
        src: 'statutMarital',
        values: {
            seul: 2,
            mariage: 1,
            pacs: 5,
            relation_libre: 2
        }
    },
    id: '_id',
    enceinte: 'enceinte',
    ass_precondition_remplie: 'assPreconditionRemplie',
    activite: {
        src: 'situationsPro',
        fn: function(value) {
            var returnValue;
            _.forEach({
                demandeur_emploi: 1,
                etudiant: 2,
                retraite: 3
            }, function(v, k) {
                if (_.find(value, { situation: k })) returnValue = v;
            });
            return returnValue;
        }
    },
    coloc: {
        fn: function(individu, situation) {
            var test = individu.role === 'demandeur' && 'locataire' === situation.logement.type && situation.logement.colocation;
            return test ? 1 : null;
        }
    },

    /* Revenus du patrimoine */
    interets_epargne_sur_livrets: {
        src: 'epargneSurLivret',
        fn: function(value) { return 0.01 * value; }
    },
    epargne_non_remuneree: 'epargneSansRevenus',
    valeur_locative_immo_non_loue: {
        src: 'valeurLocativeImmoNonLoue',
        fn: function(value) { return 12 * value; }
    },
    valeur_locative_terrains_non_loue: {
        src: 'valeurLocativeTerrainNonLoue',
        fn: function(value) { return 12 * value; }
    },
    revenus_locatifs: {
        src: 'revenusLocatifs',
        fn: function(list) {
            var revenusLocatifs = 0;
            _.forEach(list, function(revenuLocatif) {
                if (!revenuLocatif.debutPeriode) {
                    revenusLocatifs += revenuLocatif.montant;
                }
            });
            return 4 * revenusLocatifs;
        }
    },
    revenus_capital: {
        src: 'revenusDuCapital',
        fn: function(list) {
            var revenusDuCapital = 0;
            _.forEach(list, function(revenuDuCapital) {
                if (!revenuDuCapital.debutPeriode) {
                    revenusDuCapital += revenuDuCapital.montant;
                }
            });
            return 4 * revenusDuCapital;
        }
    }
};
