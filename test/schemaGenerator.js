var should = require('should');
var subject = require('../lib/schemaGenerator').generateSchemaStructuresFromOpenAPIDefinitions;

function definitionGeneration(properties) {
    return {
        additionalProperties: false,
        properties: properties,
        type: 'object',
    };
}
describe('Schema generator', function () {
    it('exists', function() {
        subject.should.be.ok();
    });

    it('returns an object with identical keys', function() {
        var def = definitionGeneration({});
        var definitions = { One: def, Two: def, Three: def };

        var result = subject(definitions);
        Object.keys(result).should.containDeep(Object.keys(definitions));
    });

    describe('Property generation', function() {

        it('processes strings', function() {
            var def = definitionGeneration({
                property: {
                    type: 'string',
                },
            });
            var result = subject({ Obj: def });
            result.Obj.property.should.equal(String);
        });

        it('processes references', function() {
            var main = definitionGeneration({
                nested: {
                    additionalProperties: {
                        '$ref': '#/definitions/Nested'
                    },
                    type: 'object',
                }
            });
            var nested = definitionGeneration({
                property: { type: 'string' }
            });

            var definitions = {
                Nested: nested,
                Main: main
            };

            var result = subject(definitions);
            result.Main.nested.property.should.equal(String);
        });
    });
});
