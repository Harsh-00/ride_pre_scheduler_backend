const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name:       { type: String, required: true, trim: true, maxlength: 100 },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String, required: true },
  role:       { type: String, enum: ['user','admin'], default: 'user' },
  token:      { type: String, required: true, unique: true },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);