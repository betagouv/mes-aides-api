/*
** Module dependencies
*/
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var OrganizationSchema = new Schema({
    name: { type: String, required: true },
    dep: String,
    roles: [String]
});

mongoose.model('Organization', OrganizationSchema);
