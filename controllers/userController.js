var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.login_get = function(req, res) {
  res.render('login', { title: 'Employee Login'});
}

passport.use(new LocalStrategy({
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
}));

// Short version meant to use passport default handling
// exports.login_post = passport.authenticate(
//   'local',
//   { successRedirect: '/invoicing', failureRedirect: '/login', failureFlash: false}
// );

// Long version to give more control over the auth flow
exports.login_post = function(req, res, next) {
  passport.authenticate( 'local', function(err, user, info) {
    if (err) { return next(err); }

    if (!user) { return res.redirect('/login'); }

    req.logIn(user, function(err) {
      if (err) {return next(err); }

      return res.redirect('/invoicing');
    });
  })(req, res, next);
};

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  })
});
