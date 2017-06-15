/*
** Module dependencies
*/
var config = require('../../config/config');
var http = require('http');
var mapping = require('./mapping');
var url = require('url');

var openfiscaURL = url.parse(config.openfiscaApi);

function calculate(situation, debug, callback) {
    var openfiscaRequest = mapping.buildOpenFiscaRequest(situation, debug);
    var postData = JSON.stringify(openfiscaRequest);
    var options = {
        hostname: openfiscaURL.hostname,
        port: openfiscaURL.port,
        path: '/api/1/calculate',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    var request = http.request(options, function(response) {
        response.setEncoding('utf8');
        var rawData = '';
        response.on('data', function(chunk) { rawData += chunk; });
        response.on('end', function() {
            try {
                var content = JSON.parse(rawData);
                if (response.statusCode == 200) {
                    callback(null, content);
                } else {
                    callback(content.error);
                }
            } catch (e) {
                callback({
                    code: 500,
                    errors: 'Can\'t parse: ' + rawData,
                    message: e.message,
                    stack: e.stack,
                });
            }
        });
    });
    request.write(postData);

    request.on('error', callback);
    request.end();
}

function simulate(situation, callback) {
    calculate(situation, false, function(err, response) {
        if (err) return callback(err);
        callback(null, response);
    });
}

/*
** Exports
*/
exports.calculate = calculate;
exports.simulate = simulate;
