// Database info required to (de)serialize objects
var Login = require('../models/login').LoginModel;

// All strategies and their relative path
var local = require('./passport/local');

// Functions to expose
module.exports = function(passport) {
  // Session serialization
  passport.serializeUser(function(user, callback) {
    callback(null, user.id);
  });

  passport.deserializeUser(function(id, callback) {
    Login.findById(id, function(err, user) {
      callback(err, user);
    })
  });

  // Strategies
  passport.use(local);
}
