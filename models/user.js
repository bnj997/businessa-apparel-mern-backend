const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  _id: {type: String, required: true},
  hq: { type: String, required: true, ref: 'HQ' },
  branch: { type: String, required: true, ref: 'Branch' },
  username: {type: String, required: true },
  email: {type: String, required: true },
  password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);