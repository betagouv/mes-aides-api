/*
** Module dependencies
*/
var mongoose = require('mongoose');

var AcceptanceTestExecutionSchema = new mongoose.Schema({
    acceptanceTest: { type: mongoose.Schema.Types.ObjectId, ref: 'AcceptanceTest', required: true },
    date: { type: Date, required: true },
    droitsCalcules: { type: mongoose.Schema.Types.Mixed, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true }
});

mongoose.model('AcceptanceTestExecution', AcceptanceTestExecutionSchema);
