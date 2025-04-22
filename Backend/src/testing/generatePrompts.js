const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const Document = require('../models/document');
const Image = require('../models/image');
const runPython = require('../utils/runPython');
const fs = require('fs');

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ChatGPT configuration
const CHATGPT_API_URL = process.env.CHATGPT_API_URL;
const CHATGPT_API_KEY = process.env.CHATGPT_API_KEY;

// GridFS bucket initialization
let bucket;

const initializeBucket = () => {
  if (mongoose.connection.readyState === 1) { // 1 = connected
    console.log('✅ Initializing GridFS bucket immediately');
    bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'documents'
    });
  } else {
    console.log('🕒 Waiting for MongoDB connection...');
    mongoose.connection.once('open', () => {
      console.log('✅ Initializing GridFS bucket after connection');
      bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'documents'
      });
    });
  }
};

// Initialize bucket on module load
initializeBucket();

// Add readiness check middleware
router.use((req, res, next) => {
  if (!bucket) {
    return res.status(503).json({
      success: false,
      error: 'Database not ready. Please try again later.'
    });
  }
  next();
});

router.post('/process', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // 1. Store original document in GridFS
    const uploadStream = bucket.openUploadStream(req.file.originalname);
    uploadStream.end(req.file.buffer);

    uploadStream.on('finish', async (file) => {
      try {
        // 2. Generate prompts using ChatGPT
        const promptTemplate = 'Extract detailed visual prompts from this story:';
        const apiUrl = `${CHATGPT_API_URL}?prompt=${encodeURIComponent(
          `${promptTemplate}\n\n${req.file.buffer.toString()}`
        )}&api_key=${CHATGPT_API_KEY}`;

        const response = await axios.get(apiUrl);
        const prompts = response.data?.output?.split('\n').filter(line => line.trim()) || [];

        // 3. Create document record
        const document = new Document({
          originalName: req.file.originalname,
          prompts,
          images: []
        });

        // 4. Generate and store images for each prompt
        for (const prompt of prompts) {
          const imagePath = await runPython(prompt);
          const imageUploadStream = bucket.openUploadStream(`${document._id}-${Date.now()}.png`);
          
          imageUploadStream.end(fs.readFileSync(imagePath));
          
          const imageDoc = new Image({
            prompt,
            filename: imageUploadStream.id,
            document: document._id
          });

          await imageDoc.save();
          document.images.push(imageDoc._id);
          fs.unlinkSync(imagePath);
        }

        await document.save();
        
        res.status(201).json({
          success: true,
          documentId: document._id,
          prompts: document.prompts,
          images: document.images
        });
      } catch (error) {
        res.status(500).json({ 
          success: false,
          error: error.message 
        });
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router; // Only export the router
