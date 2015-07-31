individuHelpers = require '../../../lib/simulation/openfisca/mapping/common'
should = require 'should'

describe 'isIndividuValid', ->
  SITUATION =
    dateDeValeur: new Date '2015-01'

  describe 'an adult', ->
    target =
      role: 'demandeur'
      situationsPro: []
      dateDeNaissance: new Date '1940-01'

    it 'should be valid', ->
      individuHelpers.isIndividuValid(target, SITUATION).should.be.ok

  describe 'a child', ->
    target =
      role: 'enfant'

    describe 'under 25', ->
      before ->
          target['situationsPro'] = []
          target['dateDeNaissance'] = new Date '2010-01'

      it 'should be valid', ->
        individuHelpers.isIndividuValid(target, SITUATION).should.be.ok

    describe 'over 25', ->
      before ->
        target['situationsPro'] = []
        target['dateDeNaissance'] = new Date '1970-01'

      it 'should not be valid', ->
        should(individuHelpers.isIndividuValid(target, SITUATION)).not.be.ok

      describe 'disabled', ->
        before ->
          target['situationsPro'] = []
          target['dateDeNaissance'] = new Date '1970-01'
          target.situationsPro.push { situation: 'handicap' }

        it 'should be valid', ->
          individuHelpers.isIndividuValid(target, SITUATION).should.be.ok
