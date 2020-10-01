const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const hqSchema = new Schema({
  _id: {type: String, required: true},
  image: {type: String, required: true},
  name: { type: String, required: true },
  address: {type: String, required: true},
  telephone: { type: String, required: true },
  email: { type: String, required: true },
  garments: [{type: String, required: true, ref: 'Garment'}],
  branches: [{type: String, required: true, ref: 'Branch'}],
  users: [{type: String, required: true, ref: 'User'}]
});

hqSchema.plugin(uniqueValidator);

module.exports = mongoose.model('HQ', hqSchema);