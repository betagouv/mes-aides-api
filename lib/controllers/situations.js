var mongoose = require('mongoose');
var _ = require('lodash');

var openfisca = require('../simulation/openfisca');
var mapping = require('../simulation/openfisca/mapping');

var Situation = mongoose.model('Situation');

exports.situation = function(req, res, next, id) {
    Situation.findById(id, function(err, situation) {
        if (err) return next(err);
        if (!situation) return res.send(404);
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
        res.cookie('situation_' + situation.id, situation.token, { maxAge: 7 * 24 * 3600 * 1000, httpOnly: true });
        res.send(situation);
    });
};

exports.simulation = function(req, res, next) {
    req.situation.simulate(function(err, result) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            res.send(result);
        }
    });
};

exports.openfiscaRequest = function(req, res) {
    res.send(mapping.buildOpenFiscaRequest(req.situation, true));
};

exports.openfiscaResponse = function(req, res, next) {
    openfisca.calculate(req.situation, true, function(err, result) {
        if (err) next(err);
        res.send(result);
    });
};
