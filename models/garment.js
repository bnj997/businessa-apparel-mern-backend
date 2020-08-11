const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const garmentSchema = new Schema({
  _id: { type: String, required: true },
  styleNum: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  supplier: { type: String, required: true },
  description: { type: String, required: true },
  colours: [{ type: String, required: true }],
  sizes: [{ type: String, required: true }],
  // hqs: [{type: Schema.Types.ObjectId, required: true, ref: 'HQ'}]
  hqs: [{type: String, required: true, ref: 'HQ'}]
});

garmentSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Garment', garmentSchema);
