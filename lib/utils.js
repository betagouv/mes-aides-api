var crypto = require('crypto');

exports.generateToken = function(lengthInBytes, done) {
    if (!done) {
        done = lengthInBytes;
        lengthInBytes = 48;
    }
    crypto.randomBytes(lengthInBytes, function(ex, buf) {
        done(ex, buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-'));
    });
};
