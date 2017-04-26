var _ = require('lodash');
var migrateAllSituations = require('./migrations').migrateAllSituations;

var ressourceMapping = {
    'allocationsChomage': 'chomage_net',
    'allocationSecurisationPro' : 'allocation_securisation_professionnelle',
    'autresRevenusTns' : 'tns_autres_revenus',
    'autresRevenusTnsActiviteType': 'tns_autres_revenus_type_activite',
    'bourseEnseignementSup': 'bourse_enseignement_sup',
    'bourseRecherche': 'bourse_recherche',
    'caAutoEntrepreneur': 'tns_auto_entrepreneur_chiffre_affaires',
    'caMicroEntreprise' : 'tns_micro_entreprise_chiffre_affaires',
    'complementAAH': 'caah',
    'dedommagementAmiante': 'dedommagement_victime_amiante',
    'gainsExceptionnels': 'gains_exceptionnels',
    'indChomagePartiel': 'indemnites_chomage_partiel',
    'indJourAccidentDuTravail': 'indemnites_journalieres_accident_travail',
    'indJourMaladie': 'indemnites_journalieres_maladie',
    'indJourMaladieProf': 'indemnites_journalieres_maladie_professionnelle',
    'indJourMaternite': 'indemnites_journalieres_maternite',
    'indVolontariat': 'indemnites_volontariat',
    'pensionsAlimentairesVersees' : 'pensions_alimentaires_versees_individu',
    'pensionsInvalidite': 'pensions_invalidite',
    'pensionsRetraitesRentes': 'retraite_nette',
    'prestationCompensatoire': 'prestation_compensatoire',
    'primeRepriseActivite': 'prime_forfaitaire_mensuelle_reprise_activite',
    'retraiteCombattant': 'retraite_combattant',
    'revenusAgricolesTns': 'tns_benefice_exploitant_agricole',
    'revenusDuCapital': 'revenus_capital',
    'revenusLocatifs': 'revenus_locatifs',
    'revenusStageFormationPro': 'revenus_stage_formation_pro',
    'rncPensionsRetraitesRentes': 'retraite_imposable',
    'stage': 'indemnites_stage',
    'clca': 'paje_clca',
    'prepare': 'paje_prepare',
    'primeActivite': 'ppa'
};

var ressourceKeys = _.keys(ressourceMapping);

var individuPropertyMapping = {
    'autresRevenusTnsActiviteType': 'tns_autres_revenus_type_activite'
};

var individuPropertyKeys = _.keys(individuPropertyMapping);

migrateAllSituations(function(situation) {
    var isSituationUpdated = false;
    situation.individus.forEach(function (individu) {

        individuPropertyKeys.forEach(function(key) {
            if (individu[key]) {
                individu[individuPropertyMapping[key]] = individu.autresRevenusTnsActiviteType;
                delete individu[key];
                isSituationUpdated = true;
            }
        });

        ressourceKeys.forEach(function(key) {
            var index = _.indexOf(individu.interruptedRessources, key);
            if (index> -1) {
                individu.interruptedRessources[index] = ressourceMapping[key];
                isSituationUpdated = true;
            }
        });
        individu.ressources.forEach(function(ressource) {
            if (_.contains(ressourceKeys, ressource.type)) {
                ressource.type = ressourceMapping[ressource.type];
                isSituationUpdated = true;
            }
        });
    });
    return isSituationUpdated;
});
