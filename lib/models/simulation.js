var mongoose = require('mongoose');

var schemaGenerator = require('../schemaGenerator');
var definitions = require('./definitions');

var Schemas = schemaGenerator.generateSchemasFromOpenAPIDefinitions(definitions);

mongoose.model('Simulation', Schemas.Simulation);
