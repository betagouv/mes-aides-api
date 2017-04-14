var mongoose = require('mongoose');
var _ = require('lodash');
var es = require('event-stream');
var config = require('../lib/config/config');

require('../lib/config/mongoose')(mongoose, config);

var Situation = mongoose.model('Situation');

var mapping = {
    'primeActivite': 'ppa',
    'prepare': 'paje_prepare',
    'clca': 'paje_clca'
};

var keys = _.keys(mapping);

Situation.find({ 'individus.ressources.type': { '$in': _.keys(mapping) } }).stream()
    .pipe(es.map(function (situation, done) {
        var isSituationUpdated = false;
        situation.individus.forEach(function (individu) {
            individu.ressources.forEach(function(ressource) {
                if (_.contains(keys, ressource.type)) {
                    ressource.type = mapping[ressource.type];
                    isSituationUpdated = true;
                }
            });
        });
        situation.save(function (err) {
            if (err) {
                console.log('Cannot save migrated situation %s', situation.id);
                console.trace(err);
            }
            else if (isSituationUpdated) {
                console.log('Situation migrée');
            }
            done();
        });
    }))
    .on('end', function() {
        console.log('Terminé');
        process.exit();
    })
    .on('error', function(err) {
        console.trace(err);
        process.exit();
    })
    .resume();
