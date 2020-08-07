const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  text: { type: String, required: true  },
  image: { type: String, default: '' },
  created: { type: Number, required: true  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  likes: { type: mongoose.Schema.Types.ObjectId, ref: 'Like' }
});

module.exports = mongoose.model("Post", postSchema);