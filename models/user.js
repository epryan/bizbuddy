// A User schema which includes billing, location, and contact information #TODO: decouple auth from user
var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var { AddressSchema } = require('./address');

var UserSchema = new Schema({
  legal_name: {type: String, required: true, min: 1, max:64}, // general max
  nickname: {type: String, required: false, min: 1, max:64}, // general max
  description: {type: String, max:25}, // formatting max
  billing_address: {type: AddressSchema},
  contact_number: {type: String, required: false, min: 1, max:32}, // formatted US number + extra space
  email: {type: String, required: false, min: 1, max:128}, // well above average email + domain
  username: {type: String},
  password: {type: String, required: true, max: 128} // allows password managers to be effective up to 128 chars
});

//Virtual field for the user detail url //TODO: redirect properly to profile or similar #TODO: decouple url and schema
UserSchema
  .virtual('url')
  .get(function () {
    return '/invoicing/user/' + this._id;
  });

UserSchema.virtual('address_line_1').get(
  function() {
    return this.billing_address.street;
  }
);

UserSchema.virtual('address_line_2').get(
  function() {
    return this.billing_address.city + ', ' + this.billing_address.state + ' ' + this.billing_address.zip;
  }
);

// Authentication
UserSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(12));
};

UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
}

module.exports = {
  // Expose the schema as UserSchema
  UserSchema: UserSchema,
  // Expose the model as User which saves to db as 'users'
  UserModel: mongoose.model('User', UserSchema)
}
