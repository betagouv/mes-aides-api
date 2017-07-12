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
        thisMonth: dateDeValeur.format('YYYY-MM'),
        '1MonthsAgo': dateDeValeur.subtract(1, 'months').format('YYYY-MM'),
        '2MonthsAgo': dateDeValeur.subtract(2, 'months').format('YYYY-MM'),
        '3MonthsAgo': dateDeValeur.subtract(3, 'months').format('YYYY-MM'),
        // 12-element array of the latest 12 months
        last12Months: _.map(_.range(1, 12 + 1), function(monthIndex) {
            return dateDeValeur.subtract(monthIndex, 'months').format('YYYY-MM');
        }),
        lastYear: dateDeValeur.subtract(1, 'years').format('YYYY'),
        anneeFiscaleReference: dateDeValeur.subtract(2, 'years').format('YYYY'),
        // 12-element array of the 12 months in the année fiscale de référence
        anneeFiscaleReference12Months: _.map(_.range(12), function(monthIndex) {
            var anneeFiscaleReference = moment(dateDeValeur.subtract(2, 'years').year(), 'YYYY').freeze();
            return anneeFiscaleReference.add(monthIndex, 'months').format('YYYY-MM')
            ;
        })
    };
};

var applyRessources = function(mesAidesEntity, openfiscaEntity, mappingSchema, situation) {
    var dateDeValeur = situation.dateDeValeur;
    var periods = getPeriods(dateDeValeur);
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
                        // Bootstrapping for current period
                        if (! result[item.periode]) {
                            result[item.periode] = 0;
                        }
                        result[item.periode] += montant;
                    }
                });

                // Current month resources are given their latest value when not interrupted
                var ressourceLastMonth = _.find(ressourcesByType[srcKey], {periode : periods['1MonthsAgo']});
                if (ressourceLastMonth && ressourceLastMonth.montant && !_.includes(mesAidesEntity.interruptedRessources, srcKey)) {
                    result[periods.thisMonth] = result[periods.thisMonth] || 0;
                    result[periods.thisMonth] += fn ? fn(ressourceLastMonth.montant) : ressourceLastMonth.montant;
                }

                // When they are not formally declared, resources of the année fiscale de référence are considered equal to latest 12 month resources 
                if (! situation.ressourcesYearMoins2Captured) {
                    // Variables can be defined on a yearly or a monthly basis
                    if (result[periods.lastYear]) {
                        result[periods.anneeFiscaleReference] = result[periods.lastYear];
                    } else {
                        var sumOverLast12Months = periods.last12Months.reduce(function(sum, periodObject) {
                            return sum + result[periodObject];
                        }, 0);
                        if (sumOverLast12Months) {
                            periods.anneeFiscaleReference12Months.forEach(function(month) {
                                result[month] = sumOverLast12Months / 12;
                            });
                        }
                    }
                }
                openfiscaEntity[openfiscaKey] = result;
            }
        });
    });
};

var setNonInjectedPrestationsToZero = function(famille, individus, dateDeValeur) {
    var periods = getPeriods(dateDeValeur);
    var targetPeriods = periods.last12Months;
    var prestationsFinancieres = _.pickBy(PRESTATIONS, function(definition) {
        return definition.type == Number;
    });
    _.forEach(targetPeriods, function(period) {
        _.forEach(prestationsFinancieres, function(definition, prestationName) {
            if (definition.prestationIndividuelle) {
                _.forEach(individus, function(individu) {
                    individu[prestationName] = individu[prestationName] || {};
                    individu[prestationName][period] = individu[prestationName][period] || 0;
                });
            } else {
                famille[prestationName] = famille[prestationName] || {};
                famille[prestationName][period] = famille[prestationName][period] || 0;
            }
        });
    });
};

function buildOpenFiscaEntity (mesAidesEntity, mappingSchema, situation) {
    var periods = getPeriods(situation.dateDeValeur);
    var monthKeys = ['thisMonth', '1MonthsAgo', '2MonthsAgo', '3MonthsAgo'].map(function (month) {
        return periods[month];
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

        // Remove null as OpenFisca do not handle them correctly
        if (isNotValidValue(result[openfiscaKey])) {
            if ('default' in params) result[openfiscaKey] = params.default;
            else delete result[openfiscaKey];
        }

        var value = result[openfiscaKey];
        if (_.isUndefined(value) || params.copyTo3PreviousMonths === false) {
            return result;
        }
        // Most values must be defined for the latest 3 months to get correct results from OpenFisca
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
        if (individu.role === 'demandeur' && situation.patrimoine) {
            // Mongoose embeded objects must be converted to objects
            _.extend(individu, situation.patrimoine.toObject ? situation.patrimoine.toObject() : situation.patrimoine);
        }
        var openfiscaIndividu = buildOpenFiscaEntity(individu, individuSchema, situation);
        applyRessources(individu, openfiscaIndividu, ressourcesMap.individu, situation);
        return openfiscaIndividu;
    });
};

