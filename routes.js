// Specific route files required to link routes and controllers
var index = require('./routes/index');
var users = require('./routes/users');
var invoicing = require('./routes/invoicing');

module.exports = function(app, passport) {
  /// Website homepage (requires no login) ///
  // Exposes login functionality via 'Employee Login' link in footer

  app.use('/', index);

  /// User login/logout ///

  app.get('/login', loginRoute);

  // Short version meant to use passport default handling
  app.post('/login', passport.authenticate( 'local', {
    successRedirect: '/invoicing',
    failureRedirect: '/login',
    failureFlash: false }
  ));

  // Long version of auth to give better control over the flow (useful for signup)
  // app.post('/login', function(req, res, next) {
  //   passport.authenticate( 'local', function(err, user, info) {
  //     if (err) { return next(err); }
  //
  //     if (!user) { return res.redirect('/login'); }
  //
  //     req.logIn(user, function(err) {
  //       if (err) {return next(err); }
  //
  //       return res.redirect('/invoicing');
  //     });
  //   })
  // });

  app.get('/logout', function(req, res) {
    req.logout(); // Passport's provided logout function
    res.redirect('/');
  });

  /// Protected routes (requires login) ///

  app.use('/users', requireLogin, users);
  app.use('/invoicing', requireLogin, invoicing);

};

// Authentication between cookie and session ensuring the user is logged in
function requireLogin(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login');
  }
}

// If a logged in user pings /login, they are redirected to the main invoicing page
// If an not logged in user pings /login, they are shown the login page
function loginRoute(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/invoicing');
  } else {
    res.render('login', { title: 'Employee Login'});
  }
}
