/*
** Module dependencies
*/
var mongoose = require('mongoose');

var AcceptanceTestSchema = new mongoose.Schema({
    _created: { type: Date, default: Date.now },
    _updated: { type: Date, default: Date.now },
    situation: { type: mongoose.Schema.Types.ObjectId, ref: 'Situation' },
    name: String,
    description: String,
    droitsAttendus: [mongoose.Schema.Types.Mixed],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
    validated: Boolean
});

mongoose.model('AcceptanceTest', AcceptanceTestSchema);
