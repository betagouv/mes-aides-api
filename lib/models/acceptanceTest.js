/*
** Module dependencies
*/
var mongoose = require('mongoose');
var _ = require('lodash');
var DroitSchema = require('./schemas/droit');

var AcceptanceTestSchema = new mongoose.Schema({
    _created: { type: Date },
    _updated: { type: Date },
    situation: { type: mongoose.Schema.Types.ObjectId, ref: 'Situation' },
    name: String,
    description: String,
    droitsAttendus: [DroitSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
    derniereExecution: { type: mongoose.Schema.Types.ObjectId, ref: 'AcceptanceTestExecution' },
    state: { type: String, enum: ['validated', 'pending', 'rejected'], default: 'pending' },
    comment: String
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
        var AcceptanceTestExecution = mongoose.model('AcceptanceTestExecution');
        var acceptanceTest = this;

        function simulate() {
            acceptanceTest.situation.simulate(function(err, result) {
                if (err) return done(err);
                var execution = new AcceptanceTestExecution();
                execution
                    .set('acceptanceTest', acceptanceTest._id)
                    .set('droitsCalcules', _.map(result, function(value, code) {
                        return { code: code, value: value };
                    }))
                    .set('createdBy', user._id)
                    .set('date', Date.now())
                    .save(function(err) {
                        if (err) return done(err);
                        acceptanceTest
                            .set('derniereExecution', execution._id)
                            .save(function(err) {
                                if (err) {
                                    console.log('Error: unable to persist acceptanceTest.derniereExecution');
                                    return done(err);
                                }
                                done(null, execution);
                            });
                    });
            });
        }

        if (this.populated('situation')) {
            simulate();
        } else {
            this.populate('situation', function(err) {
                if (err) return done(err);
                simulate();
            });
        }
    }

};

mongoose.model('AcceptanceTest', AcceptanceTestSchema);
