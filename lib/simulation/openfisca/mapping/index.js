var _ = require('lodash');
var ressourcesMap = require('./ressources');

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

exports.applyRessources = function(src, dest) {
    var ressourcesByType = _.groupBy(src.ressources, 'type');
    _.forEach(ressourcesMap, function(srcKey, destKey) {
        if (ressourcesByType[srcKey]) {
            var result = {};
            _.forEach(ressourcesByType[srcKey], function(item) {
                if (item.periode) {
                    if (!result[item.periode]) result[item.periode] = 0;
                    result[item.periode] += item.montant;
                }
            });
            if (_.size(result) > 0) dest[destKey] = result;
        }
    });
};

exports.individu = require('./individu');
exports.menage = require('./menage');
exports.famille = require('./famille');
exports.foyerFiscal = require('./foyerFiscal');
