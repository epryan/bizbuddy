// Utility schema that represents a billable item and does not independently persist to db
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// General guidelines for a item which can be billed out in an invoice
var BillableItemSchema = new Schema({
  description: {type: String, required: true, min: 1, max:100},
  quantity: {type: Number, required: true, min: 1, max:99999},
  unit_price: {type: Number, required: true, min: 0, max:99999},
  total_price: {type: Number, required: true, min: 0, max:99999}
}, {'_id': false, 'autoIndex': false}); // skip _id as a billable item will always be a subdocument

//Export function to create the model class
module.exports = {
  // Expose the schema as BillableItemSchema
  BillableItemSchema: BillableItemSchema,
  // Expose the model as BillableItem
  BillableItemModel: mongoose.model('BillableItem', BillableItemSchema)
}
