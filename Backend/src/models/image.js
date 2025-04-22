// models/Image.js
const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  prompt:   String,
  filename: String,                            // currently storing uploadStream.id
  fileId:   mongoose.Schema.Types.ObjectId,    // <-- new: store GridFS ObjectId
  url:      String,
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' }
});

module.exports = mongoose.model('Image', ImageSchema);
