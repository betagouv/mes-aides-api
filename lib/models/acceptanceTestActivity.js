/*
** Module dependencies
*/
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ACTIVITY_TYPES = ['validation_update', 'comment', 'creation', 'update', 'results_update'];

var AcceptanceTestActivitySchema = new Schema({
    date: { type: Date, required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    type: { type: String, enum: ACTIVITY_TYPES, required: true },
    acceptanceTest: { type: Schema.Types.ObjectId, ref: 'AcceptanceTest', required: true, index: true },
    content: { type: Schema.Types.Mixed }
});

mongoose.model('AcceptanceTestActivity', AcceptanceTestActivitySchema);
