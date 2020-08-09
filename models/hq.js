const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const hqSchema = new Schema({
  _id: {type: String, required: true},
  name: { type: String, required: true },
  telephone: { type: String, required: true },
  email: { type: String, required: true },
  garments: [{type: Schema.Types.ObjectId, required: true, ref: 'Garment'}]
});

hqSchema.plugin(uniqueValidator);

module.exports = mongoose.model('HQ', hqSchema);