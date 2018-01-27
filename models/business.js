//Require Mongoose
var mongoose = require('mongoose');

//Define the schema
var Schema = mongoose.Schema;

// Currently quite generic except for temporary specificity on contact_number
// contact_number: 123456789 (10) to 1-234-597-8987 (14) to (123) 456 - 7898 (16)
var BusinessSchema = new Schema({
  legal_name: {type: String, required: true, min: 1, max:100},
  nickname: {type: String, required: false, min: 1, max:100},
  address_line_1: {type: String, required: true, min: 1, max:100},
  address_line_2: {type: String, required: true, min: 1, max:100},
  contact_number: {type: String, required: false, min: 1, max:16},
  email: {type: String, required: false, min: 1, max:100},
});

//Virtual field for the business detail url
BusinessSchema
  .virtual('url')
  .get(function () {
    return '/invoicing/business/' + this._id;
  });

//Export function to create the model class
module.exports = mongoose.model('BusinessSchema', BusinessSchema);
