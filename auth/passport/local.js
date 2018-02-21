var LocalStrategy = require('passport-local').Strategy;
var Login = require('mongoose').model('Login');

module.exports = new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    session: true
    //passReqToCallback: true
    },
    function(username, password, done) {
      Login.findOne({'username': username.toLowerCase()}, 'username password', function(err, login) {
        if (err) { return done(err); }

        if (!login) {
          return done(null, false);
        }

        if (!login.validPassword(password)) {
          return done(null, false);
        }

        // Login has passed authentication
        return done(null, login);
      });
  }
);
