const mongoose = require('mongoose');

const komoditasSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
  lahan: { type: mongoose.Schema.Types.ObjectId, ref: 'Lahan' },
  rumus: { type: mongoose.Schema.Types.ObjectId, ref: 'Rumus' },
  jumlah: { type: Number },
  usia: { type: Number },
  tanam: { type: String },
  panen: { type: Number }
});

module.exports = mongoose.model('Komoditas', komoditasSchema);