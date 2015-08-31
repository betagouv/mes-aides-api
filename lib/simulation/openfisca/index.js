/*
** Module dependencies
*/
var request = require('superagent');
var util = require('util');
var config = require('../../config/config');
var mapping = require('./mapping');
var reverseMap = require('./mapping/reverse');

function calculate(situation, debug, callback) {
    request
        .post(config.openfiscaApi + '/api/1/calculate')
        .send(mapping.buildOpenFiscaRequest(situation, debug))
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
        callback(null, reverseMap(response, situation));
    });
}

/*
** Exports
*/
exports.calculate = calculate;
exports.simulate = simulate;
