/*
** Module dependencies
*/
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ressourceTypes = [
    'revenusSalarie',
    'stage',
    'revenusStageFormationPro',
    'allocationsChomage',
    'allocationSecurisationPro',
    'primeRepriseActivite',
    'allocationLogement',
    'rsa',
    'asf',
    'aspa',
    'ass',
    'aah',
    'indJourMaternite',
    'indJourMaladie',
    'indJourMaladieProf',
    'indJourAccidentDuTravail',
    'indChomagePartiel',
    'indVolontariat',
    'dedommagementAmiante',
    'pensionsAlimentaires',
    'prestationCompensatoire',
    'pensionsRetraitesRentes',
    'retraiteCombattant',
    'pensionsInvalidite',
    'bourseEnseignementSup',
    'bourseRecherche',
    'gainsExceptionnels',
    'caMicroEntreprise',
    'autresRevenusTns'
];

var RessourceSchema = new Schema({
    periode: { type: String, required: false },
    debutPeriode: { type: String, required: false },
    finPeriode: { type: String, required: false },
    type: { type: String, required: false, enum: ressourceTypes },
    tnsStructureType: { type: String, required: false, enum: [] },
    tnsActiviteType: { type: String, required: false, enum: [] },
    montant: { type: Number, required: true }
});

var situationsPro = [
    'sans_activite',
    'salarie',
    'auto_entrepreneur',
    'apprenti',
    'travailleur_saisonnier',
    'stagiaire',
    'independant',
    'gerant_salarie',
    'demandeur_emploi',
    'etudiant',
    'retraite'
];

var SituationPro = new Schema({
    situation: { type: String, enum: situationsPro },
    since: String,
    volontairementSansActivite: Boolean,
    contractType: { type: String, enum: ['cdi', 'cdd', 'interim'] },
    isRemunere: Boolean,
    gerantSalarieAffiliation: String,
    isIndemnise: Boolean,
    indemniseSince: String
});

var statutsMaritaux = [
    'mariage',
    'pacs',
    'relation_libre',
    'celibataire',
    'separe',
    'divorce',
    'veuf',
    'pacs_rompu',
    'concubinage_rompu'
];

var situationsEnfants = [
    'scolarise',
    'apprenti',
    'salarie',
    'formation_pro',
    'demandeur_emploi',
    'chomage_indemnise',
    'sans_activite',
    'autre'
];

var IndividuDef = {
    civilite: { type: String, enum: ['f', 'h'] },
    firstName: String,
    lastName: String,
    nomUsage: String,
    nir: String,
    enceinte: Boolean,
    statutMarital: { type: String, enum: statutsMaritaux },
    dateSituationFamiliale: Date,
    dateDeNaissance: Date,
    villeNaissance: String,
    departementNaissance: String,
    paysNaissance: String,
    situation: { type: String, enum: situationsEnfants },
    situationsPro: [SituationPro],
    nationalite: { type: String, enum: ['fr', 'ue', 'autre'] },
    dateArriveeFoyer: Date,
    inscritCaf: Boolean,
    numeroAllocataire: String,
    lienParente: { type: String, enum: ['fils', 'neveu', 'aucun', 'autre'] },
    residenceAlternee: Boolean,
    role: { type: String, enum: ['demandeur', 'conjoint', 'enfant', 'personneACharge'] },
    ressources: [RessourceSchema],
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
    conjointMemeAdresse: Boolean,
    loyer: Number,
    adresse: AdresseDef,
    type: { type: String, enum: ['locataire', 'proprietaire', 'gratuit', 'payant'] },
    colocation: Boolean,
    locationType: { type: String, enum: ['hlm', 'nonmeuble', 'meublehotel'] },
    dateArrivee: Date,
    adresseConjoint: AdresseDef
};

var SituationSchema = new Schema({
    _updated: Date,
    status: { type: String, default: 'new' },
    dateDeValeur: { type: Date, default: Date.now },
    logement: LogementDef,
    individus: [IndividuSchema],
    patrimoine: {
        revenusLocatifs: [RessourceSchema],
        valeurLocativeImmoNonLoue: Number,
        valeurLocativeTerrainNonLoue: Number,
        revenusDuCapital: [RessourceSchema],
        epargneSurLivret: Number,
        epargneSansRevenus: Number
    },
    phoneNumber: String,
    email: String
});

SituationSchema.methods = {

    submit: function(done) {
        if (this.status !== 'new') done(new Error('Not a new situation. Cannot be submitted.'));
        this.set('status', 'pending').save(done);
    }

};

mongoose.model('Situation', SituationSchema);
