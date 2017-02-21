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
    aide_logement_non_calculable: '2014-11': ''
    af: '2014-11': 1
    rsa: '2014-11': 1
    rsa_non_calculable: '2014-11': ''
    asf: '2014-11': 1
    cf: '2014-11': 1
    ass: '2014-11': 1
    paje_base: '2014-11': 1
    bourse_college: '2014-11': 1
    bourse_lycee: '2014-11': 1
    paris_logement_familles: '2014-11': 1
    paris_forfait_famille: '2014-11': 1
    paris_logement_psol: '2014-11': 1
    paris_logement: '2014-11': 1
    paris_logement_plfm: '2014-11': 1
    paris_logement_aspeh: '2014-11': 1
    paris_energie_famille: '2014-11': 1
    paris_complement_sante: '2014-11': 1
    adpa: '2014-11': 1
    rennes_metropole_transport: '2014-11': 1
    ppa: '2014-11': 1

  INDIVIDU =
    aah: '2014-11': 2
    aah_non_calculable: '2014-11': ''
    specificSituations: []

  OPENFISCA_RESPONSE =
    value: [familles: [OPENFISCA_FAMILLE], individus: [INDIVIDU]]

  SITUATION =
    dateDeValeur: new Date '2014-11'
    individus: [ressources:[]]

  actual = reverseMap OPENFISCA_RESPONSE, SITUATION

  it 'should remove unused properties', ->
    actual.calculatedPrestations.should.not.have.property 'id'

  it 'should extract individual prestations', ->
    actual.calculatedPrestations.aah.should.equal 2

  describe 'of an amount', ->
    it 'should round', ->
      actual.calculatedPrestations.aspa.should.equal 1.2

  describe 'of a boolean', ->
    it 'should be a pass-through', ->
      actual.calculatedPrestations.cmu_c.should.be.false

  describe 'of an uncomputable value', ->
    REASON = 'tns'
    familleWithUncomputableRSA = _.clone OPENFISCA_FAMILLE
    familleWithUncomputableRSA.rsa_non_calculable = '2014-11': REASON
    openfiscaResponseWithUncomputableRSA =
      value: [familles: [familleWithUncomputableRSA], individus: []]

    it 'should set the value to the identifier of the uncomputability', ->
      reverseMap(openfiscaResponseWithUncomputableRSA, SITUATION).calculatedPrestations.rsa.should.equal REASON

