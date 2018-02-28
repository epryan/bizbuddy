// A static document that contains a snapshot of the user, customer,
//  and billing information for the purposes of sending and archiving an invoice
var moment = require('moment');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var { UserSchema } = require('./user');
var { CustomerSchema } = require('./customer');
var { AddressSchema } = require('./address');
var { BillableItemSchema } = require('./billableitem');

var InvoiceSchema = new Schema({
  // Invoice Metadata
  creation_date: {type: String},
  user_id: {type: Schema.Types.ObjectId},
  // To/From Fields
  billing_from: {type: UserSchema}, // embedded: the state of the user at the time of the invoice
  billing_to: {type: CustomerSchema}, // embedded: the state of the customer at the time of the invoice
  // Invoice-specific fields
  invoice_number: {type: String, required: true, min: 1, max:16}, // most will be 8 or 9: year + [i]th invoice that year
  invoice_date: {type: String, required: true, max: 32}, // plenty of space for iso formatted date
  // Job fields
  project_date: {type: String, max: 32}, // plenty of space for iso formatted date
  project_number: {type: String, max: 16}, // general max
  project_name: {type: String, required: true, min: 1, max:64}, // general max
  project_address: {type: AddressSchema}, // embedded: the state of the address at the time of the invoice
  // Work completed fields
  billables: [{type: BillableItemSchema}],
  invoice_total: {type: Number, get: formatDollar}, // 1,000,000.00 as number = 9 chars
  // Additional notes about the job
  notes: {type: String, min: 1, max:240}, // 4 lines at 60 chars each
});

InvoiceSchema.virtual('invoice_date_formatted')
  .get( function() {
      return formatDate(this.invoice_date);
    });

InvoiceSchema.virtual('project_date_formatted')
  .get( function() {
      return formatDate(this.project_date);
    });

InvoiceSchema.virtual('project_address_line_1')
  .get( function() {
      return this.project_address.street;
    });

InvoiceSchema.virtual('project_address_line_2')
  .get( function() {
      return this.project_address.city + ', ' + this.project_address.state + ' ' + this.project_address.zip;
    });

InvoiceSchema.virtual('url')
  .get( function() {
      return '/invoicing/invoice/' + this.invoice_number;
    });

//Using moment(ISODATE).format('M/D/YYYY') for '1/1/2018' timestamps
function formatDate(date) {
  return moment(date).format('M/D/YYYY');
};

function formatDollar(amount) {
  return amount.toFixed(2);
}

module.exports = {
  //Expose the model as Invoice which saves to db as 'invoices'
  InvoiceModel: mongoose.model('Invoice', InvoiceSchema)
}
