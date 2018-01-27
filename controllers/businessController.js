var Business = require('../models/business');
var async = require('async');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

//Display all business which have been added for invoicing use
exports.business_list = function(req, res) {
  Business.find()
    .sort([['legal_name', 'ascending']])
    .exec( function (err, list_businesses) {
      if (err) { return next(err); }
      // On success, render the business list page
      res.render('business_list', {title: 'All Invoicable Businesses', business_list: list_businesses});
    });
};

//Display the specific details of a business
exports.business_detail = function(req, res) {
  async.parallel({
    business: function(callback) {
      Business.findById(req.params.id)
        .exec(callback);
    },
  }, function(err, results) {
      if (err) { return next(err); }
      if (results.business == null) {
        var err = new Error('Business not found');
        err.status = 404;
        return next(err);
      }
      // On success, render the detail page
      res.render('business_detail', {title: 'Business Details', business: results.business});
    }
  );
};

//GET version of business creation for initial empty form
exports.business_create_get = function(req, res) {
  res.render('business_form', {title: 'Create business'});
};

//POST version of business creation for form submission and error handling
exports.business_create_post = [

  //Validate that the form fields are non null
  body('legal_name', 'Legal name required').isLength({ min: 1 }).trim(),
  body('address_line_1', 'Address required').isLength({ min: 1 }).trim(),
  body('address_line_2', 'City, State Zip required').isLength({ min: 1 }).trim(),

  //Sanitize (trim/escape) the legal name and potentially null nickname
  sanitizeBody('legal_name').trim().escape(),
  sanitizeBody('nickname').trim().escape(),
  sanitizeBody('address_line_1').trim().escape(),
  sanitizeBody('address_line_2').trim().escape(),
  sanitizeBody('contact_number').trim().escape(),

  //Process request
  (req, res, next) => {

    //Validation errors
    const errors = validationResult(req);

    //Create the object with sanitized data
    var business = new Business({
      legal_name: req.body.legal_name,
      nickname: req.body.nickname,
      address_line_1: req.body.address_line_1,
      address_line_2: req.body.address_line_2,
      contact_number: req.body.contact_number
    });

    if (!errors.isEmpty()) {
      //Errors present, render again w/ sanitized values + error messages
      res.render('business_form', { title: 'Create Business', business: business, errors: errors.array()});
      return;
    }

    else {
      //No errors present, determine if duplicate
      Business.findOne({'legal_name': req.body.legal_name})
        .exec( function(err, found_business) {
          if (err) { return next(err); }

          // Duplicate business found, redirect to the business detail page
          if (found_business) {
            res.redirect(found_business.url);
          }

          else {
            business.save( function (err) {
              if (err) { return next(err); }

              // Business saved, redirect to detail page
              res.redirect(business.url);
            });
          }
        });
    }
  }
];

//GET version of business updates for initial empty form
exports.business_update_get = function(req, res) {
  res.send('#todo: Business update via GET');
};

//GET version of business updates for form submission and error handling
exports.business_update_post = function(req, res) {
  res.send('#todo: Business update via POST');
};
