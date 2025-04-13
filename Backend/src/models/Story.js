const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  originalText: {
    type: String, // optional: store the full story text
    default: ''
  },
  prompts: [{
    type: String
  }],
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  }
}, {
  timestamps: true // adds createdAt and updatedAt
});

module.exports = mongoose.model('Story', storySchema);
