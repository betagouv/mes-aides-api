individuHelpers = require '../../../lib/simulation/openfisca/mapping/index'


describe 'isIndividuValid', ->
  SITUATION =
    dateDeValeur: new Date '2015-01'

  describe 'an adult', ->
    target =
      role: 'demandeur'
      situationsPro: []
      dateDeNaissance: new Date '1940-01'

    it 'should be valid', ->
      individuHelpers.isIndividuValid(SITUATION, target).should.be.true

  describe 'a child', ->
    target =
      role: 'enfant'
      situationsPro: []

    describe 'under 25', ->
      dateDeNaissance: new Date '2010-01'

      it 'should be valid', ->
        individuHelpers.isIndividuValid(SITUATION, target).should.be.true

    describe 'over 25', ->
      dateDeNaissance: new Date '1970-01'

      it 'should not be valid', ->
        individuHelpers.isIndividuValid(SITUATION, target).should.be.false

      describe 'disabled', ->
        target.situationsPro.push { situation: 'handicap' }

        it 'should be valid', ->
          individuHelpers.isIndividuValid(SITUATION, target).should.be.true
