const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  text: { type: String, required: true  },
  created: { type: Number, required: true  },
  feed: { type: mongoose.Schema.Types.ObjectId, ref: 'Feed' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model("Comment", commentSchema);