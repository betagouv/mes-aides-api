module.exports = {
    indemnites_journalieres_maternite: 'indJourMaternite',
    indemnites_journalieres_maladie: 'indJourMaladie',
    indemnites_journalieres_maladie_professionnelle: 'indJourMaladieProf',
    indemnites_journalieres_accident_travail: 'indJourAccidentDuTravail',
    indemnites_chomage_partiel: 'indChomagePartiel',
    chonet: 'allocationsChomage',
    salnet: 'revenusSalarie',
    salbrut: {
        src: 'revenusSalarie',
        fn: function(value) { return value / 0.77; }
    },
    aah: 'aah',
    alr: 'pensionsAlimentaires',
    rstnet: 'pensionsRetraitesRentes',
    revenus_locatifs: 'revenusLocatifs',
    revenus_capital: 'revenusDuCapital',
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
