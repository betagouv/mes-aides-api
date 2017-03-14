var _ = require('lodash');
var moment = require('frozen-moment');
var periodTools = require('./periodTools');
var ressourcesMap = require('./ressources');
var individuSchema = require('./individu');
var menageSchema = require('./menage');
var familleSchema = require('./famille');
var foyerSchema = require('./foyerFiscal');
var common = require('./common');
var PRESTATIONS = require('../prestations');

var isNotValidValue = function(value) {
    return _.isNaN(value) || _.isUndefined(value) || value === null;
};

var getPeriods = function(dateDeValeur) {
    dateDeValeur = moment(dateDeValeur).freeze();
    return {
        thisMonth: {
            key: dateDeValeur.format('YYYY-MM')
        },
        '1MonthsAgo': {
            key: dateDeValeur.subtract(1, 'months').format('YYYY-MM')
        },
        '2MonthsAgo': {
            key: dateDeValeur.subtract(2, 'months').format('YYYY-MM')
        },
        '3MonthsAgo': {
            key: dateDeValeur.subtract(3, 'months').format('YYYY-MM')
        },
        // tableaux contenant les douze derniers mois (pris individuellement)
        last12Months: _.map(_.range(1, 12 + 1), function(monthIndex) {
            return {
                key: dateDeValeur.subtract(monthIndex, 'months').format('YYYY-MM')
            };
        }),
       rollingYear: {
            start: dateDeValeur.subtract(1, 'years').subtract(1, 'months'),
            end: dateDeValeur,
            key: 'year:' + dateDeValeur.subtract(1, 'years').format('YYYY-MM')
        },
        anneeFiscaleReference: {
            key: dateDeValeur.subtract(2, 'years').year()
        },
        rollingTrimester: {
            start: dateDeValeur.subtract(3, 'months').subtract(1, 'months'),
            end: dateDeValeur,
            key: dateDeValeur.subtract(3, 'months').format('YYYY-MM') + ':3'
        }
    };
};

var applyRessources = function(mesAidesEntity, openfiscaEntity, mappingSchema, situation) {
    var dateDeValeur = situation.dateDeValeur;
    var periods = getPeriods(dateDeValeur);

    function isPeriodWithin(agregatKey, periode) {
        return periode.isAfter(periods[agregatKey].start, 'month') && periode.isBefore(periods[agregatKey].end, 'month');
    }

    var ressourcesByType = _.groupBy(mesAidesEntity.ressources, 'type');

    _.forEach(mappingSchema, function(definitions, openfiscaKey) {
        if (! _.isArray(definitions)) {
            definitions = [definitions];
        }
        _.forEach(definitions, function(definition) {

            var srcKey = definition.src || definition;
            var fn = definition.fn;

            if (ressourcesByType[srcKey]) {
                var result = openfiscaEntity[openfiscaKey] || {};

                _.forEach(ressourcesByType[srcKey], function(item) {
                    var montant = fn ? fn(item.montant) : item.montant;
                    if (item.periode) {
                        // Période d'origine
                        if (! result[item.periode]) {
                            result[item.periode] = 0;
                        }
                        result[item.periode] += montant;

                        // Aggrégats
                        _.keys(periods).forEach(function (agregatKey) {
                            if (agregatKey != 'anneeFiscaleReference' && isPeriodWithin(agregatKey, moment(item.periode, 'YYYY-MM'))) {
                                var periodKey = periods[agregatKey].key;
                                if (! result[periodKey]) {
                                    result[periodKey] = 0;
                                }
                                result[periodKey] += montant;
                            }
                        });
                    }
                });

                // On prolonge la ressource perçue quand c'est possible
                var ressourceLastMonth = _.find(ressourcesByType[srcKey], {periode : periods['1MonthsAgo'].key});
                if (ressourceLastMonth && ressourceLastMonth.montant && !_.contains(mesAidesEntity.interruptedRessources, srcKey)) {
                    result[periods.thisMonth.key] = result[periods.thisMonth.key] || 0;
                    result[periods.thisMonth.key] += fn ? fn(ressourceLastMonth.montant) : ressourceLastMonth.montant;
                }

                openfiscaEntity[openfiscaKey] = result;

                // On suppose que les revenus pour l'année fiscale de référence sont les mêmes que pour les 12 derniers mois, si ces revenus n'ont pas encore
                // été renseignés
                var rollingYearKey = periods.rollingYear.key,
                    anneeFiscaleReferenceKey = periods.anneeFiscaleReference.key;
                if (! situation.ressourcesYearMoins2Captured) {
                    openfiscaEntity[openfiscaKey][anneeFiscaleReferenceKey] = openfiscaEntity[openfiscaKey][rollingYearKey];
                }
            }
        });
    });
};

