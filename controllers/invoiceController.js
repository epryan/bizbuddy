var Invoice = require('../models/invoice').InvoiceModel;
var Customer = require('../models/customer').CustomerModel;
var User = require('../models/user').UserModel;
var Address = require('../models/address').AddressModel;
var BillableItem = require('../models/billableitem').BillableItemModel;

var async = require('async');
var moment = require('moment');

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
  .sort({invoice_number: -1})
  .exec(function (err, invoiceList) {
    if (err) { return next(err); }
    // on success, render
    res.render('invoice_list', {title: 'All Invoices', invoice_list: invoiceList});
  })
};

//Display a specific invoice
exports.invoice_detail = function(req, res) {

  Invoice.findOne({'invoice_number': req.params.id})
  .exec(function (err, invoice) {
    if (err) { return next(err); }

    res.render('invoice_template', {invoice: invoice});
  });
};

//GET version of invoice creation for initial empty form
exports.invoice_create_get = function(req, res) {
  renderInvoiceForm(req, res);
};

// Helper function to sanitize each dynamic billable which may or may not be empty
function sanitizeBillables() {
  var status = [];
  for (var i = 0; i < 5; i++) {
    status.push(sanitizeBody('description').trim().escape());
    status.push(sanitizeBody('quantity').trim().escape());
    status.push(sanitizeBody('unit_price').trim().escape());
    status.push(sanitizeBody('total_price').trim().escape());
  }
  return status;
}

//POST version of invoice creation for form submission and error handling
exports.invoice_create_post = [
    //Validate that the form fields are non null
    body('invoice_date', 'Billing date required').isISO8601().trim(),
    body('bill_to', 'Invoice to required').isLength({ min: 1 }).trim(),

    body('project_date', 'Project date required').isISO8601().trim(),
    body('project_number', 'Project number required').isLength({ min: 1 }).trim(),
    body('project_name', 'Project name required').isLength({ min: 1 }).trim(),
    body('project_street', 'Project street required').isLength({ min: 1 }).trim(),
    body('project_city', 'Project city required').isLength({ min: 1 }).trim(),
    body('project_state', 'Project state required').isLength({ min: 1 }).trim(),
    body('project_zip', 'Project zip required').isLength({ min: 1 }).trim(),

    //Sanitize the invoice fields
    sanitizeBody('invoice_number').trim().escape(),
    sanitizeBody('invoice_date').toDate(),
    sanitizeBody('bill_to').trim().escape(),

    sanitizeBody('project_date').toDate(),
    sanitizeBody('project_number').trim().escape(),
    sanitizeBody('project_name').trim().escape(),
    sanitizeBody('project_street').trim().escape(),
    sanitizeBody('project_city').trim().escape(),
    sanitizeBody('project_state').trim().escape(),
    sanitizeBody('project_zip').trim().escape(),

    sanitizeBody('notes').trim().escape(),
    sanitizeBody('invoice_total').trim().escape(),
    sanitizeBillables(),

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

      var projectAddress = new Address({
        street: req.body.project_street,
        city: req.body.project_city,
        state: req.body.project_state,
        zip: req.body.project_zip,
      });

      var newInvoice = new Invoice({
        //billing_from: via query below
        //billing_to: via query below
        invoice_number: req.body.invoice_number,
        invoice_date: req.body.invoice_date,
        project_date: req.body.project_date,
        project_number: req.body.project_number,
        project_name: req.body.project_name,
        project_address: projectAddress,
        billables: billableArray,
        invoice_total: invoiceTotal,
        notes: req.body.notes
        });

      //Errors present, render again w/ sanitized values + error messages
      if (!errors.isEmpty()) {
        renderInvoiceForm(req, res, req,body.bill_to, newInvoice, errors.array());
        return;
      } else {
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
            // Assign the final missing peices of the invoice
            newInvoice.user_id = results.validUser._id;
            newInvoice.billing_from = results.validUser;
            newInvoice.billing_to = results.validCustomer;

            // Timestamp the invoice before archiving, then render
            newInvoice.creation_date = moment();

            // CREATE THE PDF OF THE INVOICE

            const puppeteer = require('puppeteer');

            (async function createPdf(invoiceNumber)  {
              // const browser = await puppeteer.launch({headless: false, slowMo: 50});
              const browser = await puppeteer.launch();
              const page = await browser.newPage();
              const httpLoginUrl = 'http://localhost:3000/login';
              const httpsLoginUrl = 'https://localhost:3000/login';
              const invoiceUrl = 'http://localhost:3000/invoicing/invoice/' + invoiceNumber;
              const invoiceFileName = 'Invoice' + invoiceNumber + '.pdf';

              await page.setCookie({
                name: 'connect.sid',
                value: req.cookies['connect.sid'],
                domain: 'localhost'
              });
              await page.goto( invoiceUrl, {waitUntil: 'networkidle0'});

              await page.pdf({path: invoiceFileName, format: 'A4'});

              await browser.close();
            })(newInvoice.invoice_number);

            // END INVOICE TO PDF

            newInvoice.save( function (err) {
              if (err) { return next(err); }
              // Render the final invoice
              res.render('invoice_template', {invoice: newInvoice});
              return;
            });

          }
        }
        );
      }
    }
];

function renderInvoiceForm(req, res, billTo, invoice, errors) {

  async.parallel({
    // TODO: Pull current user when auth is fully flushed out
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

      if (!invoice) {
        // Render the form with title, invoice number, customer list only
        res.render('invoice_form', {title: 'New Invoice', invoice_number: nextInvoiceNumber, customer_list: results.allCustomers});
      }
      else {
        // Render the form with locals, invoice, errors
        res.render('invoice_form', {title: 'New Invoice', invoice_number: nextInvoiceNumber, customer_list: results.allCustomers, bill_to: billTo, invoice: invoice, errors: errors});
      }
    });

};

//ToDo: add update and delete handlers
