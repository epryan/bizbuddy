// Utility schema that represents an address and does not independently persist to db
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Standardized address schema for USA addresses
var AddressSchema = new Schema({
  street: {type: String, required: true, min: 1, max:128, uppercase: true}, // general max
  city: {type: String, required: true, min: 1, max:32, uppercase: true}, // Lake Chaubunagungamaug + padding to 32
  state: {type: String, required: true, min: 1, max:4, uppercase: true}, // D.C. is 4 chars
  zip: {type: String, required: true, min: 1, max:16}, // Extended zip + padding to 16
}, {'_id': false, 'autoIndex': false}); // skip _id as an address will always be a subdocument

module.exports = {
  // Expose the schema as AddressSchema
  AddressSchema: AddressSchema,
  // Expose the model as Address
  AddressModel: mongoose.model('Address', AddressSchema)
}
