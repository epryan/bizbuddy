// A Login schema which handles User authorization
var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LoginSchema = new Schema({
  username: {type: String},
  password: {type: String, required: true, max: 128} // allows password managers to be effective up to 128 chars
});

// Authentication
LoginSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(12));
};

LoginSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
}

module.exports = {
  // Expose the schema as LoginSchema
  LoginSchema: LoginSchema,
  // Expose the model as Login which saves to db as 'Logins'
  LoginModel: mongoose.model('Login', LoginSchema)
}
