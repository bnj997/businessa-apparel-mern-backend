const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  _id: {type: String, required: true},
  date: { type: Date, required: true},
  hq:  {type: String, required: true, ref: "HQ"},
  branch:  {type: String, required: true, ref: "Branch"},
  user: { type: String, required: true, ref: 'User' },
  info: { type: String},
  orderlines: [{type: String, required: true, ref: 'Order-Lines'}],
});

orderSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Order', orderSchema);