var setNonInjectedPrestationsToZero = function(famille, individus, dateDeValeur) {
    var periods = getPeriods(dateDeValeur);
    var targetPeriods = periods.last12Months.concat([periods.rollingYear]);
    var prestationsFinancieres = _.pick(PRESTATIONS, function(definition) {
        return definition.type == Number;
    });
    _.forEach(targetPeriods, function(period) {
        _.forEach(prestationsFinancieres, function(definition, prestationName) {
            if (definition.prestationIndividuelle) {
                _.forEach(individus, function(individu) {
                    individu[prestationName] = individu[prestationName] || {};
                    individu[prestationName][period.key] = individu[prestationName][period.key] || 0;
                });
            } else {
                famille[prestationName] = famille[prestationName] || {};
                famille[prestationName][period.key] = famille[prestationName][period.key] || 0;
            }
        });
    });
};

function buildOpenFiscaEntity (mesAidesEntity, mappingSchema, situation) {
    var periods = getPeriods(situation.dateDeValeur);
    var monthKeys = ['thisMonth', '1MonthsAgo', '2MonthsAgo', '3MonthsAgo'].map(function (month) {
        return periods[month].key;
    });

    var result = {};
    _.forEach(mappingSchema, function(definition, openfiscaKey) {
        var params = _.isString(definition) ? { src: definition } : definition;

        if (params.values) {
            result[openfiscaKey] = params.values[mesAidesEntity[params.src]];
        } else if (params.fn) {
            result[openfiscaKey] = params.src ? params.fn(mesAidesEntity[params.src], mesAidesEntity, situation) : params.fn(mesAidesEntity, situation);
        } else {
            result[openfiscaKey] = mesAidesEntity[params.src];
        }

        if (params.round && _.isNumber(result[openfiscaKey])) {
            result[openfiscaKey] = Math.round(result[openfiscaKey]);
        }

        // Supprime les null (mal supportés par OpenFisca)
        if (isNotValidValue(result[openfiscaKey])) {
            if ('default' in params) result[openfiscaKey] = params.default;
            else delete result[openfiscaKey];
        }

        // On étend la valeur aux 3 derniers mois, succeptibles d'être appelés par le RSA et la PPA dans Openfisca
        var value = result[openfiscaKey];
        if (_.isUndefined(value) || params.copyTo3PreviousMonths === false) {
            return result;
        }
        result[openfiscaKey] = {};
        monthKeys.forEach(function(monthKey) {
            result[openfiscaKey][monthKey] = value;
        });
    });
    return result;
}

var mapIndividus = exports.mapIndividus = function (situation) {
    var individus = _.filter(situation.individus, function(individu) {
        return common.isIndividuValid(individu, situation);
    });

    return _.map(individus, function(individu) {
        if (individu.role === 'demandeur') {
            _.extend(individu, situation.patrimoine);

        }
        var openfiscaIndividu = buildOpenFiscaEntity(individu, individuSchema, situation);
        applyRessources(individu, openfiscaIndividu, ressourcesMap.individu, situation);
        return openfiscaIndividu;
    });
};

var mapFamille = function(situation) {
    var famille = buildOpenFiscaEntity(situation, familleSchema, situation);
    var ressources = [];
    _.forEach(situation.individus, function(individu) {
        ressources = ressources.concat(individu.ressources);
    });
    applyRessources({ ressources: ressources }, famille, ressourcesMap.famille, situation);

    return famille;
};

var mapFoyerFiscal = exports.mapFoyerFiscal = function(situation) {
    var foyerFiscal = buildOpenFiscaEntity(situation, foyerSchema, situation);
    var ressources = [];
    _.forEach(situation.individus, function(individu) {
        ressources = ressources.concat(individu.ressources);
    });
    applyRessources({ ressources: ressources }, foyerFiscal, ressourcesMap.foyerFiscal, situation);

    return foyerFiscal;
};

exports.buildOpenFiscaRequest = function(situation, debug) {
    var famille = mapFamille(situation),
        individus = mapIndividus(situation),
        foyerFiscal = mapFoyerFiscal(situation);

    setNonInjectedPrestationsToZero(famille, individus, situation.dateDeValeur);

    return {
        intermediate_variables: debug,
        labels: true,
        base_reforms: ['aides_cd93'],
        scenarios: [{
            test_case: {
                familles: [ famille ],
                foyers_fiscaux: [ foyerFiscal ],
                individus: individus,
                menages: [ buildOpenFiscaEntity(situation, menageSchema, situation) ]
            },
            period: 'month:' + periodTools.toOpenFiscaFormat(situation.dateDeValeur)
        }],
        variables: _.keys(PRESTATIONS)
    };
};
