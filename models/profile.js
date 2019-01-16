const mongoose = require('mongoose');

const profileSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  // owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	name: { type: String, require: true },
  dob: { type: Number, require: false, default: 0 },
  gender: { type: Number, require: false, default: 1 },
  location: { type: String, require: false, default: '' },
  picture: { type: String, require: false, default: '' },
  bio: { type: String, require: false, default: '' },
  phone: { type: String, require: false, default: '' },
  instagram: { type: String, require: false, default: '' },
  twitter: { type: String, require: false, default: '' },
  facebook: { type: String, require: false, default: '' },
  whatsapp: { type: String, require: false, default: '' },
  github: { type: String, require: false, default: '' }
});

module.exports = mongoose.model('Profile', profileSchema);