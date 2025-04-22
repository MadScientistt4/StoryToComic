// models/PDF.js
const mongoose = require('mongoose');

const PDFSchema = new mongoose.Schema({
  filename: String,
  story: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    required: true
  },
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  fileId: mongoose.Schema.Types.ObjectId, // GridFS file ID
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PDF', PDFSchema);
