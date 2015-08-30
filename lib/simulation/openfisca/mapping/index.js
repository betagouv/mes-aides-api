var _ = require('lodash');
var moment = require('frozen-moment');
var periodTools = require('./periodTools');
var ressourcesMap = require('./ressources');
var ind = require('./individu');
var men = require('./menage');
var fam = require('./famille');
var foy = require('./foyerFiscal');
var common = require('./common');
var PRESTATIONS = require('../prestations');

var isNotValidValue = function(value) {
    return _.isNaN(value) || _.isUndefined(value) || value === null;
};

var getPeriods = function(dateDeValeur) {
    dateDeValeur = moment(dateDeValeur).freeze();
    return {
        moisCourant: {
            key: dateDeValeur.format('YYYY-MM')
        },
        moisPrecedent: {
            key: dateDeValeur.subtract(1, 'months').format('YYYY-MM')
        },
        moisMMoins2: {
            key: dateDeValeur.subtract(2, 'months').format('YYYY-MM')
        },
        moisMMoins3: {
            key: dateDeValeur.subtract(3, 'months').format('YYYY-MM')
        },
       anneeGlissante: {
            debut: dateDeValeur.subtract(1, 'years').subtract(1, 'months'),
            fin: dateDeValeur,
            key: 'year:' + dateDeValeur.subtract(1, 'years').format('YYYY-MM')
        },
        anneeFiscalReference: {
            key: dateDeValeur.subtract(2, 'years').year()
        },
        trimestreGlissant: {
            debut: dateDeValeur.subtract(3, 'months').subtract(1, 'months'),
            fin: dateDeValeur,
            key: dateDeValeur.subtract(3, 'months').format('YYYY-MM') + ':3'
        }
    };
};

var applyRessources = function(src, openFiscaEntity, schema, dateDeValeur) {
    var periods = getPeriods(dateDeValeur);

    function isPeriodWithin(agregatKey, periode) {
        return periode.isAfter(periods[agregatKey].debut, 'month') && periode.isBefore(periods[agregatKey].fin, 'month');
    }

    var ressourcesByType = _.groupBy(src.ressources, 'type');

    _.forEach(schema, function(definitions, openFiscaKey) {
        if (! _.isArray(definitions)) {
            definitions = [definitions];
        }

        _.forEach(definitions, function(definition) {

            var srcKey = definition.src || definition;
            var fn = definition.fn;

            if (ressourcesByType[srcKey]) {
                var result = {};
                var agr = {};

                _.forEach(ressourcesByType[srcKey], function(item) {
                    if (item.periode) {
                        // Période d'origine
                        if (!result[item.periode]) result[item.periode] = 0;
                        result[item.periode] += item.montant;

                        // Aggrégats
                        _.keys(periods).forEach(function (agregatKey) {
                            if (agregatKey != 'anneeFiscalReference' && isPeriodWithin(agregatKey, moment(item.periode, 'YYYY-MM'))) {
                                if (!(agregatKey in agr)) agr[agregatKey] = 0;
                                agr[agregatKey] += fn ? fn(item.montant) : item.montant;
                            }
                        });
                    }
                });

                _.forEach(result, function(montant, periode) {
                    // Applique la transformation
                    if (fn) montant = fn(montant);
                    result[periode] = montant;
                });

                // On prolonge la ressource perçue quand c'est possible
                if (result[periods.moisPrecedent.key] && !_.contains(src.interruptedRessources, srcKey)) {
                    result[periods.moisCourant.key] = result[periods.moisPrecedent.key];
                }

                if (_.size(result) > 0) {
                    if (_.size(openFiscaEntity[openFiscaKey]) > 0) {
                        openFiscaEntity[openFiscaKey] = _.extend(openFiscaEntity[openFiscaKey],result);
                    } else {
                        openFiscaEntity[openFiscaKey] = result;
                    }
                } 

                _.forEach(agr, function (value, agregatKey) {
                    openFiscaEntity[openFiscaKey][periods[agregatKey].key] = value;
                });

                // On suppose que les revenus pour l'année fiscale de référence sont les mêmes que pour les 12 derniers mois, si ces revenus n'ont pas encore
                // été renseignés
                var anneeGlissanteKey = periods.anneeGlissante.key,
                    anneeFiscaleRefKey = periods.anneeFiscalReference.key;
                if (! openFiscaEntity[openFiscaKey][anneeFiscaleRefKey]) {
                    openFiscaEntity[openFiscaKey][anneeFiscaleRefKey] = openFiscaEntity[openFiscaKey][anneeGlissanteKey];
                }
            }
        });
    });
};

