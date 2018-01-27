//Require Mongoose
var mongoose = require('mongoose');

//Define the schema
var Schema = mongoose.Schema;

var InvoiceSchema = new Schema({
  business_from: {type: Schema.ObjectId, ref: 'Business'},
  business_to: {type: Schema.ObjectId, ref: 'Business'},
  completion_date: {type: Date},
  billing_date: {type: String, required: true},
  invoice_number: {type: String, required: true, min: 1, max:50},
  project_name: {type: String, required: true, min: 1, max:50},
  project_address: {type: String, required: true, min: 1, max:50},
  billables: [{type: Schema.ObjectId, ref: 'BillableItem'}],
  notes: {type: String, min: 1, max:250},
});

//Export function to create the model class
module.exports = mongoose.model('InvoiceSchema', InvoiceSchema);
