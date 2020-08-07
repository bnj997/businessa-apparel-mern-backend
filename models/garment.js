const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const garmentSchema = new Schema({
  styleNum: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: String, required: true },
  category: { type: String, required: true },
  supplier: { type: String, required: true },
  description: { type: String, required: true },
});

garmentSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Garment', garmentSchema);