var setNonInjectedPrestationsToZero = function(openFiscaEntity, dateDeValeur) {
    var periods = getPeriods(dateDeValeur);
    var concernedPeriods = ['moisPrecedent', 'moisMMoins2', 'moisMMoins3', 'anneeGlissante'];

    _.forEach(concernedPeriods, function(periodKey) {
        var period = periods[periodKey].key;
        var prestations = _.pick(PRESTATIONS, function(definition) {
            return definition.type == Number;
        });

        _.forEach(prestations, function(definition, prestationName) {
            if (! openFiscaEntity[prestationName]) {
                openFiscaEntity[prestationName] = {};
            }
            if (! openFiscaEntity[prestationName][period]) {
                openFiscaEntity[prestationName][period] = 0;
            }
        });

    });


};

var transform = function(src, schema, situation) {
    var result = {};
    _.forEach(schema, function(definition, openFiscaKey) {
        var params = _.isString(definition) ? { src: definition } : definition;

        if (params.values) {
            result[openFiscaKey] = params.values[src[params.src]];
        } else if (params.fn) {
            result[openFiscaKey] = params.src ? params.fn(src[params.src], src, situation) : params.fn(src, situation);
        } else {
            result[openFiscaKey] = src[params.src];
        }

        if (params.round && _.isNumber(result[openFiscaKey])) {
            result[openFiscaKey] = Math.round(result[openFiscaKey]);
        }

        // Supprime les null (mal supportés par OpenFisca)
        if (isNotValidValue(result[openFiscaKey])) {
            if ('default' in params) result[openFiscaKey] = params.default;
            else delete result[openFiscaKey];
        }
    });
    return result;
};

var mapIndividus = exports.mapIndividus = function (situation) {
    var individus = _.filter(situation.individus, function(individu) {
        return common.isIndividuValid(individu, situation);
    });

    return _.map(individus, function(individu) {
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
        var openFiscaIndividu = transform(individu, ind, situation);
        applyRessources(individu, openFiscaIndividu, ressourcesMap.individu, situation.dateDeValeur);
        return openFiscaIndividu;
    });
};

var mapFamille = function(situation) {
    var famille = transform(situation, fam, situation);
    var ressources = [];
    _.forEach(situation.individus, function(individu) {
        ressources = ressources.concat(individu.ressources);
    });
    applyRessources({ ressources: ressources }, famille, ressourcesMap.famille, situation.dateDeValeur);
    setNonInjectedPrestationsToZero(famille, situation.dateDeValeur);

    return famille;
};

var mapFoyerFiscal = exports.mapFoyerFiscal = function(situation) {
    var foyerFiscal = transform(situation, foy, situation);
    var ressources = [];
    _.forEach(situation.individus, function(individu) {
        ressources = ressources.concat(individu.ressources);
    });
    applyRessources({ ressources: ressources }, foyerFiscal, ressourcesMap.foyerFiscal, situation.dateDeValeur);

    return foyerFiscal;
};

exports.buildOpenFiscaRequest = function(situation, debug) {
        return {
        intermediate_variables: debug,
        labels: true,
        scenarios: [{
            test_case: {
                familles: [mapFamille(situation)],
                foyers_fiscaux: [mapFoyerFiscal(situation)],
                individus: mapIndividus(situation),
                menages: [transform(situation, men, situation)]
            },
            period: 'month:' + periodTools.toOpenFiscaFormat(situation.dateDeValeur)
        }],
        variables: _.keys(PRESTATIONS)
    };
};
