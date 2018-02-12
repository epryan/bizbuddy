var Customer = require('../models/customer').CustomerModel;
var async = require('async');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display all customers which have been added for invoicing use
exports.customer_list = function(req, res) {
  // Query db for all customers listed alphabetically
  Customer.find()
    .sort([['legal_name', 'ascending']])
    .exec( function (err, list_customers) {
      if (err) { return next(err); }
      // On success, render the customer list page
      res.render('customer_list', {title: 'All Customers', customer_list: list_customers});
    });
};

// Display the specific details of a single customer
exports.customer_detail = function(req, res) {
  async.parallel({
    customer: function(callback) {
      Customer.findById(req.params.id)
        .exec(callback);
    },
  }, function(err, results) {
      if (err) { return next(err); }
      if (results.customer == null) {
        var err = new Error('Customer not found');
        err.status = 404;
        return next(err);
      }
      // On success, render the detail page
      res.render('customer_detail', {title: 'Customer Details', customer: results.customer});
    }
  );
};

// GET version of customer creation for initial empty form
exports.customer_create_get = function(req, res) {
  res.render('customer_form', {title: 'New Customer'});
};

// POST version of customer creation for form submission and error handling
exports.customer_create_post = [
  // Validate that the form fields are non null
  body('legal_name', 'Legal name required').isLength({ min: 1 }).trim(),
  body('address_line_1', 'Address required').isLength({ min: 1 }).trim(),
  body('city', 'City required').isLength({ min: 1 }).trim(),
  body('state', 'State required').isLength({ min: 1 }).trim(),
  body('zip', 'Zip required').isLength({ min: 1 }).trim(),
  // Sanitize (trim/escape) the legal name and potentially null nickname
  sanitizeBody('legal_name').trim().escape(),
  sanitizeBody('nickname').trim().escape(),
  sanitizeBody('address_line_1').trim().escape(),
  sanitizeBody('city').trim().escape(),
  sanitizeBody('state').trim().escape(),
  sanitizeBody('zip').trim().escape(),
  sanitizeBody('contact_number').trim().escape(),

  // Process request
  (req, res, next) => {
    // Validation errors
    const errors = validationResult(req);

    // Create the object with sanitized data
    var customer = new Customer({
      legal_name: req.body.legal_name,
      nickname: req.body.nickname,
      billing_street: req.body.address_line_1,
      billing_city: req.body.city,
      billing_state: req.body.state,
      billing_zip: req.body.zip,
      contact_number: req.body.contact_number
    });

    if (!errors.isEmpty()) {
      // User input errors present, render again w/ sanitized values + error messages
      res.render('customer_form', { title: 'Create Customer', customer: customer, errors: errors.array()});
      return;
    } else {
      // No user input errors present, determine if duplicate
      Customer.findOne({'legal_name': req.body.legal_name})
        .exec( function(err, found_customer) {
          if (err) { return next(err); }
          // Duplicate customer found, redirect to the customer detail page
          if (found_customer) {
            res.redirect(found_customer.url);
          } else {
            customer.save( function (err) {
              if (err) { return next(err); }
              // Customer saved, redirect to detail page
              res.redirect(customer.url);
            });
          }
        });
    }
  }
];

// GET version of customer updates for initial empty form
exports.customer_update_get = function(req, res) {
  res.send('#todo: Customer update via GET');
};

// GET version of customer updates for form submission and error handling
exports.customer_update_post = function(req, res) {
  res.send('#todo: Customer update via POST');
};
