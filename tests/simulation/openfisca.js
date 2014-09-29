var openfisca = require('../../lib/simulation/openfisca');
var should = require('should');

describe('openfisca', function() {
    describe('mapFamilles', function() {
        it('should map parents', function() {
            // given
            var situation = {
                individus: [
                    {
                        _id: 'demandeur',
                        role: 'demandeur'
                    },
                    {
                        _id: 'conjoint',
                        role: 'conjoint'
                    },
                    {
                        _id: 'test',
                        role: 'test'
                    }
                ]
            };

            // when
            var result = openfisca.mapFamilles(situation);

            // then
            result.should.eql([{ parents: ['demandeur', 'conjoint'], enfants: [] }]);
        });

        it('should map children', function() {
            // given
            var situation = {
                individus: [
                    {
                        _id: 'enfant1',
                        role: 'enfant'
                    },
                    {
                        _id: 'enfant2',
                        role: 'enfant'
                    },
                    {
                        _id: 'test',
                        role: 'test'
                    }
                ]
            };

            // when
            var result = openfisca.mapFamilles(situation);

            // then
            result.should.eql([{ parents: [], enfants: ['enfant1', 'enfant2'] }]);
        });
    });

    describe('mapMenages', function() {
        it('should map demandeur as personne de référence', function() {
            // given
            var situation = {
                logement: {},
                individus: [
                    {
                        _id: 'demandeur',
                        role: 'demandeur'
                    }
                ]
            };

            // when
            var result = openfisca.mapMenages(situation);

            // then
            result.should.eql([{ personne_de_reference: 'demandeur', enfants: [] }]);
        });

        it('should map conjoint if provided', function() {
            // given
            var situation = {
                logement: {},
                individus: [
                    {
                        _id: 'demandeur',
                        role: 'demandeur'
                    },
                    {
                        _id: 'conjoint',
                        role: 'conjoint'
                    }
                ]
            };

            // when
            var result = openfisca.mapMenages(situation);

            // then
            result.should.eql([{ personne_de_reference: 'demandeur', conjoint: 'conjoint', enfants: [] }]);
        });

        it('should map children', function() {
            // given
            var situation = {
                logement: {},
                individus: [
                    {
                        _id: 'demandeur',
                        role: 'demandeur'
                    },
                    {
                        _id: 'enfant',
                        role: 'enfant'
                    },
                    {
                        _id: 'test',
                        role: 'test'
                    }
                ]
            };

            // when
            var result = openfisca.mapMenages(situation);

            // then
            result.should.eql([{ personne_de_reference: 'demandeur', enfants: ['enfant'] }]);
        });
    });

    describe('mapFoyersFiscaux', function() {
        it('should map parents as declarants', function() {
            // given
            var situation = {
                individus: [
                    {
                        _id: 'demandeur',
                        role: 'demandeur',
                        dateDeNaissance: '1989-09-14'
                    },
                    {
                        _id: 'conjoint',
                        role: 'conjoint',
                        dateDeNaissance: '1989-09-14'
                    }
                ]
            };

            // when
            var result = openfisca.mapFoyersFiscaux(situation);

            // then
            result.should.eql([{ declarants: ['demandeur', 'conjoint'], personnes_a_charge: [] }]);
        });
    });

    describe('mapIndividus', function() {
        it('should map to an well-formatted object for openfisca', function() {
            // given
            var situation = {
                individus: [
                    {
                        _id: 'demandeur',
                        dateDeNaissance: '1989-09-14'
                    }
                ]
            };

            // when
            var result = openfisca.mapIndividus(situation);

            // then
            result.length.should.be.exactly(1);
            result[0].id.should.be.exactly('demandeur');
            result[0].birth.should.be.exactly('1989-09-14');
        });

        it('should throw an exception if no birth date is provided for an individu', function() {
            // given
            var situation = {
                individus: [
                    {
                        _id: 'demandeur',
                        role: 'demandeur'
                    }
                ]
            };

            // when
            var result = openfisca.mapIndividus.bind(null, situation);

            // then
            result.should.throw('L\'individu de role "demandeur" n\'a pas de date de naissance renseignée');
        });

        it('should map the given patrimoine in the situation on the demandeur', function() {
            // given
            var situation = {
                logement: {},
                patrimoine: {
                    revenusLocatifs: [],
                    valeurLocativeImmoNonLoue: 1,
                    valeurLocativeTerrainNonLoue: 1,
                    revenusDuCapital: [],
                    epargneSurLivret: 1,
                    epargneSansRevenus: 1
                },
                individus: [{role: 'demandeur', dateDeNaissance: '1989-09-14'}]
            };

            // when
            var result = openfisca.mapIndividus(situation);

            // then
            result[0].should.have.property('epargne_non_remuneree', 1);
            result[0].should.have.property('valeur_locative_immo_non_loue');
            result[0].should.have.property('valeur_locative_terrains_non_loue');
            result[0].should.have.property('revenus_locatifs', 0);
            result[0].should.have.property('revenus_capital', 0);
        });

        it('should add a coloc field if logement is colocation', function() {
            // given
            var situation = {
                logement: {type: 'locataire', colocation: true},
                individus: [{role: 'demandeur', dateDeNaissance: '1989-09-14'}]
            };

            // when
            var result = openfisca.mapIndividus(situation);

            // then
            result[0].should.have.property('coloc', 1);
        });
    });

    describe('mapLogement', function() {
        it('should set menage status occupation corresponding to logement type', function() {
            // given
            var logements = [
                {
                    type: 'locataire',
                    locationType: 'nonmeuble',
                    expectedSo: 4
                },
                {
                    type: 'locataire',
                    locationType: 'meublehotel',
                    expectedSo: 5
                },
                {
                    type: 'proprietaire',
                    primoAccedant: true,
                    expectedSo: 1
                }
            ];
            var results = [];

            // when
            logements.forEach(function(logement) {
                var result = {};
                openfisca.mapLogement(logement, result);
                results.push(result.so);
            });

            // then
            for (var i = 0; i < logements.length - 1; i++) {
                results[i].should.be.exactly(logements[i].expectedSo);
            }
        });

        it('should not set field menage.so when logement type is unknown', function() {
            // given
            var logement = {type: 'unknown'};
            var result = {};

            // when
            openfisca.mapLogement(logement, result);

            // then
            result.should.not.have.property('so');
        });
    });
});
