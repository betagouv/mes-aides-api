var mongoose = require('mongoose');
var LocalStrategy = require('passport-local').Strategy;

var User = mongoose.model('User');

module.exports = function(passport) {

    // Serialize the user id to push into the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // Deserialize the user object based on a pre-serialized token
    // which is the user id
    passport.deserializeUser(function(id, done) {
        User
            .findById(id)
            .select('-password')
            .exec(function(err, user) {
                done(err, user);
            });
    });

    passport.use('local', new LocalStrategy(
        { usernameField: 'email', passwordField: 'password' },
        function(email, password, done) {
            User.findOne({ email: email }).exec(function(err, user) {
                if (err) return done(err);
                if (!user) return done(null, false);
                user.comparePassword(password, function(err, isMatch) {
                    if (err) return done(err);
                    if (isMatch) done(null, user);
                    else done(null, false);
                });
            });
        }
    ));

};
