var Invoice = require('../models/invoice');
var Business = require('../models/business');
var BillableItem = require('../models/billableitem');

var async = require('async');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

//Display the invoicing index page
exports.index = function(req, res) {

  async.parallel({
    invoice_count: function(callback) {
      Invoice.count(callback);
    },
    business_count: function(callback) {
      Business.count(callback);
    },
  }, function(err, results) {
    res.render('invoicing', { title: 'Invoicing', error: err, data: results});
  });
}

//Display a list of all invoices
exports.invoice_list = function(req, res) {

  Invoice.find()
  .exec(function (err, list_invoices) {
    if (err) { return next(err); }
    // on success, render
    res.render('invoice_list', {title: 'All Invoices', invoice_list: list_invoices});
  })
}

//Display a specific invoice
exports.invoice_detail = function(req, res) {
  res.send('#todo: Display invoice #' + req.params.id);
}

//GET version of invoice creation for initial empty form
exports.invoice_create_get = function(req, res) {

  Business.find({'legal_name' : {$ne : 'Base By Dottie LLC'}})
    .sort([['legal_name', 'ascending']])
    .exec( function (err, list_businesses) {
      if (err) { return next(err); }
      // On success, render the invoice_form
      // TODO: render if db not connected?
      res.render('invoice_form', {title: 'New Invoice', business_list: list_businesses});
    });
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

  // Obtain the bill_to and bill_from from the database
  // options: async.paralell, double nesting calls, something else?

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

      // Determine the next available invoice_number

      if (!errors.isEmpty()) {
        //Errors present, render again w/ sanitized values + error messages
        Business.find({'legal_name' : {$ne : 'Base By Dottie LLC'}})
          .sort([['legal_name', 'ascending']])
          .exec( function (err, list_businesses) {
            if (err) { return next(err); }
            // On success, render the invoice_form
            // TODO: render if db not connected?
            res.render(
              'invoice_form',
              {
                title: 'New Invoice',
                invoice: new Invoice(
                  {
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
                  }),
                business_list: list_businesses,
                billables: billableArray,
                errors: errors.array()
              }
            );
          });
        return;
      }

      else {
        //No errors present, determine if duplicate
        Invoice.findOne(
          // Duplicate invoice if the following match an existing invoice:
          {
          'business_to': req.body.business_to,
          'invoice_date': req.body.invoice_date,
          'project_date': req.body.project_date,
          'project_number': req.body.project_number
          })
          .exec( function(err, found_invoice) {
            console.log('querying invoice collection for duplicate invoice')
            if (err) { return next(err); }

            // Duplicate invoice found
            if (found_invoice) {
              res.redirect(found_invoice.url);
            }

            else { // query db for biz needed and redirect to save/print page
              // query for req.body.select company
              Business.findOne({'legal_name' : req.body.bill_to})
                .exec( function (err, bill_to_business) {
                  if (err) { return next(err); }
                  // On success, grab the other needed business (temporary)
                  // TODO: render if db not connected?

                  Business.findOne({'legal_name': 'Base By Dottie LLC'})
                  .exec( function (err, bill_from_business) {
                    if (err) { return next(err); }

                    // TODO: decide if i want to ask the user if they want to save first
                    // invoice.save( function (err) {
                    //   if (err) { return next(err); }
                    // });

                    // On success, render the invoice_form
                    res.render('invoice_template',
                      {
                        business_from: bill_from_business, // TODO: shove into invoice
                        business_to: bill_to_business, // TODO: shove into invoice
                        billables: billableArray, // TODO: shove billables into invoice
                        invoice: new Invoice(
                          {
                            invoice_number: '20180001', //TODO: pull a real number from db
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
                          })
                      }
                    );
                  });

                });
            }
          });
      }
    }
];

function getNextInvoiceNumber() {
  Invoice.findOne()
    .sort({'invoice_number': 'descending'})
    .exec( function(err, resInvoice) {
      console.log('querying invoice collection for next invoice_number')
      if (err) { return next(err); }

      if (!resInvoice) {
        // Dont return, use a callback instead ie callback(null, '20180001');
        return '20180001';
      }
      //TODO: use callback not ret ie. callback((parseInt(resInvoice.invoice_number) + 1).toString());
      //TODO: modify invoice to use numbers instead of strings
      return (parseInt(resInvoice.invoice_number) + 1).toString();
    });

}
//ToDo: add update and delete handlers
