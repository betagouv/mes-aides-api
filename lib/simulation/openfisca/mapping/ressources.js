var TAUX_CSG_CRDS = 0.029,
    ASSIETTE_COTIS = 0.9825,
    RATIO_NET_BRUT = 0.78;

exports.individu = {
    aah: 'aah',
    allocation_securisation_professionnelle: 'allocationSecurisationPro',
    bourse_enseignement_sup: 'bourseEnseignementSup',
    bourse_recherche: 'bourseRecherche',
    caah: 'complementAAH',
    chomage_brut: {
        src: 'allocationsChomage',
        fn: function(value) {
            return value / (1 - (((0.062 + 0.005) * 0.9825) + 0.028));
        }
    },
    chomage_net: 'allocationsChomage',
    dedommagement_victime_amiante: 'dedommagementAmiante',
    gains_exceptionnels: 'gainsExceptionnels',
    indemnites_chomage_partiel: 'indChomagePartiel',
    indemnites_journalieres_accident_travail: 'indJourAccidentDuTravail',
    indemnites_journalieres_maladie: 'indJourMaladie',
    indemnites_journalieres_maladie_professionnelle: 'indJourMaladieProf',
    indemnites_journalieres_maternite: 'indJourMaternite',
    indemnites_stage: 'stage',
    indemnites_volontariat: 'indVolontariat',
    mva: 'mva',
    pch: 'pch',
    pensions_alimentaires_percues: ['pensionsAlimentaires', 'rncPensionsAlimentaires'],
    pensions_alimentaires_versees_individu: 'pensionsAlimentairesVersees',
    pensions_invalidite: 'pensionsInvalidite',
    prestation_compensatoire: 'prestationCompensatoire',
    prime_forfaitaire_mensuelle_reprise_activite: 'primeRepriseActivite',
    retraite_brute: {
        src: 'pensionsRetraitesRentes',
        fn: function(value) {
            // approximation prélèvement moyen de 7.4 % de cotisations sociales (csg-crds)
            return value / 0.926;
        }
    },
    retraite_combattant: 'retraiteCombattant',
    retraite_nette: 'pensionsRetraitesRentes',
    revenus_capital: 'revenusDuCapital',
    revenus_locatifs: 'revenusLocatifs',
    revenus_stage_formation_pro: 'revenusStageFormationPro',
    salaire_de_base: {
        src: 'revenusSalarie',
        fn: function(value) { return value / RATIO_NET_BRUT; }
    },
    salaire_imposable: [
        {
            src: 'revenusSalarie',
            fn: function(revenusSalarie) { return revenusSalarie + TAUX_CSG_CRDS * ASSIETTE_COTIS * revenusSalarie / RATIO_NET_BRUT; }
        },
        'rncRevenusActivite'
    ],
    salaire_net: 'revenusSalarie',
    tns_auto_entrepreneur_chiffre_affaires: 'caAutoEntrepreneur',
    tns_autres_revenus: 'autresRevenusTns',
    tns_autres_revenus_chiffre_affaires : 'caAutresRevenusTns',
    tns_benefice_exploitant_agricole: 'revenusAgricolesTns',
    tns_micro_entreprise_chiffre_affaires: 'caMicroEntreprise',

    // ressourcesYearMoins2Captured
    chomage_imposable: 'rncAutresRevenus',
    retraite_imposable: 'rncPensionsRetraitesRentes',
    frais_reels: 'fraisReelsDeductibles'
};

exports.famille = {
    aeeh: 'aeeh',
    af: 'af',
    aide_logement: 'aide_logement',
    asf: 'asf',
    asi: 'asi',
    aspa: 'aspa',
    ass: 'ass',
    cf: 'cf',
    paje_base: 'paje_base',
    paje_clca: 'clca',
    paje_prepare: 'prepare',
    ppa: 'primeActivite',
    rsa: 'rsa',
};

exports.foyerFiscal = {
    pensions_alimentaires_versees: {
        src: 'rncPensionsAlimentairesVersees',
        fn: function(value) { return -value; }
    }
};
