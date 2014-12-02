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
    salnet: 'revenusSalarie',
    salbrut: {
        src: 'revenusSalarie',
        fn: function(value) { return value / 0.77; }
    },
    sali: {
        src: 'revenusSalarie',
        fn: function(value) { return value / 0.971; }
    },
    rstnet: 'pensionsRetraitesRentes',
    aah: 'aah',
    alr: 'pensionsAlimentaires',
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
    gains_exceptionnels: 'gainsExceptionnels'
};

exports.famille = {
    aspa: 'aspa',
    als: 'allocationLogement'
};
