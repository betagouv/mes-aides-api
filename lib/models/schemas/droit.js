/*
** Module dependencies
*/
var mongoose = require('mongoose');

var DroitSchema = new mongoose.Schema({
    code: { type: String, required: true },
    expectedValue: { type: mongoose.Schema.Types.Mixed },
    result: { type: mongoose.Schema.Types.Mixed },
    percentDiff: { type: Number },
    status: { type: String, enum: ['accepted-exact', 'accepted-2pct', 'accepted-10pct', 'rejected'] }
});

module.exports = DroitSchema;
