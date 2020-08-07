const mongoose = require('mongoose');

const verifySchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	code: { type: String }
});

module.exports = mongoose.model('Verify', verifySchema);