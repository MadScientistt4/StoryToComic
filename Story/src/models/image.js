const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  prompt: String,
  filename: String,
  url: String,
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Image', imageSchema);
