var should = require('should');
var mapping = require('../../../lib/simulation/openfisca/mapping');

describe('Ressources', function () {

    describe('# Interruption / Prolongation', function () {

        var situation = {
            dateDeValeur: new Date('2015-03-01'),
            individus: [
                {
                    role: 'conjoint',
                    ressources: [
                        {
                            periode: '2015-02',
                            type: 'indemnites_stage',
                            montant: 200
                        },
                        {
                            periode: '2015-02',
                            type: 'revenus_stage_formation_pro',
                            montant: 300
                        }
                    ],
                    interruptedRessources: ['indemnites_stage'],
                    specificSituations: [],
                }
            ]
        };

        var individu = mapping.mapIndividus(situation)[0];

        it('devrait copier les ressources encore perçues sur le mois courant', function () {
            individu.revenus_stage_formation_pro.should.have.ownProperty('2015-03');
            individu.revenus_stage_formation_pro['2015-03'].should.equal(300);
        });

        it('ne devrait pas copier les ressources dont la perception est interrompue sur le mois courant', function () {
            individu.indemnites_stage.should.not.have.ownProperty('2015-03');
        });

    });

    describe('# Mapping foyer fiscal', function() {
        it('devrait sommer et inverser les pensions alimentaires versées du demandeur et du conjoint', function() {
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

    describe('# Mapping individu', function() {

        var individu_object = {
            role: "demandeur",
            specificSituations: []
        };

        describe('sans patrimoine', function () {

            var situation_sans_patrimoine = {
                dateDeValeur: new Date('2015-03-01'),
                individus: [individu_object]
            };

            var individu = mapping.mapIndividus(situation_sans_patrimoine)[0];

            it('devrait mettre à zéro les informations patrimoniales', function () {
                individu.epargne_non_remuneree.should.have.ownProperty('2012-01');
                individu.epargne_non_remuneree['2012-01'].should.equal(0);
            });
        });

        describe('avec patrimoine', function () {

            var situation_avec_patrimoine = {
                dateDeValeur: new Date('2015-03-01'),
                individus: [individu_object],
                patrimoine: {
                    epargneSansRevenus: 100,
                    captured: true
                }
            };

            var individu = mapping.mapIndividus(situation_avec_patrimoine)[0];

            it('devrait prendre en compte les informations patrimoniales', function () {
                individu.epargne_non_remuneree.should.have.ownProperty('2012-01');
                individu.epargne_non_remuneree['2012-01'].should.equal(100);
            });
        });
    });
});
