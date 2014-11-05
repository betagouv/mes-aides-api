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
    validated: Boolean
});

AcceptanceTestSchema.pre('save', function(next) {
    if (this.isNew) {
        this.set('_created', Date.now());
        this.set('_updated', Date.now());
    }
    next();
});

mongoose.model('AcceptanceTest', AcceptanceTestSchema);
