const mongoose = require('mongoose');

const countSchema = mongoose.Schema({
  ip: { type: String },
  date: { type: Number, default: Date.time }
});

module.exports = mongoose.model("VisitorCounts", countSchema);