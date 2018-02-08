//Require Mongoose
var mongoose = require('mongoose');
var moment = require('moment');

//Define the schema
var Schema = mongoose.Schema;

var InvoiceSchema = new Schema({
  // 'Business' fields TODO: dont use objectID since archival will degrade over time if data linked rather than directly input
  billing_from: {type: Schema.ObjectId, ref: 'user'},
  billing_to: {type: Schema.ObjectId, ref: 'customer'},
  // Invoice-specific fields
  invoice_number: {type: String, required: true, min: 1, max:50},
  invoice_date: {type: String, required: true},
  // Job fields
  project_date: {type: String},
  project_number: {type: String},
  project_name: {type: String, required: true, min: 1, max:100},
  project_street: {type: String, required: true, min: 1, max:100},
  project_city: {type: String, required: true, min: 1, max:50},
  project_state: {type: String, required: true, min: 1, max:2},
  project_zip: {type: String, required: true, min: 1, max:25},
  // Work completed fields
  billables: [{type: Schema.ObjectId, ref: 'BillableItem'}],
  invoice_total: {type: Number, get: formatTotal},
  // Additional notes about the job
  notes: {type: String, min: 1, max:250},
});

InvoiceSchema.virtual('invoice_date_formatted').get(
  function() {
    return formatDate(this.invoice_date);
  }
);

InvoiceSchema.virtual('project_date_formatted').get(
  function() {
    return formatDate(this.project_date);
  }
);

InvoiceSchema.virtual('project_address_line_1').get(
  function() {
    return formatAddress(this.project_street);
  }
);

InvoiceSchema.virtual('project_address_line_2').get(
  function() {
    return formatAddress(this.project_city + ', ' + this.project_state + ' ' + this.project_zip);
  }
);

//Using moment(ISODATE).format('M/D/YYYY') for '1/1/2018' timestamps
function formatDate(date) {
  return moment(date).format('M/D/YYYY');
};

function formatAddress(address) {
  return address.toUpperCase();
};

function formatTotal(total) {
  return total.toFixed(2);
}

//Export function to create the model class
module.exports = mongoose.model('Invoice', InvoiceSchema);
