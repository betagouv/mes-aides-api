var mongoose = require('mongoose');
var es = require('event-stream');
var config = require('../lib/config/config');

require('../lib/config/mongoose')(mongoose, config);

var Situation = mongoose.model('Situation');

var situationsToMigrate = [
    '54e223cbfe7cc56a2d0dc053',
    '548ac1ccc498cde71866d640',
    '53d2663ae40a7902009c33b7',
    '546b234a8de28ffd63d63f25',
    '546c654b758688224be49e42',
    '54886dfcabf75f42509fb3df',
    '546b0d3dfb9f05fb6373bca4',
    '5485c4e1bf1777d606ad1d7c',
    '53d2521be40a7902009c338c',
    '5485819bbf1777d606ad1c21',
    '5485c1d69faa7acd0629b071',
    '5485be7b5f35e8cf064ba4c9',
    '5475a9af76a4260d7262adf8',
    '5485b81b9f3789cc06d51be6',
    '53d2510ee40a7902009c337e',
    '5485b27abf1777d606ad1d15',
    '5485ab9ead7a80d20646bac1',
    '547c8139cc51d53d260e88ac',
    '547d8536bd420d34260ba241',
    '547d8379cc51d53d260e896a',
    '54789ec5fccedf3f260aeb2f',
    '5478a0b1d97a8932263c255c',
    '54899a7139cebb44502f7eab',
    '5489c3dff8282c4b50f1417e',
    '5485c850a041b2cb06ed1b0e',
    '5485781e62ae92d806fed219',
    '544f7ddb75fec1b37e6c01ae',
    '54788cf62ab029677eb0f71c',
    '53d24cdde40a7902009c3372',
    '53d2555ee40a7902009c339d',
    '54dc7aa54ec19fce44227a7e',
    '548ab521bc9a25ea18874c72',
    '54886ccdabf75f42509fb3d0',
    '546b06b5fc9936ff63f85641',
    '54e4c0af459888564014094f',
    '53d24d39e40a7902009c3378',
    '548863e239cebb44502f71f0',
    '546b26ffde0b44f86312e8a0',
    '546b3bfdfb9f05fb6373bd1c',
    '545bbc9d71135d04138c34f8',
    '54648fa93005e57370c2f361',
    '545bbc0355a4c10113ad0807',
    '54dc75f5e45751d544f07232',
    '5485b63b5f35e8cf064ba48d',
    '546b452f5d4a0b016431dc2f',
    '53d25181e40a7902009c3385',
    '548ababf9abf6bee18978974',
    '547c7e4dcc51d53d260e889d',
    '5485b08f5f35e8cf064ba471',
    '53d255dae40a7902009c33a4',
    '546b1d6d8de28ffd63d63ef7',
    '547c8b20fccedf3f260aed49',
    '54e21c1421f5286b2df324aa',
    '54857d38a041b2cb06ed1960',
    '546b190bfc9936ff63f85669',
    '5458d8d72ea381577f2ba35f',
    '54899d43602ed649506ac7f6'
];

Situation.find({ _id: { $in: situationsToMigrate } }).stream()
    .pipe(es.map(function (situation, done) {
        situation.individus.forEach(function (individu) {
            individu.ressources.forEach(function (ressource) {
                if (ressource.type === 'pensionsRetraitesRentes') {
                    ressource.montant = Math.round(ressource.montant * 0.926 * 100) / 100;
                }
                if (ressource.type === 'revenusSalarie') {
                    ressource.montant = Math.round(ressource.montant * 0.78 * 100) / 100;
                }
            });
        });
        situation.save(function (err) {
            if (err) console.log('Cannot save migrated situation %s', situation.id);
            else console.log('Situation migrée');
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
