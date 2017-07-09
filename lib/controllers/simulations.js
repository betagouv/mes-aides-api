var mongoose = require('mongoose');
var _ = require('lodash');

var openfisca = require('../simulation/openfisca');

var Simulation = mongoose.model('Simulation');

exports.simulation = function(req, res, next, id) {
    Simulation.findById(id, function(err, simulation) {
        if (err) return next(err);
        if (! simulation) return res.sendStatus(404);

        req.simulation = simulation;
        next();
    });
};

exports.show = function(req, res) {
    res.send(req.simulation);
};

exports.create = function(req, res, next) {
    return Simulation.create(req.body, function(err, persistedSimulation) {
        if (err) return next(err);

        var simulation = _.omit(persistedSimulation.toObject(), '_id', '__v');
        return openfisca.calculateRaw(simulation, function(err, result) {
            if (err) return next(Object.assign(err, { _id: persistedSimulation._id }));

            res.send(Object.assign(result, { _id: persistedSimulation._id }));
        });
    });
};
