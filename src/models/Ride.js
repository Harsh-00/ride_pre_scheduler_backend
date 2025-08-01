const mongoose = require('mongoose');
const RideSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pickup: { type: String, required: true, trim: true, maxlength: 200 },
  dropoff: { type: String, required: true, trim: true, maxlength: 200 },
  datetime: { type: Date, required: true },
  status: { type: String, enum: ['Pending','Approved','Rejected','Cancelled'], default: 'Pending' }
}, { timestamps: true });
module.exports = mongoose.model('Ride', RideSchema);