function aggregateIndividuRessources(situation) {
    var ressources = [];
    var interruptedRessources = [];
    _.forEach(situation.individus, function(individu) {
        ressources = ressources.concat(individu.ressources);
        interruptedRessources = interruptedRessources.concat(individu.interruptedRessources);
    });
    return {
        interruptedRessources: interruptedRessources,
        ressources: ressources,
    };
}

var mapFamille = exports.mapFamille = function(situation) {
    var famille = buildOpenFiscaEntity(situation, familleSchema, situation);
    applyRessources(aggregateIndividuRessources(situation), famille,
        ressourcesMap.famille, situation);

    return famille;
};

var mapFoyerFiscal = exports.mapFoyerFiscal = function(situation) {
    var foyerFiscal = buildOpenFiscaEntity(situation, foyerSchema, situation);
    applyRessources(aggregateIndividuRessources(situation), foyerFiscal,
        ressourcesMap.foyerFiscal, situation);

    return foyerFiscal;
};

var buildOpenFiscaTestCase = exports.buildOpenFiscaTestCase = function(situation) {
    var famille = mapFamille(situation),
        individus = mapIndividus(situation),
        foyerFiscal = mapFoyerFiscal(situation);

    setNonInjectedPrestationsToZero(famille, individus, situation.dateDeValeur);

    return {
        familles: [ famille ],
        foyers_fiscaux: [ foyerFiscal ],
        individus: individus,
        menages: [ buildOpenFiscaEntity(situation, menageSchema, situation) ]
    };
};

exports.buildOpenFiscaRequest = function(situation, debug) {
    return {
        intermediate_variables: debug,
        labels: true,
        scenarios: [{
            test_case: buildOpenFiscaTestCase(situation),
            period: 'month:' + periodTools.toOpenFiscaFormat(situation.dateDeValeur)
        }],
        variables: _.keys(PRESTATIONS)
    };
};

var famillePropertiesGivenToIndividu = Object
    .keys(_.pickBy(PRESTATIONS, function(definition) {
        return definition.type == Number && (! definition.prestationIndividuelle);
    }));

var additionalPropertiesGiven = ['aeeh', 'paje_prepare', 'paje_clca'];

var movedProperties = {
    Famille: {
        properties: famillePropertiesGivenToIndividu
            .concat(additionalPropertiesGiven)
            .map(function(id) { return { name: id }; }),
        sourceKeys: ['parents', 'enfants'],
    },
    Foyer_Fiscal: {
        properties: [{ name: 'pensions_alimentaires_versees', sign: -1 }],
        sourceKeys: ['declarants', 'personnes_a_charge'],
    },
};

var addIndividuProperties = exports.addIndividuProperties = function(definitions, movedRessources) {
    var individuProps = definitions.Individu.properties;

    Object.keys(movedRessources).forEach(function(sourceEntityName) {
        var sourceProps = definitions[sourceEntityName].properties;
        var moveDetails = movedRessources[sourceEntityName];
        var ressourceNames = moveDetails.properties.map(function(ressource) { return ressource.name; });

        ressourceNames.forEach(function(ressourceName) {
            individuProps[ressourceName] = sourceProps[ressourceName];
        });
    });
};

exports.enrichIndividuDefinition = function(definitions) {
    addIndividuProperties(definitions, movedProperties);
};

exports.adaptSimulationForOpenFisca = function(simulation) {
    var testCase = simulation.scenarios[0].test_case;
    var individus = {};

    testCase.individus.forEach(function(individu) {
        individus[individu.id] = individu;
    });

    var entityNameMapping = {
        Famille: 'familles',
        Foyer_Fiscal: 'foyers_fiscaux',
    };

    Object.keys(movedProperties).forEach(function(sourceEntityName) {
        var testCasePropertyName = entityNameMapping[sourceEntityName];
        var moveDetails = movedProperties[sourceEntityName];

        testCase[testCasePropertyName].forEach(function(entity) {
            var entityIndividuIds = [];
            moveDetails.sourceKeys.forEach(function(roleEntity) {
                entity[roleEntity].forEach(function(individuId) {
                    entityIndividuIds.push(individuId);
                });
            });

            moveDetails.properties.forEach(function(property) {
                var sign = property.sign || 1;
                var accum = entityIndividuIds.reduce(function(accum, id) {
                    var individu = individus[id];
                    var individuRessource = individu[property.name];
                    for (var period in individu[property.name]) {
                        if (! accum[period])
                            accum[period] = 0;
                        accum[period] = accum[period] + sign * individuRessource[period];
                    }
                    delete individu[property.name];
                    return accum;
                }, {});

                // Conditionnally added to match logic of applyRessources
                if (Object.keys(accum).length) {
                    entity[property.name] = accum;
                }
            });
        });
    });

    testCase.individus.forEach(function(individu) {
        if (individu.salaire_net_hors_revenus_exceptionnels) {
            delete individu.salaire_net_hors_revenus_exceptionnels;
        }
    });

    return simulation;
};
