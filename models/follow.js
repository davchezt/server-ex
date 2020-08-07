const mongoose = require('mongoose');

const followSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  created: { type: Number, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  target: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model("Follow", followSchema);