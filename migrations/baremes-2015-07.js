var mongoose = require('mongoose');
var es = require('event-stream');
var moment = require('moment');

var config = require('../lib/config/config');
require('../lib/config/mongoose')(mongoose, config);


// this schema should be imported, but it is in Ludwig, which doesn't export it… awful copy-pasta for throwaway code
var AcceptanceTestSchema = new mongoose.Schema({
    name: { type: String },
    description: { type: String },
    keywords: { type: [String] },

    priority: { type: String, enum: ['low', 'normal', 'high'], required: true, default: 'normal' },
    state: { type: String, enum: ['validated', 'pending', 'rejected', 'unclaimed'], required: true, default: 'pending' },
    rejectionMessage: { type: String },

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    scenario: { type: mongoose.Schema.Types.Mixed, required: true },

    expectedResults: { type: mongoose.Schema.Types.Mixed, required: true },
    currentStatus: { type: String, enum: ['accepted-exact', 'accepted-2pct', 'accepted-10pct', 'rejected'] },
    lastExecution: { type: mongoose.Schema.Types.ObjectId, ref: 'AcceptanceTestExecution' },

    _created: { type: Date },
    _updated: { type: Date }
});

mongoose.model('AcceptanceTest', AcceptanceTestSchema);


var AcceptanceTest = mongoose.model('AcceptanceTest');
var Situation = mongoose.model('Situation');

var TARGET_DATE = new Date('2015-07-02');

function migrateAcceptanceTests(stepDone) {
    AcceptanceTest.find({ keywords: { $in: ['barêmes 1er juillet 2015'] } }).stream()
        .pipe(es.map(function (acceptanceTest, done) {
            acceptanceTest.state = 'validated';

            // test only AF
            acceptanceTest.expectedResults.forEach(function(expectedResult, index) {
                if (expectedResult.code == 'af')
                    acceptanceTest.expectedResults = [ expectedResult ];
            });

            acceptanceTest.save();

            Situation.findById(acceptanceTest.scenario.situationId, function(err, situation) {
                if (err) return done(err);

                situation.dateDeValeur = TARGET_DATE;

                // shift all resources by one month
                situation.individus.forEach(function(individu) {
                    individu.ressources.forEach(function(ressource) {
                        if (ressource.periode.indexOf('-') == -1) return;  // modify only n-1, not n-2

                        var currentMonth = moment(ressource.periode, 'YYYY-MM');
                        currentMonth.add(1, 'month');

                        ressource.periode = currentMonth.format('YYYY-MM');
                    });
                });

                situation.save(done);
            });
        }))
        .on('end', function() {
            console.log('Tests migrés !');
            process.exit();
        })
        .on('error', function(err) {
            console.trace(err);
        });
}

migrateAcceptanceTests();
