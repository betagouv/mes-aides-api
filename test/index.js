var should = require('should');
var _ = require('lodash');
var mapping = require('../lib/simulation/openfisca/mapping');

describe('Resources mapping', function () {

    describe('Prolongation', function () {

        var situation = {
            dateDeValeur: new Date('2015-03-01'),
            individus: [
                {
                    role: 'conjoint',
                    ressources: [
                        {
                            periode: '2015-02',
                            type: 'indemnites_stage', // => indemnites_stage
                            montant: 200
                        },
                        {
                            periode: '2015-02',
                            type: 'revenus_stage_formation_pro', // => revenus_stage_formation_pro
                            montant: 300
                        }
                    ],
                    interruptedRessources: ['indemnites_stage'],
                    specificSituations: [],
                }
            ]
        };

        var individu = mapping.mapIndividus(situation)[0];

        it('should by default project on the current month the resources declared for the last month', function () {
            individu.revenus_stage_formation_pro.should.have.ownProperty('2015-03');
            individu.revenus_stage_formation_pro['2015-03'].should.equal(300);
        });

        it('should not project on the current month the resources declared for the last month if this resource has been declared interrupted', function () {
            individu.indemnites_stage.should.not.have.ownProperty('2015-03');
        });

    });

    describe('N-2 resources estimation', function () {
        var situation = require('./assets/NM2Situation')

        var situationWithYearMoins2Captured = _.assign({}, situation, {ressourcesYearMoins2Captured: true});

        it('should assume the resources for N-2 are equals to the resources for the last rolling year if the N-2 resources haven’t been declared', function () {
            var individu = mapping.mapIndividus(situation)[0];
            var expectedMappingResult = require('./assets/NM2OutputWithEstimation')
            should.deepEqual(individu.chomage_net, expectedMappingResult);
        });

        it('should not assume the resources for N-2 are equals to the resources for the last rolling year if the N-2 resources have been declared', function () {
            var individu = mapping.mapIndividus(situationWithYearMoins2Captured)[0];
            var expectedMappingResult = require('./assets/NM2OutputWithoutEstimation')
            should.deepEqual(individu.chomage_net, expectedMappingResult);
        });
    });

    describe('Foyer fiscal mapping', function() {
        it('should sum pensions alimentaires versées for the demandeur and conjoint and take the opposite', function() {
            var situation = {
                dateDeValeur: new Date('2015-03-01'),
                individus: [
                    {
                        role: 'demandeur',
                        ressources: [
                            {
                                periode: '2013',
                                type: 'pensions_alimentaires_versees_ym2',
                                montant: 3000
                            }
                        ],
                        specificSituations: [],
                    },
                    {
                        role: 'conjoint',
                        ressources: [
                            {
                                periode: '2013',
                                type: 'pensions_alimentaires_versees_ym2',
                                montant: 3000
                            }
                        ],
                        specificSituations: [],
                    }
                ],
                ressourcesYearMoins2Captured: true
            };

            var foyerFiscal = mapping.mapFoyerFiscal(situation);

            foyerFiscal.pensions_alimentaires_versees.should.have.ownProperty('2013');
            foyerFiscal.pensions_alimentaires_versees['2013'].should.equal(-6000);
        });
    });

});
