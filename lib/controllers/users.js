var mongoose = require('mongoose');
var _ = require('lodash');

var User = mongoose.model('User');

exports.user = function(req, res, next, id) {
    User.findById(id, function(err, user) {
        if (err) return next(err);
        if (!user) return res.send(404);
        req.currentUser = user;
        next();
    });
};

function pickAttributes(payload) {
    return _.pick(payload, 'firstName', 'lastName', 'email', 'password', 'organization', 'isAdmin');
}

exports.show = function(req, res) {
    res.send(req.currentUser);
};

exports.create = function(req, res, next) {
    User.create(pickAttributes(req.body), function(err, user) {
        if (err) return next(err);
        res.status(201).send(user);
    });
};

exports.update = function(req, res, next) {
    req.currentUser
        .set(pickAttributes(req.body))
        .save(function(err) {
            if (err) return next(err);
            res.send(req.currentUser);
        });
};

exports.delete = function(req, res, next) {
    req.currentUser.remove(function(err) {
        if (err) return next(err);
        res.send(204);
    });
};

exports.list = function(req, res, next) {
    User.find().exec(function(err, users) {
        if (err) return next(err);
        res.send(users);
    });
};
