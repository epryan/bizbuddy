/*
 * BizBuddy - An express homepage and invoicing application for basebydottie.com
 * Author: Ryan Erickson (ryan@ryansip.com)
 */

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var compression = require('compression');
var dotenv = require('dotenv').config(); // Environment variable handler
var express = require('express');
var favicon = require('serve-favicon');
var helmet = require('helmet');
var logger = require('morgan');
var mongoose = require('mongoose');
var path = require('path');
var passport = require('passport'); // Authentication
// Server side session management
var session = require('express-session'); // in-memory session management (TODO: pair with connect-mongodb-session)

// Init the application
var app = express();

//Set up mongoose (mongodb) connection
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true });
mongoose.Promise = global.Promise;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Pass the passport through configuration 'options'
require('./auth/passport')(passport);

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));

// Body&Cookie parsing
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

// Pass the passport through its final config pass
app.use(passport.initialize());
app.use(passport.session());

// Pull in the apps routes passing passport for authentication
require('./routes.js')(app, passport);

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
