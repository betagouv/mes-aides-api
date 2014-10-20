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
    valeur_locative_immo_non_loue: 'valeurLocativeImmoNonLoue',
    valeur_locative_terrains_non_loue: 'valeurLocativeTerrainNonLoue'
};
