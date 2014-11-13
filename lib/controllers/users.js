var mongoose = require('mongoose');
var _ = require('lodash');

var Agent = mongoose.model('Agent');

exports.user = function(req, res, next, id) {
    Agent.findById(id, function(err, agent) {
        if (err) return next(err);
        if (!agent) return res.send(404);
        req.agent = agent;
        next();
    });
};

function pickAttributes(payload) {
    return _.pick(payload, 'firstName', 'lastName', 'email', 'password', 'isAdmin');
}

exports.show = function(req, res) {
    res.send(req.agent);
};

exports.create = function(req, res, next) {
    Agent.create(pickAttributes(req.body), function(err, agent) {
        if (err) return next(err);
        res.status(201).send(agent);
    });
};

exports.update = function(req, res, next) {
    req.agent
        .set(pickAttributes(req.body))
        .save(function(err) {
            if (err) return next(err);
            res.send(req.agent);
        });
};

exports.delete = function(req, res, next) {
    req.agent.remove(function(err) {
        if (err) return next(err);
        res.send(204);
    });
};

exports.list = function(req, res, next) {
    Agent.find().exec(function(err, agents) {
        if (err) return next(err);
        res.send(agents);
    });
};
