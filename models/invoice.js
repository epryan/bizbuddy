//Require Mongoose
var mongoose = require('mongoose');

//Define the schema
var Schema = mongoose.Schema;

var InvoiceSchema = new Schema({
  // 'Business' fields
  business_from: {type: Schema.ObjectId, ref: 'Business'},
  business_to: {type: Schema.ObjectId, ref: 'Business'},
  invoice_number: {type: String, required: true, min: 1, max:50},
  invoice_date: {type: String, required: true},
  // Job fields
  project_date: {type: Date},
  project_number: {type: String},
  project_name: {type: String, required: true, min: 1, max:50},
  project_address: {type: String, required: true, min: 1, max:50},
  // Work completed fields
  billables: [{type: Schema.ObjectId, ref: 'BillableItem'}],
  // Additional notes about the job
  notes: {type: String, min: 1, max:250},
});

//Export function to create the model class
module.exports = mongoose.model('InvoiceSchema', InvoiceSchema);
