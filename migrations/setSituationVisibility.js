setSituationVisibility = require('./migrations').setSituationVisibility;

var situationId = process.argv[2];

// Make the situation non visible only if a "false" additional argument have been passed
var visibility = process.argv.length <= 3 || process.argv[3] != "false";

setSituationVisibility(situationId, visibility, function() {
    process.exit();
});
