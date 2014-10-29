/*
** Module dependencies
*/
var mongoose = require('mongoose');

var AcceptanceTestSchema = new mongoose.Schema({
    _updated: Date,
    situation: { type: mongoose.Schema.Types.ObjectId, ref: 'Situation' },
    name: String,
    description: String,
    droitsAttendus: [mongoose.Schema.Types.Mixed],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
    validated: Boolean
});

mongoose.model('AcceptanceTest', AcceptanceTestSchema);
