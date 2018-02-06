var express = require('express');
var router = express.Router();

//Require controller modules
var invoice_controller = require('../controllers/invoiceController');
var customer_controller = require('../controllers/customerController');

/// INVOICE ROUTES ///

//GET invoicing home page
router.get('/', invoice_controller.index);

//GET request for creating an invoice.
//Using invoice id for display causes this method to come before the get invoice method
router.get('/invoice/create', invoice_controller.invoice_create_get);

//POST request for creating an invoice
router.post('/invoice/create', invoice_controller.invoice_create_post);

 // MUST COME LAST //
//GET request for a specific invoice
router.get('/invoice/:id', invoice_controller.invoice_detail);

//GET request for a list of all invoice items
router.get('/invoices', invoice_controller.invoice_list);

/// BUSINESS ROUTES ///

//GET request for create a new customer to use in invoices
router.get('/customer/create', customer_controller.customer_create_get);

//POST request for create a new customer to use in invoices
router.post('/customer/create', customer_controller.customer_create_post);

//GET request for customer updates
router.get('/customer/:id/update', customer_controller.customer_update_get);

//POST request for customer updates
router.get('/customer/:id/update', customer_controller.customer_update_post);

//GET request for a specific customer
router.get('/customer/:id', customer_controller.customer_detail);

//GET request for a list of all customeres
router.get('/customers', customer_controller.customer_list);

module.exports = router;
