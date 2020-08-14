const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const branchSchema = new Schema({
  _id: {type: String, required: true},
  name: { type: String, required: true },
  telephone: { type: String, required: true },
  address: {type: String, required: true },
  email: { type: String, required: true },
  hq: {type: String, required: true, ref: 'HQ'},
  users: [{type: String, required: true, ref: 'User'}]
});

branchSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Branch', branchSchema);