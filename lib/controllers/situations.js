var mongoose = require('mongoose');
var _ = require('lodash');

var openfisca = require('../simulation/openfisca');
var mapping = require('../simulation/openfisca/mapping');

var Situation = mongoose.model('Situation');

exports.situation = function(req, res, next, id) {
    Situation.findById(id, function(err, situation) {
        if (err) return next(err);
        if (!situation) return res.sendStatus(404);

        req.situation = situation;
        next();
    });
};

exports.show = function(req, res) {
    res.send(req.situation);
};

exports.update = function(req, res, next) {
    req.situation
        .set('_updated', Date.now())
        .set(_.omit(req.body, 'status', 'token'))
        .save(function(err) {
            if (err) return next(err);

            res.send(req.situation);
        });
};

exports.submit = function(req, res, next) {
    req.situation.submit(function(err) {
        if (err) return next(err);

        res.send(req.situation);
    });
};

exports.create = function(req, res, next) {
    Situation.create(_.omit(req.body, 'status', 'token'), function(err, situation) {
        if (err) return next(err);

        var cookieParams = { maxAge: 7 * 24 * 3600 * 1000, httpOnly: true };
        res.cookie('situation_' + situation.id, situation.token, cookieParams);
        res.send(situation);
    });
};

exports.simulation = function(req, res, next) {
    req.situation.simulate(function(err, result) {
        if (err) return next(err);

        res.send(result);
    });
};

exports.openfiscaRequest = function(req, res) {
    res.send(mapping.buildOpenFiscaRequest(req.situation, true));
};

exports.openfiscaResponse = function(req, res, next) {
    openfisca.calculate(req.situation, true, function(err, result) {
        if (err) return next(err);

        res.send(result);
    });
};

function createTestInYAML(situation, test) {
    var YAML = require('json2yaml');

    var openfiscaRequest = mapping.buildOpenFiscaRequest(situation, true);
    var scenario = openfiscaRequest.scenarios[0];
    var testCase = scenario.test_case;
    var testFileContent = _.assign(test, {
        period: scenario.period,
        absolute_error_margin: 10,
        individus: testCase.individus,
        familles: testCase.familles[0],
        foyers_fiscaux: testCase.foyers_fiscaux[0],
        menages: testCase.menages[0]
    });

    testFileContent.individus = testFileContent.individus.map(function(individu) {
        individu.id = individu.id.toString();
        return individu;
    });

    var sources = {
        familles: ['parents', 'enfants'],
        foyers_fiscaux: ['declarants', 'personnes_a_charge'],
        menages: ['enfants'],
    };

    function replaceContent(reference) {
        function operate(leafName) {
            reference[leafName] = reference[leafName].map(Object.toString);
        }
        return operate;
    }

    for (var parent in sources) {
        sources[parent].forEach(replaceContent(testFileContent[parent]));
    }

    testFileContent.menages.personne_de_reference = testFileContent.menages.personne_de_reference.toString();
    if (testFileContent.menages.conjoint) {
        testFileContent.menages.conjoint = testFileContent.menages.conjoint.toString();
    }

    return YAML.stringify(testFileContent);
}

exports.openfiscaTest = function(req, res, next) {
    var test = {
        name: req.query.name || req.body.name || 'Missing name',
        description: req.query.description || req.body.description || 'Missing description',
        output_variables: req.query.expectedResults || req.body.expectedResults,
    };
    if (test.output_variables)
        return res.send(createTestInYAML(req.situation, test));

    req.situation.simulate(function(err, result) {
        if (err) return next(err);
        test.output_variables = _.pickBy(result.calculatedPrestations, function(value) { return Boolean(value); });
        return res.send(createTestInYAML(req.situation, test));
    });
};
