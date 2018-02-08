//Require Mongoose
var mongoose = require('mongoose');

//Define the schema
var Schema = mongoose.Schema;

// Currently quite generic except for temporary specificity on contact_number
// contact_number: 123456789 (10) to 1-234-597-8987 (14) to (123) 456 - 7898 (16)
var CustomerSchema = new Schema({
  legal_name: {type: String, required: true, min: 1, max:100},
  nickname: {type: String, required: false, min: 1, max:100},
  billing_street: {type: String, required: true, min: 1, max:100, set: setAddress},
  billing_city: {type: String, required: true, min: 1, max:100, set: setAddress},
  billing_state: {type: String, required: true, min: 1, max:100, set: setAddress},
  billing_zip: {type: String, required: true, min: 1, max:100},
  contact_number: {type: String, required: false, min: 1, max:16},
  email: {type: String, required: false, min: 1, max:100},
});

//Virtual field for the customer detail url
CustomerSchema
  .virtual('url')
  .get(function () {
    return '/invoicing/customer/' + this._id;
  });

CustomerSchema.virtual('address_line_1').get(
  function() {
    return this.billing_street;
  }
);

CustomerSchema.virtual('address_line_2').get(
  function() {
    return this.billing_city + ', ' + this.billing_state + ' ' + this.billing_zip;
  }
);

function setAddress(address) {
  return address.toUpperCase();
};

//Export function to create the model class
module.exports = mongoose.model('Customer', CustomerSchema);
