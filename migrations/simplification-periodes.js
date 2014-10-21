var mongoose = require('mongoose');
var _ = require('lodash');
var moment = require('moment');
var config = require('../lib/config/config');

require('../lib/config/mongoose')(mongoose, config);

var Situation = mongoose.model('Situation');

var stream = Situation.find({ status: 'test' }).stream();

function convertRessources(ressources) {
    var byType = _.groupBy(ressources, 'type');

    return _.flatten(_.map(byType, function(ressourceEntries, ressourceType) {
        var periodes = {};

        ressourceEntries.forEach(function(entry) {
            if (entry.periode) {
                if (!periodes[entry.periode]) periodes[entry.periode] = 0;
                periodes[entry.periode] += entry.montant;
            }
        });

        ressourceEntries.forEach(function(entry) {
            if (entry.debutPeriode) {
                var montant = entry.montant;
                var dureeEnMois = 12;
                var diviseur = dureeEnMois;
                var debutPeriode = moment(entry.debutPeriode, 'YYYY-MM');
                for (var i = 0; i < dureeEnMois; i++) {
                    var periode = debutPeriode.clone().add(i, 'months');
                    if (periode.format('YYYY-MM') in periodes) {
                        montant -= periodes[periode.format('YYYY-MM')];
                        diviseur--;
                    }
                }
                for (var i = 0; i < dureeEnMois; i++) {
                    var periode = debutPeriode.clone().add(i, 'months');
                    if (!(periode.format('YYYY-MM') in periodes)) {
                        periodes[periode.format('YYYY-MM')] = Math.round(montant / diviseur);
                    }
                }
            }
        });

        return _.map(periodes, function(nouveauMontant, nouvellePeriode) {
            // if (!_.isNumber(nouveauMontant)) console.log({ type: ressourceType, montant: nouveauMontant, periode: nouvellePeriode });
            return { type: ressourceType, montant: nouveauMontant, periode: nouvellePeriode };
        });

    }));
}

stream.on('data', function(situation) {
    situation.individus.forEach(function(individu) {
        individu.ressources = convertRessources(individu.ressources);
    });

    var revenusLocatifs = situation.patrimoine.revenusLocatifs.map(function(revenu) {
        revenu.type = 'revenusLocatifs';
        return revenu;
    });

    var revenusDuCapital = situation.patrimoine.revenusDuCapital.map(function(revenu) {
        revenu.type = 'revenusDuCapital';
        return revenu;
    });
    situation.patrimoine.revenusDuCapital = convertRessources(revenusDuCapital);
    situation.patrimoine.revenusLocatifs = convertRessources(revenusLocatifs);

    // console.log(situation);

    situation.save(function(err) {
        if (err) return console.trace(err);
        console.log('saved');
    });
});

stream.on('end', function() {

});

stream.on('error', function(err) {
    console.trace(err);
});
