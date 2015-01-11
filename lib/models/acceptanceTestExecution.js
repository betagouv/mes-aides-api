/*
** Module dependencies
*/
var mongoose = require('mongoose');
var DroitSchema = require('./schemas/droit');

var AcceptanceTestExecutionSchema = new mongoose.Schema({
    acceptanceTest: { type: mongoose.Schema.Types.ObjectId, ref: 'AcceptanceTest', required: true },
    date: { type: Date, required: true },
    results: [DroitSchema],
    status: { type: String, enum: ['accepted-exact', 'accepted-2pct', 'accepted-10pct', 'rejected'] }
});

mongoose.model('AcceptanceTestExecution', AcceptanceTestExecutionSchema);
