const mongoose = require('mongoose');

const feedSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }
});

module.exports = mongoose.model("Feed", feedSchema);