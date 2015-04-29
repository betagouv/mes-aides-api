/*
** Module dependencies
*/
var request = require('superagent');
var _ = require('lodash');
var util = require('util');
var config = require('../../config/config');
var moment = require('moment');
var mapSituation = require('./mapping').mapSituation;

var PRESTATIONS = {
    aspa: {
        type: Number
    },
    asi: {
        type: Number
    },
    acs: {
        type: Number,
        montantAnnuel: true
    },
    cmu_c: {
        type: Boolean
    },
    apl: {
        type: Number
    },
    als: {
        type: Number
    },
    alf: {
        type: Number
    },
    aide_logement: {
        type: Number
    },
    af: {
        type: Number
    },
    rsa: {
        type: Number
    },
    rsa_majore: {
        type: Number
    },
    rsa_non_majore: {
        type: Number
    },
    asf: {
        type: Number
    },
    cf: {
        type: Number
    },
    ass: {
        type: Number
    },
    paje_base: {
        type: Number
    },
    bourse_college: {
        type: Number,
        montantAnnuel: true
    },
    bourse_lycee: {
        type: Number,
        montantAnnuel: true
    }
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
        variables: _.keys(PRESTATIONS)
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

        callback(null, reverseMap(situation, response.value[0].familles[0]));
    });
}


function reverseMap(situation, openFiscaFamille) {
    return _.mapValues(PRESTATIONS, function(format, prestationName) {
        var type = format.type,
            period = buildPeriod(situation),
            computedPrestation = openFiscaFamille[prestationName],
            result = computedPrestation[period];

        if (format.montantAnnuel) {
            result *= 12;
        }

        if (type == Number) {
            result = Number(result.toFixed(2));
        }

        return result;
    });
}

/*
** Exports
*/
exports.calculate = calculate;
exports.simulate = simulate;
exports.buildRequest = buildRequest;
