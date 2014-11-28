/*
** Module dependencies
*/
var mongoose = require('mongoose');

var DroitSchema = new mongoose.Schema({
    code: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true }
});

module.exports = DroitSchema;
