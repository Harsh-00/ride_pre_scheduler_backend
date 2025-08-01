const mongoose = require('mongoose');
const AdminActionSchema = new mongoose.Schema({
  ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['Approved','Rejected'], required: true },
  timestamp: { type: Date, default: Date.now }
});
module.exports = mongoose.model('AdminAction', AdminActionSchema); 