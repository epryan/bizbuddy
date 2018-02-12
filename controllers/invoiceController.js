var Invoice = require('../models/invoice').InvoiceModel;
var Customer = require('../models/customer').CustomerModel;
var User = require('../models/user').UserModel;
//var BillableItem = { BilableItemModel } = require('../models/billableitem');

var async = require('async');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

//Display the invoicing index page
exports.index = function(req, res) {

  async.parallel({
    invoice_count: function(callback) {
      Invoice.count(callback);
    },
    user_count: function(callback) {
      User.count(callback);
    },
    customer_count: function(callback) {
      Customer.count(callback);
    },
  }, function(err, results) {
    res.render('invoicing', { title: 'Invoicing', error: err, data: results});
  });
};

//Display a list of all invoices
exports.invoice_list = function(req, res) {

  Invoice.find()
  .exec(function (err, list_invoices) {
    if (err) { return next(err); }
    // on success, render
    res.render('invoice_list', {title: 'All Invoices', invoice_list: list_invoices});
  })
};

//Display a specific invoice
exports.invoice_detail = function(req, res) {
  res.send('#todo: Display invoice #' + req.params.id);
};

//GET version of invoice creation for initial empty form
exports.invoice_create_get = function(req, res) {
  renderInvoiceForm(req, res);
};

// Can be run in place of stringing body() calls, though it isnt especially useful right now
function validateBillables() {
  // Currently only checking the first billable
  var status = [];
  for (var i = 0; i < 1; i++) {
    status.push(sanitizeBody('description').trim());
    status.push(sanitizeBody('quantity').trim());
    status.push(sanitizeBody('unit_price').trim());
    status.push(sanitizeBody('total_price').trim());
  }
  return status;
}

//POST version of invoice creation for form submission and error handling
exports.invoice_create_post = [
    //Validate that the form fields are non null
    body('invoice_date', 'Billing date required').isLength({ min: 1 }).trim(),
    body('project_date', 'Project date required').isLength({ min: 1 }).trim(),
    body('project_number', 'Project number required').isLength({ min: 1 }).trim(),
    body('project_name', 'Project name required').isLength({ min: 1 }).trim(),
    body('project_street', 'Project street required').isLength({ min: 1 }).trim(),
    body('project_city', 'Project city required').isLength({ min: 1 }).trim(),
    body('project_state', 'Project state required').isLength({ min: 1 }).trim(),
    body('project_zip', 'Project zip required').isLength({ min: 1 }).trim(),
    //Sanitize (trim/escape) the fields
    //sanitizeBody('invoice_date').trim().escape(),
    //sanitizeBody('project_date').trim().escape(),
    sanitizeBody('project_number').trim().escape(),
    sanitizeBody('project_name').trim().escape(),
    sanitizeBody('project_street').trim().escape(),
    sanitizeBody('project_city').trim().escape(),
    sanitizeBody('project_state').trim().escape(),
    sanitizeBody('project_zip').trim().escape(),
    sanitizeBody('notes').trim().escape(),
    sanitizeBody('invoice_total').trim().escape(),
    validateBillables(),

    //Process request
    (req, res, next) => {
      //Validation errors
      const errors = validationResult(req);

      // Truncate the invoice price to the nearest penny amount
      var invoiceTotal = parseFloat(req.body.invoice_total).toFixed(2);

      // Create all non null billable items
      var billableArray = [];
      for (i = 0; i < 5; i++) {
        var desc = req.body.description[i];
        var qty = req.body.quantity[i];
        var unit = req.body.unit_price[i];
        var total = req.body.total_price[i];

        if ( desc && qty && unit && total) {
          billableArray.push(
            new BillableItem({
              description: desc,
              quantity: qty,
              unit_price: unit,
              total_price: total
            })
          );
        }
      }

      var newInvoice = new Invoice({
          invoice_number: req.body.invoice_number,
          invoice_date: req.body.invoice_date,
          project_date: req.body.project_date,
          project_number: req.body.project_number,
          project_name: req.body.project_name,
          project_street: req.body.project_street,
          project_city: req.body.project_city,
          project_state: req.body.project_state,
          project_zip: req.body.project_zip,
          invoice_total: invoiceTotal,
          notes: req.body.notes
        });

      var validatedLocals = {
        invoice: newInvoice,
        billables: billableArray
      };

      //Errors present, render again w/ sanitized values + error messages
      if (!errors.isEmpty()) {
        // Add the errors into our validatedLocals and render
        validatedLocals['errors'] = errors.array();
        renderInvoiceForm(req, res, validatedLocals);
        return;
      }

      else {
        // Check for duplicate and create the final invoice
        async.parallel({
          validUser: function(callback) {
            User.findOne({'legal_name': 'Base By Dottie LLC'})
            .exec(callback);
          },
          validCustomer: function(callback) {
            Customer.findOne({'legal_name': req.body.bill_to})
            .exec(callback);
          },
          duplicateInvoice: function(callback) {
            Invoice.findOne({
              // Duplicate invoice if the following match an existing invoice:
              'customer': req.body.customer,
              'invoice_date': req.body.invoice_date,
              'project_date': req.body.project_date,
              'project_number': req.body.project_number})
              .exec(callback);
          }
        }, function(err, results) {
          if (err) {return next(err);}

          // Check for duplicate invoice
          if (results.duplicateInvoice) {
            res.redirect(results.duplicateInvoice.url);
          } else {
            // Create the locals for the invoice_template
            var templateLocals = {
              user: results.validUser,
              customer: results.validCustomer,
              billables: billableArray,
              invoice: newInvoice,
            };

            // TODO: create a fully filled, valid invoice object
            // TODO: decide if i want to ask the user if they want to save first
            // newInvoice.save( function (err) {
            //   if (err) { return next(err); }
            // });

            // Render the final invoice
            res.render('invoice_template', templateLocals);
          }
        }
        );
      }
    }
];

function renderInvoiceForm(req, res, validatedLocals) {

  async.parallel({
    // TODO: Dynamically get current user once user scheme has been built
    user: function(callback) {
      User.findOne({'legal_name': 'Base By Dottie LLC'})
      .exec(callback);
    },
    allCustomers: function(callback) {
      Customer.find()
      .sort([['legal_name', 'ascending']])
      .exec(callback);
    },
    newestInvoice: function(callback) {
      Invoice.findOne()
      .sort({'invoice_number': 'descending'})
      .exec(callback);
    }
  }, function(err, results) {
      // Generate an invoice number (default is '20180001')
      var nextInvoiceNumber = '20180001';
      if (results.newestInvoice) {
        // determine next invoice number
        nextInvoiceNumber = (parseInt(results.newestInvoice.invoice_number) + 1).toString();
      }

      var locals = {title: 'New Invoice', invoice_number: nextInvoiceNumber, customer_list: results.allCustomers};

      if (!validatedLocals) {
        // Render the form with title, invoice number, customer list only
        res.render('invoice_form', locals);
      }
      else {
        // Render the form with locals and validatedLocals + errors
        res.render('invoice_form', Object.assign(locals, validatedLocals));
      }
    });

};

//ToDo: add update and delete handlers
