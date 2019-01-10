const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  from: { type: String },
  text: { type: String },
  created: { type: Number }
});

module.exports = mongoose.model("ChatRoom", chatSchema);