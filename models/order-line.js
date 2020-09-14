const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const orderLinesSchema = new Schema({
  _id: {type: String, required: true },
  order: { type: String, required: true, ref: 'Order' },
  garment: { type: String, required: true, ref: 'Garment' },
  colour: {type: String, required: true },
  size: {type: String, required: true },
  quantity: { type: Number, required: true },
});

orderLinesSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Order-Lines', orderLinesSchema);