const mongoose = require('mongoose');

const likeSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  created: { type: Number, required: true  },
  feed: { type: mongoose.Schema.Types.ObjectId, ref: 'Feed' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model("Like", likeSchema);