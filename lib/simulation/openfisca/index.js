/*
** Module dependencies
*/
var request = require('superagent');
var _ = require('lodash');
var util = require('util');
var config = require('../../config/config');
var moment = require('moment');
var mapSituation = require('./mapping').mapSituation;

var prestations = {
    aspa: Number,
    asi: Number,
    acs: {
        type: Number,
        montantAnnuel: true
    },
    cmu_c: Boolean,
    apl: Number,
    als: Number,
    alf: Number,
    af: Number,
    rsa: Number,
    asf: Number,
    cf: Number,
    ass: Number,
    paje_base: Number/*,
    bourse_college: {
        type: Number,
        montantAnnuel: true
    }*/
};

function buildPeriod(situation) {
    return moment(situation.dateDeValeur || Date.now()).format('YYYY-MM');
}

function buildRequest(situation, debug) {
    return {
        intermediate_variables: debug,
        scenarios: [{
            test_case: mapSituation(situation),
            period: 'month:' + buildPeriod(situation)
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
        if (err) return callback(err);

        var result = _.mapValues(prestations, function(definition, name) {
            var type;
            var montantAnnuel = false;
            if ('type' in definition) {
                type = definition.type;
                montantAnnuel = !!definition.montantAnnuel;
            } else {
                type = definition;
            }
            var period = buildPeriod(situation);
            var key = response.value[0].familles[0][name];
            var value = typeof key === 'object' ? key[period] : key;
            if (type === Number) {
                if (montantAnnuel) {
                    value *= 12;
                }
                return Math.round(value * 100) / 100;
            }
            return value;
        });
        callback(null, result);
    });
}

/*
** Exports
*/
exports.calculate = calculate;
exports.simulate = simulate;
exports.buildRequest = buildRequest;
