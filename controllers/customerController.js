var Customer = require('../models/customer').CustomerModel;
var Address = require('../models/address').AddressModel;
var async = require('async');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display all customers which have been added for invoicing use
exports.customer_list = function(req, res) {
  // Query db for all customers listed alphabetically
  Customer.find()
    .sort([['legal_name', 'ascending']])
    .exec( function (err, customerList) {
      if (err) { return next(err); }
      // On success, render the customer list page
      res.render('customer_list', {title: 'All Customers', customer_list: customerList});
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
  body('city', 'City required')
    .isLength({ min: 1 })
    .isAlpha().withMessage('City cant contain numbers or special characters')
    .trim(),
  body('state', 'State required')
    .isLength({ min: 1 })
    .isAlpha().withMessage('State must be an abbreviated state ie. WA')
    .trim(),
  body('zip', 'Zip required')
    .isPostalCode('US').withMessage('Zip must be a real numeric zip code')
    .trim(),
  //body('contact_email', 'Contact Email Required').isEmail().trim(),
  body('billing_email', 'Billing Email Required').isLength({ min: 6 }).isEmail().trim(),
  // Sanitize (trim/escape) the legal name and potentially null nickname
  sanitizeBody('legal_name').trim().escape(),
  sanitizeBody('nickname').trim().escape(),
  sanitizeBody('address_line_1').trim().escape(),
  sanitizeBody('city').trim().escape(),
  sanitizeBody('state').trim().escape(),
  sanitizeBody('zip').trim().escape(),
  sanitizeBody('phone').trim().escape(),
  sanitizeBody('contact_email').trim().escape(),
  sanitizeBody('billing_email').trim().escape(),

  // Process request
  (req, res, next) => {
    // Validation errors
    const errors = validationResult(req);

    // Create the address and customer objects from validated, sanitized data
    var billingAddress = new Address({
      street: req.body.address_line_1,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
    });
    var customer = new Customer({
      legal_name: req.body.legal_name,
      nickname: req.body.nickname,
      billing_address: billingAddress,
      contact_number: req.body.phone,
      //contact_email optional
      billing_email: req.body.billing_email
    });

    if (req.body.contact_email) {
      customer.contact_email = req.body.contact_email;
    }

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
              // Customer saved successfully, redirect to detail page
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
