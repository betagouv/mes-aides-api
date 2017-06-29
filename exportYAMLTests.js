/*
* Partenaire variables
* 
* adpa
* perte_autonomie
* 
* parisien
* paris_complement_sante
* paris_energie_famille
* paris_forfait_famille
* paris_logement
* paris_logement_aspeh
* paris_logement_familles
* paris_logement_plfm
* paris_logement_psol
* 
* rennes_metropole_transport
* 
*/

var http = require('http');
var fs = require('fs');
var tests;

var filter = false;
var callback = function() {};
callback = generateTest;

function generateTest() {
    if (! tests.length)
        return;
    var testId = tests.pop()._id;
    http.get({
        hostname: 'localhost',
        port: 9000,
        path: '/api/acceptance-tests/' + testId,
        headers: {
            cookie: 'sid=s%3Aq1mycsuNYsN0Mbcp43muMnpIsSmy2xKJ.aY1k4uJUUyPXXe06EVMY%2B4r0PoX34S2XWVHZq%2Fo2iSk;'
        },
    }, function(response) {

        response.setEncoding('utf8');
        var rawData = '';
        response.on('data', function(chunk) { rawData += chunk; });
        response.on('error', function(error) {
            console.error('Failed to retrieve test:' + error);
        });
        
        response.on('end', function() {
            var test = JSON.parse(rawData);

            if (filter && (test.state == 'rejected' ||
                    test.currentStatus != 'accepted-exact'))
            {
                if (callback) {
                    callback();
                    return;
                }
            }

            var outputVariables = {};

            test.expectedResults.forEach(function(expectedResult) {
                if (typeof expectedResult.expectedValue === 'string')
                    outputVariables[expectedResult.code] = 0;
                else
                    outputVariables[expectedResult.code] = expectedResult.expectedValue;
            });

            if (! Object.keys(outputVariables).length)
            {
                if (callback) {
                    callback();
                    return;
                }
            }

            var payload = {
                absolute_error_margin: 10,
                description: test.description,
                output_variables: outputVariables,
                name: test.name,
            };

            var postData = JSON.stringify(payload);

            var options = {
                hostname: 'localhost',
                port: 9000,
                path: '/api/situations/' + test.scenario.situationId + '/openfisca-test',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData),
                },
            };

            var request = http.request(options, function(response) {
                response.setEncoding('utf8');
                var rawData = '';
                response.on('data', function(chunk) { rawData += chunk; });
                response.on('end', function() {
                    var data = '# Situation ID: ' + test.scenario.situationId + '\n# Test ID: ' + test._id + '\n' + rawData;
                    fs.writeFileSync('ludwig_tests/test_mes_aides_' + test.scenario.situationId + '.yaml', data);
                    callback();
                });
            });
            request.write(postData);
            response.on('error', function(error) {
                console.error('Failed to generate test:' + error);
            });
            request.end();
        });
    });
}

var options = {
    hostname: 'localhost',
    port: 9000,
    path: '/api/acceptance-tests/59415de97770d2503676955c',
    headers: {
        cookie: 'sid=s%3Aq1mycsuNYsN0Mbcp43muMnpIsSmy2xKJ.aY1k4uJUUyPXXe06EVMY%2B4r0PoX34S2XWVHZq%2Fo2iSk;'
    },
};

http.get(options, function(response) {
    response.setEncoding('utf8');
    var rawData = '';
    response.on('data', function(chunk) { rawData += chunk; });
    response.on('error', function(error) {
        console.error('Failed to retrieve test:' + error);
    });
    
    response.on('end', function() {
        var data = JSON.parse(rawData);
        if (data instanceof Array)
            tests = data;
        else
            tests = [data];
        generateTest();
    });
});
