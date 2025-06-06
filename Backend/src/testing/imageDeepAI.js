const mongoose = require('mongoose');

const textImageSchema = new mongoose.Schema({
  text: { 
    type: String, 
    required: true 
  },
  imageUrl: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('TextImage', textImageSchema);
