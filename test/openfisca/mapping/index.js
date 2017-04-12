var should = require('should');
var _ = require('lodash');
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
                            type: 'stage', // => indemnites_stage
                            montant: 200
                        },
                        {
                            periode: '2015-02',
                            type: 'revenusStageFormationPro', // => revenus_stage_formation_pro
                            montant: 300
                        }
                    ],
                    interruptedRessources: ['stage'],
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

    describe('# Estimation des revenus N-2', function () {
        // Le demandeur touche en réalité 1200 d'ARE par mois depuis 6 mois. Il déclare 7200 de revenus sur l'année glissante.
        // Mes-Aides ne connait que le montant sur l'année glissante et sur chacun des trois derniers mois. Il répartit de manière uniforme les revenus sur les mois M-12 à M-4.
        var situation = {
            dateDeValeur: new Date('2017-04-12'),
            individus: [
                {
                    role: 'demandeur',
                    ressources: [
                        {
                            periode: '2017-03',
                            type: 'allocationsChomage',
                            montant: 1200
                        },
                        {
                            periode: '2017-02',
                            type: 'allocationsChomage',
                            montant: 1200
                        },
                        {
                            periode: '2017-01',
                            type: 'allocationsChomage',
                            montant: 1200
                        },
                        {
                            periode: '2016-12',
                            type: 'allocationsChomage',
                            montant: 400
                        },
                        {
                            periode: '2016-11',
                            type: 'allocationsChomage',
                            montant: 400
                        },
                        {
                            periode: '2016-10',
                            type: 'allocationsChomage',
                            montant: 400
                        },
                        {
                            periode: '2016-09',
                            type: 'allocationsChomage',
                            montant: 400
                        },
                        {
                            periode: '2016-08',
                            type: 'allocationsChomage',
                            montant: 400
                        },
                        {
                            periode: '2016-07',
                            type: 'allocationsChomage',
                            montant: 400
                        },
                        {
                            periode: '2016-06',
                            type: 'allocationsChomage',
                            montant: 400
                        },
                        {
                            periode: '2016-05',
                            type: 'allocationsChomage',
                            montant: 400
                        },
                        {
                            periode: '2016-04',
                            type: 'allocationsChomage',
                            montant: 400
                        },
                    ],
                    specificSituations: [],
                    interruptedRessources: [],
                }
            ]
        };

        var situationWithYearMoins2Captured = _.assign({}, situation, {ressourcesYearMoins2Captured: true});

        it('devrait supposer que les revenus N-2 sont égaux aux revenus de l’année glissante si les revenus N-2 n’ont pas été renseignés', function () {
            var individu = mapping.mapIndividus(situation)[0];
            // Les revenus estimés pour N-2 sont étalés sur 12 mois
            var expectedMappingResult = {
                '2017-04': 1200,  // prolongation
                '2017-03': 1200,
                '2017-02': 1200,
                '2017-01': 1200,
                '2016-12': 400,
                '2016-11': 400,
                '2016-10': 400,
                '2016-09': 400,
                '2016-08': 400,
                '2016-07': 400,
                '2016-06': 400,
                '2016-05': 400,
                '2016-04': 400,
                '2015-12': 600,
                '2015-11': 600,
                '2015-10': 600,
                '2015-09': 600,
                '2015-08': 600,
                '2015-07': 600,
                '2015-06': 600,
                '2015-05': 600,
                '2015-04': 600,
                '2015-03': 600,
                '2015-02': 600,
                '2015-01': 600,
            }
            should.deepEqual(individu.chomage_net, expectedMappingResult);
        });

        it('ne devrait pas supposer que les revenus N-2 sont égaux aux revenus de l’année glissante si les revenus N-2 ont été renseignés', function () {
            var individu = mapping.mapIndividus(situationWithYearMoins2Captured)[0];
            var expectedMappingResult = {
                '2017-04': 1200,  // prolongation
                '2017-03': 1200,
                '2017-02': 1200,
                '2017-01': 1200,
                '2016-12': 400,
                '2016-11': 400,
                '2016-10': 400,
                '2016-09': 400,
                '2016-08': 400,
                '2016-07': 400,
                '2016-06': 400,
                '2016-05': 400,
                '2016-04': 400,
            }
            should.deepEqual(individu.chomage_net, expectedMappingResult);
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
                                type: 'rncPensionsAlimentairesVersees',
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
                                type: 'rncPensionsAlimentairesVersees',
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
