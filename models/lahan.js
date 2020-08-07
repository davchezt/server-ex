const mongoose = require('mongoose');

const lahanSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  nama: { type: String },
  lokasi: { type: String },
  latitude: { type: String },
  longitude: { type: String },
  luas: { type: Number },
  satuan: { type: String },
  foto: { type: String }
});

module.exports = mongoose.model('Lahan', lahanSchema);