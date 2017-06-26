var openfisca = require('../simulation/openfisca');

exports.create = function(req, res, next) {
    return openfisca.calculateRaw(req.body, function(err, result) {
        if (err) return next(err);

        res.send(result);
    });
};
