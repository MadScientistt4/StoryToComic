const express = require('express');
const deepai = require('deepai');
const TextImage = require('./imageDeepAI');
require('dotenv').config();

deepai.setApiKey(process.env.DEEPAI_API_KEY);

const router = express.Router();

router.post('/generate-image', async (req, res) => {
  try {
    const { text } = req.body;
    
    // Generate image via DeepAI API
    const response = await deepai.callStandardApi("text2image", { text });
    
    // Create database entry
    const newEntry = await TextImage.create({
      text,
      imageUrl: response.output_url
    });

    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      originalRequest: {
        method: req.method,
        url: req.originalUrl,
        body: req.body
      }
    });
  }
});

module.exports = router;
