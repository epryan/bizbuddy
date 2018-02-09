var LocalStrategy = require('passport-local').Strategy;
var User = require('mongoose').model('User');

module.exports = new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    session: true
    //passReqToCallback: true
    },
    function(username, password, done) {
      User.findOne({'username': username}, 'username password', function(err, user) {
        if (err) { return done(err); }

        if (!user) {
          return done(null, false);
        }

        if (!user.validPassword(password)) {
          return done(null, false);
        }

        // User has passed authentication
        return done(null, user);
      });
  }
);
