var should = require('should');
var definitions = require('../../lib/models/definitions');

describe('Definitions', function () {

    describe('Individu', function () {
        it('has famille properties', function() {
            definitions.Individu.properties.should.have.ownProperty('acs');
        });
    });
});
