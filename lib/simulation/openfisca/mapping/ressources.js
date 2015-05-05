var TAUX_CSG_CRDS = 0.029,
    ASSIETTE_COTIS = 0.9825,
    RATIO_NET_BRUT = 0.78;

exports.individu = {
    indemnites_journalieres_maternite: 'indJourMaternite',
    indemnites_journalieres_maladie: 'indJourMaladie',
    indemnites_journalieres_maladie_professionnelle: 'indJourMaladieProf',
    indemnites_journalieres_accident_travail: 'indJourAccidentDuTravail',
    indemnites_volontariat: 'indVolontariat',
    indemnites_chomage_partiel: 'indChomagePartiel',
    chonet: 'allocationsChomage',
    chobrut: {
        src: 'allocationsChomage',
        fn: function(value) {
            return value / (1 - (((0.062 + 0.005) * 0.9825) + 0.028));
        }
    },
    salaire_net: 'revenusSalarie',
    salaire_de_base: {
        src: 'revenusSalarie',
        fn: function(value) { return value / RATIO_NET_BRUT; }
    },
    sali: {
        src: 'revenusSalarie',
        fn: function(revenusSalarie) { return revenusSalarie + TAUX_CSG_CRDS * ASSIETTE_COTIS * revenusSalarie / RATIO_NET_BRUT; }
    },
    rstnet: 'pensionsRetraitesRentes',
    rstbrut: {
        src: 'pensionsRetraitesRentes',
        fn: function(value) {
            // approximation prélèvement moyen de 7.4 % de cotisations sociales (csg-crds)
            return value / 0.926;
        }
    },
    aah: 'aah',
    pensions_alimentaires_percues: ['pensionsAlimentaires', 'rncPensionsAlimentaires'],
    pensions_alimentaires_versees_individu: 'pensionsAlimentairesVersees',
    revenus_locatifs: 'revenusLocatifs',
    revenus_capital: 'revenusDuCapital',
    indemnites_stage: 'stage',
    revenus_stage_formation_pro: 'revenusStageFormationPro',
    allocation_securisation_professionnelle: 'allocationSecurisationPro',
    prime_forfaitaire_mensuelle_reprise_activite: 'primeRepriseActivite',
    dedommagement_victime_amiante: 'dedommagementAmiante',
    prestation_compensatoire: 'prestationCompensatoire',
    retraite_combattant: 'retraiteCombattant',
    pensions_invalidite: 'pensionsInvalidite',
    bourse_enseignement_sup: 'bourseEnseignementSup',
    bourse_recherche: 'bourseRecherche',
    gains_exceptionnels: 'gainsExceptionnels',
    tns_auto_entrepreneur_chiffre_affaires: 'caAutoEntrepreneur',

    // ressourcesYearMoins2Captured
    sal: 'rncRevenusActivite',
    cho: 'rncAutresRevenus',
    rst: 'rncPensionsRetraitesRentes'
};

exports.famille = {
    paje_clca: 'clca',
    paje_prepare: 'prepare'
    // aspa: 'aspa',
    // aide_logement: 'allocationLogement'
};

exports.foyerFiscal = {
    pensions_alimentaires_versees: {
        src: 'rncPensionsAlimentairesVersees',
        fn: function(value) { return -value; }
    }
};
