var moment = require('moment');
var _ = require('lodash');

module.exports = {
    birth: {
        src: 'dateDeNaissance',
        fn: function(dateDeNaissance) {
            return moment(dateDeNaissance).format('YYYY-MM-DD');
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
    inv: {
        src: 'situationsPro',
        fn: function(situationsPro) {
            return !!_.find(situationsPro, { situation: 'handicap' }) ? 1 : 0;
        }
    },
    taux_invalidite: {
        src: 'tauxInvalidite',
        values: {
            nul: 0,
            moins50: 30,
            moins80: 70,
            plus80: 90
        }
    },
    inapte_travail: {
        src: 'situationsPro',
        fn: function(situationsPro) {
            return !!_.find(situationsPro, { situation: 'inapte_travail' }) ? 1 : 0;
        }
    },
    etu: {
        src: 'situationsPro',
        fn: function(situationsPro) {
            return !!_.find(situationsPro, { situation: 'etudiant' }) ? 1 : 0;
        }
    },
    boursier: 'boursier',
    scolarite: {
        fn: function(individu) {
            var values = {
                'inconnue': 0,
                'college': 1,
                'lycee': 2
            };
            return values[individu.scolarite];
        }
    },
    coloc: {
        fn: function(individu, situation) {
            var test = individu.role === 'demandeur' && 'locataire' === situation.logement.type && situation.logement.colocation;
            return test ? 1 : null;
        }
    },
    alt: {
        src: 'situationsPro',
        fn: function(situationsPro) {
            return !!_.find(situationsPro, { situation: 'garde_alternee' }) ? 1 : 0;
        }
    },

    /* Revenus du patrimoine */
    interets_epargne_sur_livrets: {
        src: 'epargneSurLivret',
        fn: function(value) { return 0.01 * value; },
        default: 0
    },
    epargne_non_remuneree: {
        src: 'epargneSansRevenus',
        default: 0
    },
    valeur_locative_immo_non_loue: {
        src: 'valeurLocativeImmoNonLoue',
        default: 0
    },
    valeur_locative_terrains_non_loue: {
        src: 'valeurLocativeTerrainNonLoue',
        default: 0
    },

    /* Activités non-salarié */
    tns_chiffre_affaires_micro_entreprise: 'caMicroEntreprise',
    tns_autres_revenus: 'autresRevenusTns',
    tns_type_structure: {
      src: 'tnsStructureType',
      values: {
          auto_entrepreneur: 0,
          micro_entreprise: 1
      }
    },
    tns_type_activite: 'tnsActiviteType'
};
