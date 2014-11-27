/*
** Module dependencies
*/
var mongoose = require('mongoose');

var AcceptanceTestSchema = new mongoose.Schema({
    _created: { type: Date },
    _updated: { type: Date },
    situation: { type: mongoose.Schema.Types.ObjectId, ref: 'Situation' },
    name: String,
    description: String,
    droitsAttendus: [mongoose.Schema.Types.Mixed],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
    derniereExecution: { type: mongoose.Schema.Types.ObjectId, ref: 'AcceptanceTestExecution' },
    validated: Boolean
});

AcceptanceTestSchema.pre('save', function(next) {
    if (this.isNew) {
        this.set('_created', Date.now());
        this.set('_updated', Date.now());
    }
    next();
});

AcceptanceTestSchema.methods = {

    execute: function(user, done) {

        if (this.populated('situation')) {
            simulate();
        } else {
            this.populate('situation', function(err) {
                if (err) return done(err);
                simulate();
            });
        }

        var AcceptanceTestExecution = mongoose.model('AcceptanceTestExecution');
        var acceptanceTest = this;

        function simulate() {
            acceptanceTest.situation.simulate(function(err, result) {
                if (err) return done(err);
                var execution = new AcceptanceTestExecution();
                execution
                    .set('acceptanceTest', acceptanceTest._id)
                    .set('droitsCalcules', result)
                    .set('createdBy', user._id)
                    .set('date', Date.now())
                    .save(function(err) {
                        if (err) return done(err);
                        acceptanceTest
                            .set('derniereExecution', execution._id)
                            .save(function(err) {
                                if (err) console.log('Error: unable to persist acceptanceTest.dernierExecution');
                                done(null, execution);
                            });
                    });
            });
        }


    }

};

mongoose.model('AcceptanceTest', AcceptanceTestSchema);
