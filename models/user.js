//Require Mongoose
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

//Define the schema
var Schema = mongoose.Schema;

// Currently quite generic except for temporary specificity on contact_number
// contact_number: 123456789 (10) to 1-234-597-8987 (14) to (123) 456 - 7898 (16)
var UserSchema = new Schema({
  legal_name: {type: String, required: true, min: 1, max:100},
  nickname: {type: String, required: false, min: 1, max:100},
  description: {type: String, max:25},
  billing_street: {type: String, required: true, min: 1, max:100, set: setAddress},
  billing_city: {type: String, required: true, min: 1, max:100, set: setAddress},
  billing_state: {type: String, required: true, min: 1, max:100, set: setAddress},
  billing_zip: {type: String, required: true, min: 1, max:100},
  contact_number: {type: String, required: false, min: 1, max:16},
  email: {type: String, required: false, min: 1, max:100},
  username: {type: String},
  password: {type: String, required: true}
});

//Virtual field for the user detail url //TODO: redirect properly to profile or similar
UserSchema
  .virtual('url')
  .get(function () {
    return '/invoicing/user/' + this._id;
  });

UserSchema.virtual('address_line_1').get(
  function() {
    return this.billing_street;
  }
);

UserSchema.virtual('address_line_2').get(
  function() {
    return this.billing_city + ', ' + this.billing_state + ' ' + this.billing_zip;
  }
);

function setAddress(address) {
  return address.toUpperCase();
};

// Authentication
UserSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(12));
};

UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
}

//Export function to create the model class
module.exports = mongoose.model('User', UserSchema);
