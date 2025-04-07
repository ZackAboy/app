const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: true
  },
  profileImageUrl: {
    type: String,
    required: true
  },
  favorites: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model('User', userSchema);