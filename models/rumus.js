const mongoose = require('mongoose');

const rumusSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
  nama: { type: String },
  panen: { type: Number },
  p_a: { type: Number },
  p_b: { type: Number },
  p_c: { type: Number },
  umur: { type: Number },
  hari: { type: Number }
});

module.exports = mongoose.model('Rumus', rumusSchema);