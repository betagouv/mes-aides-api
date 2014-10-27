var _ = require('lodash');

var ressourcesMap = require('./ressources');

var ind = require('./individu');
var men = require('./menage');
var fam = require('./famille');
var foy = require('./foyerFiscal');

var isNotValidValue = function(value) {
    return _.isNaN(value) || _.isUndefined(value) || value === null;
};

var applyRessources = function(src, dest) {
    var ressourcesByType = _.groupBy(src.ressources, 'type');
    _.forEach(ressourcesMap, function(definition, destKey) {
        var srcKey, fn;
        if (_.isString(definition)) {
            srcKey = definition;
        } else {
            srcKey = definition.src;
            fn = definition.fn;
        }

        if (ressourcesByType[srcKey]) {
            var result = {};
            _.forEach(ressourcesByType[srcKey], function(item) {
                if (item.periode) {
                    if (!result[item.periode]) result[item.periode] = 0;
                    result[item.periode] += item.montant;
                }
            });

            _.forEach(result, function(montant, periode) {
                // Applique la transformation
                if (fn) montant = fn(montant);
                // Arrondi les montants à l'entier
                montant = Math.round(montant);

                result[periode] = montant;
            });

            if (_.size(result) > 0) dest[destKey] = result;
        }
    });
};

var transform = function(src, schema, situation) {
    var result = {};
    _.forEach(schema, function(definition, destKey) {
        var params = _.isString(definition) ? { src: definition } : definition;

        if (params.values) {
            result[destKey] = params.values[src[params.src]];
        } else if (params.fn) {
            result[destKey] = params.src ? params.fn(src[params.src], src, situation) : params.fn(src, situation);
        } else {
            result[destKey] = src[params.src];
        }
        // Supprime les null (mal supportés par OpenFisca)
        if (isNotValidValue(result[destKey])) {
            if ('default' in params) result[destKey] = params.default;
            else delete result[destKey];
        }
    });
    return result;
};

var mapIndividus = function(situation) {
    return _.map(situation.individus, function(individu) {
        if (individu.role === 'demandeur') {
            _.extend(individu, situation.patrimoine);

            var revenusLocatifs = situation.patrimoine.revenusLocatifs.map(function(revenu) {
                revenu.type = 'revenusLocatifs';
                return revenu;
            });

            var revenusDuCapital = situation.patrimoine.revenusDuCapital.map(function(revenu) {
                revenu.type = 'revenusDuCapital';
                return revenu;
            });

            individu.ressources = individu.ressources.concat(revenusLocatifs, revenusDuCapital);
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
