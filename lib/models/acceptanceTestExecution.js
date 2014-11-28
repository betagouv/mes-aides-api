/*
** Module dependencies
*/
var mongoose = require('mongoose');
var DroitSchema = require('./schemas/droit');

var AcceptanceTestExecutionSchema = new mongoose.Schema({
    acceptanceTest: { type: mongoose.Schema.Types.ObjectId, ref: 'AcceptanceTest', required: true },
    date: { type: Date, required: true },
    droitsCalcules: [DroitSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true }
});

mongoose.model('AcceptanceTestExecution', AcceptanceTestExecutionSchema);
