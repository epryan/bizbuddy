//Require Mongoose
var mongoose = require('mongoose');

//Define the schema
var Schema = mongoose.Schema;

var BillableItemSchema = new Schema({
  description: {type: String, required: true, min: 1, max:100},
  quantity: {type: Number, required: true, min: 1, max:99999},
  unit_price: {type: Number, required: true, min: 0, max:99999},
  total_price: {type: Number, required: true, min: 0, max:99999}
});

//Export function to create the model class
module.exports = mongoose.model('BillableItemSchema', BillableItemSchema);
