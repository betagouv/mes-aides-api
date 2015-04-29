_ = require 'lodash'

reverseMap = require '../../../lib/simulation/openfisca/mapping/reverse'


describe 'Reverse mapping', ->
  OPENFISCA_FAMILLE =
    id: 0
    aspa: '2014-11': 1.199
    asi: '2014-11': 1
    acs: '2014-11': 1
    cmu_c: '2014-11': false
    apl: '2014-11': 1
    als: '2014-11': 1
    alf: '2014-11': 1
    aide_logement: '2014-11': 1
    af: '2014-11': 1
    rsa: '2014-11': 1
    rsa_majore: '2014-11': 1
    rsa_non_majore: '2014-11': 1
    asf: '2014-11': 1
    cf: '2014-11': 1
    ass: '2014-11': 1
    paje_base: '2014-11': 1
    bourse_college: '2014-11': 1
    bourse_lycee: '2014-11': 1

  DATE_DE_VALEUR = new Date '2014-11'

  actual = reverseMap OPENFISCA_FAMILLE, DATE_DE_VALEUR

  it 'should remove unused properties', ->
    actual.should.not.have.property 'id'

  describe 'of an amount', ->
    it 'should round', ->
      actual.aspa.should.equal 1.2

    it 'should annualize a yearly amount', ->
      actual.acs.should.equal 1 * 12

  describe 'of a boolean', ->
    it 'should be a pass-through', ->
      actual.cmu_c.should.be.false

  describe 'of an uncomputable value', ->
    familleWithUncomputableRSA = _.clone OPENFISCA_FAMILLE
    familleWithUncomputableRSA.rsa_non_calculable = '2014-11': true

    it 'should set the value to NaN', ->
      reverseMap(familleWithUncomputableRSA, DATE_DE_VALEUR).rsa.should.be.NaN

