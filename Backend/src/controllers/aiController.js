const runPython = require('../utils/runPython');
const { storeImage } = require('../services/imageStorage');
const mammoth = require('mammoth');
const Image = require('../models/image');
const { GridFSBucket } = require('mongodb');
const mongoose = require('mongoose');

const Document = require('../models/document');

exports.processDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    // Create document record
    const document = new Document({
      originalName: req.file.originalname,
      imageCount: 0,
      images: []
    });

    await document.save();

    // Process prompts
    const result = await mammoth.extractRawText({ buffer: req.file.buffer });
    const prompts = result.value.split('\n').filter(line => line.trim());
    
    const conn = mongoose.connection.db;
    const bucket = new GridFSBucket(conn, { bucketName: 'ai_images' });

    for (const prompt of prompts) {
      try {
        const outputFile = `temp-${Date.now()}.png`;
        const imagePath = await runPython(prompt, outputFile);
        
        const uploadStream = bucket.openUploadStream(imagePath, {
          metadata: { prompt, document: document._id }
        });

        const imageBuffer = require('fs').readFileSync(imagePath);
        uploadStream.end(imageBuffer);

        const imageDoc = new Image({
          prompt,
          filename: uploadStream.id.toString(),
          url: `/api/images/${uploadStream.id}`,
          document: document._id
        });
        
        await imageDoc.save();
        
        // Update document record
        document.images.push(imageDoc._id);
        document.imageCount += 1;
        await document.save();

        require('fs').unlinkSync(imagePath);

      } catch (error) {
        console.error(`Failed to process prompt "${prompt}":`, error);
      }
    }

    res.status(201).json({ 
      success: true,
      documentId: document._id,
      totalPrompts: prompts.length,
      successfulGenerations: document.imageCount
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
exports.getAllDocuments = async (req, res) => {
    try {
      const documents = await Document.find().sort({ uploadedAt: -1 });
      res.json({ 
        success: true,
        documents: documents.map(doc => ({
          id: doc._id,
          originalName: doc.originalName,
          uploadedAt: doc.uploadedAt,
          imageCount: doc.imageCount
        }))
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  };
// New method to get images by document
exports.getDocumentImages = async (req, res) => {
  try {
    const document = await Document.findById(req.params.documentId)
      .populate('images', 'prompt url createdAt');

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({
      success: true,
      document: {
        id: document._id,
        originalName: document.originalName,
        uploadedAt: document.uploadedAt,
        images: document.images
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

exports.generateImage = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Generate image
    const tempFile = await runPython(prompt);
    
    // Store in MongoDB
    const fileId = await storeImage(tempFile);
    
    res.status(201).json({
      success: true,
      fileId,
      downloadUrl: `/api/v1/images/${fileId}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Generation failed: ${error.message}`
    });
  }
};


