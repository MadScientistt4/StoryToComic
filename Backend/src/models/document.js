const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  originalName: String,
  prompts: [String],
  images: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image'
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Document', documentSchema);
