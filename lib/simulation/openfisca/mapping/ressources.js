module.exports = {
    indemnites_journalieres_maternite: 'indJourMaternite',
    indemnites_journalieres_maladie: 'indJourMaladie',
    indemnites_journalieres_maladie_professionnelle: 'indJourMaladieProf',
    indemnites_journalieres_accident_travail: 'indJourAccidentDuTravail',
    indemnites_chomage_partiel: 'indChomagePartiel',
    choi: 'allocationsChomage',
    sali: 'revenusSalarie',
    salbrut: {
        src: 'revenusSalarie',
        fn: function(value) { return value / 0.77; }
    },
    aah: 'aah',
    alr: 'pensionsAlimentaires',
    rsti: 'pensionsRetraitesRentes',
    revenus_locatifs: 'revenusLocatifs',
    revenus_capital: 'revenusDuCapital'
};
