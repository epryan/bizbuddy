// A Customer schema which includes billing, location, and contact information
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var { AddressSchema } = require('./address');

var CustomerSchema = new Schema({
  legal_name: {type: String, required: true, min: 1, max:64},
  nickname: {type: String, required: false, min: 1, max:64},
  billing_address: {type: AddressSchema},
  contact_number: {type: String, required: false, min: 1, max:32},
  contact_email: {type: String, required: false, min: 1, max:128},
  billing_email: {type: String, required: false, min: 1, max:128},
});

//Virtual field for the customer detail url #TODO: decouple url and schema
CustomerSchema.virtual('url')
  .get( function () {
    return '/invoicing/customer/' + this._id;
    });

CustomerSchema.virtual('address_line_1')
  .get( function() {
      return this.billing_address.street;
    });

CustomerSchema.virtual('address_line_2')
  .get( function() {
      return this.billing_address.city + ', ' + this.billing_address.state + ' ' + this.billing_address.zip;
    });

function setAddress(address) {
  return address.toUpperCase();
};

module.exports = {
  // Expose the schema as CustomerSchema
  CustomerSchema: CustomerSchema,
  // Expose the model as Customer which saves to db as 'customers'
  CustomerModel: mongoose.model('Customer', CustomerSchema)
}
