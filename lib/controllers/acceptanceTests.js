var mongoose = require('mongoose');
var _ = require('lodash');

var AcceptanceTest = mongoose.model('AcceptanceTest');
var Situation = mongoose.model('Situation');

exports.find = function(req, res, next, id) {
    AcceptanceTest
        .findById(id)
        .populate('createdBy', '-password')
        .exec(function(err, acceptanceTest) {
            if (err) return next(err);
            if (!acceptanceTest) return res.send(404);
            req.acceptanceTest = acceptanceTest;
            next();
        });
};

exports.list = function(req, res, next) {
    AcceptanceTest
        .find()
        .populate('createdBy', '-password')
        .exec(function(err, acceptanceTests) {
        if (err) return next(err);
        res.send(acceptanceTests);
    });
};

exports.listValidated = function(req, res, next) {
    AcceptanceTest
        .find({ validated: true })
        .populate('createdBy', '-password')
        .exec(function(err, acceptanceTests) {
        if (err) return next(err);
        res.send(acceptanceTests);
    });
};

exports.listMine = function(req, res, next) {
    AcceptanceTest
        .find({ createdBy: req.user._id })
        .populate('createdBy', '-password')
        .exec(function(err, acceptanceTests) {
        if (err) return next(err);
        res.send(acceptanceTests);
    });
};

exports.create = function(req, res, next) {
    Situation.findById(req.body.situation, function(err, situation) {
        if (err) return next(err);
        if (!situation) return res.send(404);
        var acceptanceTest = new AcceptanceTest(req.body);
        acceptanceTest.set('createdBy', req.user._id);
        acceptanceTest.save(function(err) {
            if (err) return next(err);
            situation.set('status', 'test').save(function(err) {
                if (err) return next(err);
                res.send(acceptanceTest);
            });
        });
    });
};

exports.show = function(req, res) {
    res.send(req.acceptanceTest);
};

exports.update = function(req, res, next) {
    req.acceptanceTest
        .set('_updated', Date.now())
        .set(_.pick(req.body, 'name', 'description', 'droitsAttendus'))
        .save(function(err) {
            if (err) return next(err);
            res.send(req.situation);
        });
};

exports.delete = function(req, res, next) {
    req.acceptanceTest.remove(function(err) {
        if (err) return next(err);
        res.send(204);
    });
};

exports.validate = function(req, res, next) {
    req.acceptanceTest
        .set('validated', true)
        .save(function(err) {
            if (err) return next(err);
            res.send(200);
        });
};


exports.unvalidate = function(req, res, next) {
    req.acceptanceTest
        .set('validated', false)
        .save(function(err) {
            if (err) return next(err);
            res.send(200);
        });
};
