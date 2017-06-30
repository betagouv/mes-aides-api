var mongoose = require('mongoose');
var _ = require('lodash');

var openfisca = require('../simulation/openfisca');

var Simulation = mongoose.model('Simulation');

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
