/*
** Module dependencies
*/
var mongoose = require('mongoose');
var _ = require('lodash');
var async = require('async');

var DroitSchema = require('./schemas/droit');

var AcceptanceTestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    keywords: { type: [String] },

    priority: { type: String, enum: ['low', 'normal', 'high'], required: true },
    state: { type: String, enum: ['validated', 'pending', 'rejected'], required: true },
    rejectionMessage: { type: String },

    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },

    situation: { type: mongoose.Schema.Types.ObjectId, ref: 'Situation' },
    expectedResults: [DroitSchema],
    lastExecution: { type: mongoose.Schema.Types.ObjectId, ref: 'AcceptanceTestExecution' },

    _created: { type: Date },
    _updated: { type: Date }

});

AcceptanceTestSchema.methods = {

    execute: function(done) {
        var AcceptanceTestExecution = mongoose.model('AcceptanceTestExecution');
        var acceptanceTest = this;

        function simulate() {
            acceptanceTest.situation.simulate(function(err, results) {
                if (err) return done(err);
                var execution = new AcceptanceTestExecution();
                execution
                    .set('acceptanceTest', acceptanceTest._id)
                    .set('results', _.map(results, function(value, code) {
                        return { code: code, value: value };
                    }))
                    .set('date', Date.now())
                    .save(function(err) {
                        if (err) return done(err);
                        acceptanceTest
                            .set('lastExecution', execution._id)
                            .save(function(err) {
                                if (err) return done(err);
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
    },

    createActivity: function (activity, done) {
        mongoose.model('AcceptanceTestActivity').create(_.extend(activity, { acceptanceTest: this._id }), done);
    },

    saveUpdate: function (user, done) {
        var acceptanceTest = this;

        async.parallel([
            function (cb) { acceptanceTest.save(cb); },
            function (cb) { acceptanceTest.createActivity({ type: 'update', date: Date.now(), user: user._id }, cb); }
        ], function (err) {
            if (err) return done(err);
            done(null, acceptanceTest);
        });
    },

    removeAll: function (done) {
        var acceptanceTest = this;
        var AcceptanceTestActivity = mongoose.model('AcceptanceTestActivity');
        var AcceptanceTestExecution = mongoose.model('AcceptanceTestExecution');

        async.parallel([
            function (cb) { acceptanceTest.remove(cb); },
            function (cb) { AcceptanceTestExecution.remove({ acceptanceTest: acceptanceTest._id }, cb); },
            function (cb) { AcceptanceTestActivity.remove({ acceptanceTest: acceptanceTest._id }, cb); }
        ], done);
    },

    updateValidationState: function (validationState, user, rejectionMessage, done) {
        var acceptanceTest = this;

        async.parallel([
            function (cb) {
                acceptanceTest
                    .set('state', validationState)
                    .set('rejectionMessage', rejectionMessage)
                    .save(cb);
            },
            function (cb) {
                acceptanceTest.createActivity({
                    type: 'validation_update',
                    date: Date.now(),
                    user: user._id,
                    content: {
                        state: validationState,
                        rejectionMessage: validationState === 'rejected' ? rejectionMessage : undefined
                    }
                }, cb);
            }
        ], done);
    },

    timeline: function (done) {
        mongoose.model('AcceptanceTestActivity')
            .find()
            .where('acceptanceTest').equals(this._id)
            .sort({date: -1})
            .select('-acceptanceTest')
            .populate('user', '-password -isAdmin -email')
            .exec(function (err, activities) {
                if (err) return done(err);
                done(null, activities);
            });
    }

};

AcceptanceTestSchema.statics = {

    createNew: function (acceptanceTestAttributes, situation, user, done) {
        acceptanceTestAttributes = _.pick(acceptanceTestAttributes, 'name', 'description', 'keywords', 'expectedResults');

        var creationDate = Date.now();

        var acceptanceTest = (new this(acceptanceTestAttributes))
            .set('user', user._id)
            .set('situation', situation._id)
            .set('priority', 'normal')
            .set('state', 'pending')
            .set('_created', creationDate)
            .set('_updated', Date.now());

        situation.set('status', 'test');

        async.parallel([
            function (cb) { acceptanceTest.save(cb); },
            function (cb) { situation.save(cb); },
            function (cb) {
                acceptanceTest.createActivity({ type: 'creation', date: creationDate, user: user._id }, cb);
            }
        ], function (err) {
            if (err) return done(err);
            acceptanceTest.execute(function(err) {
                if (err) return done(err);
                done(null, acceptanceTest);
            });
        });
    }

};

mongoose.model('AcceptanceTest', AcceptanceTestSchema);
