var _ = require('lodash');

exports.transform = function(src, schema, situation) {
    var result = {};
    _.forEach(schema, function(params, destKey) {
        if (_.isString(params)) {
            result[destKey] = src[params];
        } else if (params.values) {
            result[destKey] = params.values[src[params.src]];
        } else if (params.fn) {
            result[destKey] = params.src ? params.fn(src[params.src], src, situation) : params.fn(src, situation);
        }
    });
    return result;
};

exports.individu = require('./individu');
exports.menage = require('./menage');
exports.famille = require('./famille');
