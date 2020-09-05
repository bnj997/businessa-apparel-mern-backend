const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const cartSchema = new Schema({
  _id: {type: String, required: true},
  buyer: {type: String, required: true, ref: 'User'},
  garments: [{type: String, required: true, ref: 'Garment'}]
});

cartSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Cart', cartSchema);