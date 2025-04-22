// backend/models/Document.js
const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  originalName: String,
  fileId:       mongoose.Schema.Types.ObjectId,  // <— new!
  imageCount:   { type: Number, default: 0 },
  images:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }]
});

module.exports = mongoose.model('Document', DocumentSchema);
