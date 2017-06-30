var mongoose = require('mongoose');

var openfiscaSpec = require('./openfisca-api-spec');

var additionalDefinitions = {
    TestCase: {
        additionalProperties: false,
        properties: {
            familles: {
                items: {
                    '$ref': '#/definitions/Famille',
                },
                type: 'array',
            },
            foyers_fiscaux: {
                items: {
                    '$ref': '#/definitions/Foyer_Fiscal',
                },
                type: 'array',
            },
            individus: {
                items: {
                    '$ref': '#/definitions/Individu',
                },
                type: 'array',
            },
            menages: {
                items: {
                    '$ref': '#/definitions/Menage',
                },
                type: 'array',
            },
        },
        type: 'object',
    },
    Scenario: {
        additionalProperties: false,
        properties: {
            test_case: {
                additionalProperties: {
                    '$ref': '#/definitions/TestCase'
                },
                'type': 'object'
            },
            period: {
                type: 'String',
            },
        },
        type: 'object',
    },
    Simulation: {
        additionalProperties: false,
        properties: {
            intermediate_variables: {
                type: 'Boolean',
            },
            labels: {
                type: 'Boolean',
            },
            scenarios: {
                items: {
                    '$ref': '#/definitions/Scenario',
                },
                type: 'array',
            },
            variables: {
                items: {
                    type: 'string'
                },
                type: 'array',
            }
        },
        type: 'object',
    },
};

Object.assign(openfiscaSpec.definitions, additionalDefinitions);


var schemaGenerator = require('../schemaGenerator');

var Schemas = schemaGenerator.generateSchemasFromOpenAPIDefinitions(openfiscaSpec.definitions);

mongoose.model('Simulation', Schemas.Simulation);
