var express = require('express');
var router = express.Router();

//Require controller modules
var invoice_controller = require('../controllers/invoiceController');
var business_controller = require('../controllers/businessController');

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

//GET request for create a new business to use in invoices
router.get('/business/create', business_controller.business_create_get);

//POST request for create a new business to use in invoices
router.post('/business/create', business_controller.business_create_post);

//GET request for business updates
router.get('/business/:id/update', business_controller.business_update_get);

//POST request for business updates
router.get('/business/:id/update', business_controller.business_update_post);

//GET request for a specific business
router.get('/business/:id', business_controller.business_detail);

//GET request for a list of all businesses
router.get('/businesses', business_controller.business_list);

module.exports = router;
