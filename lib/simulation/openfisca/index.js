/*
** Module dependencies
*/
var request = require('superagent');
var _ = require('lodash');
var util = require('util');
var config = require('../../config/config');
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

var mapping = require('./mapping');
var transform = mapping.transform;
var ind = mapping.individu;
var men = mapping.menage;
var fam = mapping.famille;
var foy = mapping.foyerFiscal;
var applyRessources = mapping.applyRessources;

function mapIndividus(situation) {
    return _.map(situation.individus, function(individu) {
        if (individu.role === 'demandeur') _.extend(individu, situation.patrimoine);
        var target = transform(individu, ind, situation);
        applyRessources(individu, target);
        return target;
    });
}

function buildRequest(situation, debug) {
    return {
        intermediate_variables: debug,
        scenarios: [{
            test_case: {
                familles: [transform(situation, fam, situation)],
                foyers_fiscaux: [transform(situation, foy, situation)],
                individus: mapIndividus(situation),
                menages: [transform(situation.logement, men, situation)]
            },
            date: moment(situation.dateDeValeur || Date.now()).format('YYYY-MM-DD')
        }],
        variables: _.keys(prestations)
    };
}

function calculate(situation, debug, callback) {
    request
        .post(config.openfiscaApi + '/api/1/calculate')
        .send(buildRequest(situation, debug))
        .end(function(err, response) {
            if (err) return callback(err);
            if (response.error) {
                console.log('Response body: ', util.inspect(response.body, { showHidden: true, depth: null }));
                return callback({ apiError: 'Communication error with OpenFisca' });
            }

            callback(null, response.body);
        });
}

function simulate(situation, callback) {
    calculate(situation, false, function(err, response) {
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