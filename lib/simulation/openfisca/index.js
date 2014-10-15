/*
** Module dependencies
*/
var request = require('superagent');
var _ = require('lodash');
var util = require('util');
var config = require('../config/config');
var debug = require('debug')('openfisca');
var moment = require('moment');

var prestations = {
    aspa: Number,
    acs: Number,
    cmu_c: Boolean,
    apl: Number,
    als: Number,
    alf: Number,
    af: Number,
    rsa: Number,
    asf: Number,
    cf: Number,
    ass: Number
};

function troisDerniersMois(dateDeValeur) {
    return _.map([3, 2, 1], function(nbMonths) {
        return moment(dateDeValeur || Date.now()).subtract(moment.duration(nbMonths, 'months')).format('YYYY-MM');
    });
}

var ressourcesMap = {
    sali: [
        'revenusSalarie',
        'revenusNonSalarie',
        'revenusAutoEntrepreneur',
        'indJourMaternite',
        'indJourMaladie',
        'indJourMaladieProf',
        'indJourAccidentDuTravail',
        'indChomagePartiel'
    ],
    choi: [
        'allocationsChomage'
    ],
    alr: ['pensionsAlimentaires'],
    rsti: ['pensionsRetraitesRentes'],
    aah: ['aah']
};

var mapping = require('./mapping');
var transform = mapping.transform;
var ind = mapping.individu;
var men = mapping.menage;

function mapIndividus(situation) {
    return _.map(situation.individus, function(individu) {
        _.extend(individu, situation.patrimoine);
        var target = transform(individu, ind);

        var periodes = troisDerniersMois(situation.dateDeValeur);
        var ressources = _.filter(individu.ressources, function(ressource) {
            return _.contains(periodes, ressource.periode);
        });
        var rs = {};
        ressources.forEach(function(ressource) {
            if (_.isNumber(rs[ressource.type])) {
                rs[ressource.type] += ressource.montant;
            } else {
                rs[ressource.type] = ressource.montant;
            }
        });

        _.forEach(ressourcesMap, function(ressourcesList, key) {
            var sum = 0;
            ressourcesList.forEach(function(ressource) {
                if (_.isNumber(rs[ressource])) sum += rs[ressource];
            });
            target[key] = 4 * sum;
        });

        if ('demandeur' === individu.role) {
            if ('locataire' === situation.logement.type && situation.logement.colocation) {
                target.coloc = 1;
            }
        }

        return target;
    });
}

function mapMenages(situation) {
    var menage = transform(situation.logement, men);

    var demandeur = _.find(situation.individus, {role: 'demandeur'});
    var conjoint = _.find(situation.individus, {role: 'conjoint'});
    menage.personne_de_reference = demandeur._id;
    if (conjoint) {
        menage.conjoint = conjoint._id;
    }
    var enfants = _.pluck(_.filter(situation.individus, {role: 'enfant'}), '_id');
    var personnesACharge = _.pluck(_.filter(situation.individus, {role: 'personneACharge'}), '_id');
    menage.enfants = enfants.concat(personnesACharge);
    mapLogement(situation.logement, menage);

    return [menage];
}

function mapFamilles(situation) {
    var famille = {};

    var parents = _.pluck(_.filter(situation.individus, function(individu) {
        return _.contains(['demandeur', 'conjoint'], individu.role);
    }), '_id');

    var enfants = _.pluck(_.filter(situation.individus, {role: 'enfant'}), '_id');
    var personnesACharge = _.pluck(_.filter(situation.individus, {role: 'personneACharge'}), '_id');
    enfants = enfants.concat(personnesACharge);

    if (situation.logement.membreFamilleProprietaire) {
        famille.proprietaire_proche_famille = true;
    }

    famille.parents = parents;
    famille.enfants = enfants;

    return [famille];
}

function mapFoyersFiscaux(situation) {
    var declarants = _.filter(situation.individus, function(individu) {
        return _.contains(['demandeur', 'conjoint'], individu.role);
    });

    var enfants = _.pluck(_.filter(situation.individus, {role: 'enfant'}), '_id');
    var personnesACharge = _.pluck(_.filter(situation.individus, {role: 'personneACharge'}), '_id');
    enfants = enfants.concat(personnesACharge);

    return [{
        declarants: _.pluck(declarants, '_id'),
        personnes_a_charge: enfants
    }];
}

function buildRequest(situation) {
    return {
        intermediate_variables: true,
        scenarios: [{
            test_case: {
                familles: mapFamilles(situation),
                foyers_fiscaux: mapFoyersFiscaux(situation),
                individus: mapIndividus(situation),
                menages: mapMenages(situation)
            },
            date: moment(situation.dateDeValeur || Date.now()).format('YYYY-MM-DD')
        }],
        variables: _.keys(prestations)
    };
}

function calculate(situation, callback) {
    try {
        request
            .post(config.openfiscaApi + '/api/1/calculate')
            .send(buildRequest(situation))
            .end(function(err, response) {
                if (err) return callback(err);
                if (response.error) {
                    console.log('Response body: ', util.inspect(response.body, { showHidden: true, depth: null }));
                    return callback({ apiError: 'Communication error with OpenFisca' });
                }

                callback(null, response.body);
            });
    } catch(err) {
        callback(err);
    }
}

function simulate(situation, callback) {
    calculate(situation, function(err, response) {
        if (err)  return callback(err);

        var result = _.mapValues(prestations, function(type, name) {
            var value = response.value[0].familles[0][name];
            if (type === Number) return Math.round((value / 12) * 100) / 100;
            return value;
        });
        callback(null, result);
    });
}

function ping() {
    debug('PING?');
    request.get(config.openfiscaApi + '/api/1/fields').end(function(err, response) {
        if (err) return console.log('OpenFisca: Error: ' + err);
        if (response.error) return console.log('OpenFisca: Error: ' + response.status);
        debug('PONG!');
    });
}

/*
** Exports
*/
exports.calculate = calculate;
exports.simulate = simulate;
exports.buildRequest = buildRequest;
exports.ping = ping;
