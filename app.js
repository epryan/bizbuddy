/*
 * meanbase - A MEAN stack homepage and invoicing application for basebydottie.com
 * Author: Ryan Erickson (ryan@ryansip.com)
 */

var dotenv = require('dotenv').config(); // Environment variable handler
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require('helmet');

// Server side session management (pair with connect-mongodb-session)
var session = require('express-session');
// Client sessions (MDN)
//var sessions = require('client-sessions');
// Authentication
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// Pull in Routes
var index = require('./routes/index');
var users = require('./routes/users');
var invoicing = require('./routes/invoicing');

// Init the application
var app = express();

//Set up mongoose (mongodb) connection
var mongoose = require('mongoose');
var mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, {
  useMongoClient: true
});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Static assets visible to all clients
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(compression()); // Compress all routes
app.use(helmet()); // Basic vulnerability mitigation

// express sessions init
app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// client-sessions
// app.use(sessions({
//   cookieName: 'userSession',
//   secret: 'apples',
//   duration: 24 * 60 * 60 * 1000,
//   activeDuration: 1000  * 60 * 5
// }));
// app.use(function(req, res, next) {
//   if (req.userSession.seenyou) {
//     res.setHeader('X-Seen-You', 'true');
//     console.log(req.userSession.seenyou);
//   } else {
//     req.userSession.seenyou = true;
//     res.setHeader('X-Seen-You', 'false');
//     console.log('not seen you');
//   }
//   next();
// });

// Map URLs to Routes
app.use('/', index);
app.use('/users', users);
app.use('/invoicing', invoicing);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
