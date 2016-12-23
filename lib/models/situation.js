/*
** Module dependencies
*/
var mongoose = require('mongoose');
var utils = require('../utils');
var openfisca = require('../simulation/openfisca');

var Schema = mongoose.Schema;

var ressourceTypes = [
    'aah',
    'aeeh',
    'af',
    'aide_logement',
    'allocationsChomage',
    'allocationSecurisationPro',
    'asf',
    'asi',
    'aspa',
    'ass',
    'autresRevenusTns',
    'bourseEnseignementSup',
    'bourseRecherche',
    'caAutoEntrepreneur',
    'caAutresRevenusTns',
    'caMicroEntreprise',
    'cf',
    'clca',
    'complementAAH',
    'dedommagementAmiante',
    'gainsExceptionnels',
    'indChomagePartiel',
    'indJourAccidentDuTravail',
    'indJourMaladie',
    'indJourMaladieProf',
    'indJourMaternite',
    'indVolontariat',
    'mva',
    'paje_base',
    'pch',
    'pensionsAlimentaires',
    'pensionsAlimentairesVersees',
    'pensionsInvalidite',
    'pensionsRetraitesRentes',
    'prepare',
    'prestationCompensatoire',
    'primeActivite',
    'primeRepriseActivite',
    'retraiteCombattant',
    'revenusAgricolesTns',
    'revenusDuCapital',
    'revenusLocatifs',
    'revenusSalarie',
    'revenusStageFormationPro',
    'rsa',
    'stage',

    // rnc
    'rncRevenusActivite',
    'rncAutresRevenus',
    'rncPensionsRetraitesRentes',
    'fraisReelsDeductibles',
    'rncPensionsAlimentaires',
    'rncPensionsAlimentairesVersees'
];

var RessourceSchema = new Schema({
    periode: { type: String },
    type: { type: String, enum: ressourceTypes },
    montant: { type: Number, required: true }
});

var specificSituations = [
    'demandeur_emploi',
    'etudiant',
    'retraite',
    'handicap',
    'boursier',
    'inapte_travail',
    'autre'
];

var statutsMaritaux = [
    'mariage',
    'pacs',
    'union_libre',
];

var IndividuDef = {
    firstName: String,
    enceinte: Boolean,
    boursier: Boolean,
    statutMarital: { type: String, enum: statutsMaritaux },
    dateArretDeTravail: Date,
    dateDernierContratTravail: Date,
    isolementRecent: Boolean,
    dateDeNaissance: Date,
    specificSituations: [{ type: String, enum: specificSituations }],
    scolarite: { type: String, enum: ['inconnue', 'college', 'lycee'] },
    nationalite: { type: String, enum: ['fr', 'ue', 'autre'] },
    gardeAlternee: Boolean,
    aCharge: Boolean,
    fiscalementIndependant: Boolean,
    habiteChezParents: Boolean,
    place: Boolean,
    perteAutonomie: Boolean,
    assPreconditionRemplie: Boolean,
    role: { type: String, enum: ['demandeur', 'conjoint', 'enfant'] },
    ressources: [RessourceSchema],
    ressourcesYearlyApproximation: Object,
    interruptedRessources: [{ type: String, enum: ressourceTypes }],
    autresRevenusTnsActiviteType: { type: String, enum: ['achat_revente', 'bic', 'bnc'] },
    autresRevenusTnsEmployes: Boolean,
    tauxIncapacite: { type: String, enum: ['nul', 'moins50', 'moins80', 'plus80'] },
    microEntrepriseActiviteType: { type: String, enum: ['achat_revente', 'bic', 'bnc'] },
    autoEntrepreneurActiviteType: { type: String, enum: ['achat_revente', 'bic', 'bnc'] },
    echelonBourse: Number,
};

var IndividuSchema = new Schema(IndividuDef);

var AdresseDef = {
    adresse: String,
    codePostal: String,
    codeInsee: String,
    ville: String,
    pays: String
};

var LogementDef = {
    primoAccedant: Boolean,
    membreFamilleProprietaire: Boolean,
    loyer: Number,
    charges: Number,
    adresse: AdresseDef,
    type: { type: String, enum: ['locataire', 'proprietaire', 'heberge', 'sansDomicile'] },
    inhabitantForThreeYearsOutOfLastFive: Boolean,
    colocation: Boolean,
    participationFrais: Boolean,
    locationType: { type: String, enum: ['foyer', 'nonmeuble', 'meublehotel', 'hlm'] },
    isChambre: Boolean,
};

var SituationSchema = new Schema({
    _updated: Date,
    status: { type: String, default: 'new' },
    dateDeValeur: { type: Date, default: Date.now },
    logement: LogementDef,
    individus: [IndividuSchema],
    patrimoine: {
        captured: Boolean,
        valeurLocativeImmoNonLoue: Number,
        valeurLocativeTerrainNonLoue: Number,
        epargneSurLivret: Number,
        epargneSansRevenus: Number
    },
    ressourcesYearMoins2Captured: { type: Boolean, default: false },
    rfr: Schema.Types.Mixed,
    token: String
});

SituationSchema.methods = {

    submit: function(done) {
        if (this.status !== 'new') done(new Error('Not a new situation. Cannot be submitted.'));
        this.set('status', 'pending').save(done);
    },

    simulate: function(done) {
        openfisca.simulate(this, done);
    }

};

SituationSchema.pre('save', function(next) {
    if (!this.isNew) next();
    var situation = this;
    utils.generateToken(function(err, generatedToken) {
        if (err) return next(err);
        situation.token = generatedToken;
        next();
    });
});

mongoose.model('Situation', SituationSchema);
