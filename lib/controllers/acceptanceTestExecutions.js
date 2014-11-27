var mongoose = require('mongoose');
var _ = require('lodash');

var AcceptanceTestExecution = mongoose.model('AcceptanceTestExecution');

exports.list = function(req, res, next) {
    AcceptanceTestExecution
        .find()
        .where('acceptanceTest').equals(req.acceptanceTest._id)
        .select('-acceptanceTest')
        .populate('createdBy', '-password')
        .exec(function(err, acceptanceTestExecutions) {
            if (err) return next(err);
            res.send(acceptanceTestExecutions);
        });
};

exports.create = function(req, res, next) {
    req.acceptanceTest.execute(req.user, function(err, execution) {
        if (err) return next(err);
        res.send(_.omit(execution.toObject(), 'acceptanceTest'));
    });
};
