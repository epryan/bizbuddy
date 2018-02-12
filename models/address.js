var mongoose = require('mongoose');

//Define the schema
var Schema = mongoose.Schema;

var AddressSchema = new Schema({
  street: {type: String, required: true, min: 1, max:128, uppercase: true}, // general max
  city: {type: String, required: true, min: 1, max:32, uppercase: true}, // Lake Chaubunagungamaug + padding to 32
  state: {type: String, required: true, min: 1, max:4, uppercase: true}, // D.C. is 4 chars
  zip: {type: String, required: true, min: 1, max:16}, // Extended zip + padding to 16
});

module.exports = {
  // Expose the schema as AddressSchema
  AddressSchema: AddressSchema,
  // Expose the model as Address which saves to db as 'addresses'
  AddressModel: mongoose.model('Address', AddressSchema)
}
