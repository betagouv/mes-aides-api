var _ = require('lodash');

var ressourcesMap = require('./ressources');

var ind = require('./individu');
var men = require('./menage');
var fam = require('./famille');
var foy = require('./foyerFiscal');

var applyRessources = function(src, dest) {
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

var transform = function(src, schema, situation) {
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

var mapIndividus = function(situation) {
    return _.map(situation.individus, function(individu) {
        if (individu.role === 'demandeur') {
            _.extend(individu, _.omit(situation.patrimoine, 'revenusLocatifs', 'revenusDuCapital'));
            individu.ressources = individu.ressources.concat(situation.patrimoine.revenusLocatifs, situation.patrimoine.revenusDuCapital);
        }
        var target = transform(individu, ind, situation);
        applyRessources(individu, target);
        return target;
    });
};

exports.mapSituation = function(situation) {
    return {
        familles: [transform(situation, fam, situation)],
        foyers_fiscaux: [transform(situation, foy, situation)],
        individus: mapIndividus(situation),
        menages: [transform(situation.logement, men, situation)]
    };
};
