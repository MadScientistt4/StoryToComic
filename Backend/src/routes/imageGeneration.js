const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const Image = require('../models/image'); // Import the Mongoose model

const router = express.Router();

router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Configure API request
    const apiUrl = 'https://api.stability.ai/v2beta/stable-image/generate/ultra';
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('output_format', 'webp');

    // Make API call
    const response = await axios.post(apiUrl, formData, {
      headers: {
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        ...formData.getHeaders(),
        Accept: 'image/*',
      },
      responseType: 'arraybuffer', // Expect binary data (image)
    });

    if (response.status === 200) {
      // Save image data to MongoDB
      const newImage = new Image({
        prompt,
        image: {
          data: Buffer.from(response.data), // Store binary data
          contentType: 'image/webp', // Specify content type
        },
      });

      await newImage.save();

      res.json({
        status: 'success',
        message: 'Image generated and saved to database successfully!',
        imageId: newImage._id,
      });
    } else {
      throw new Error(`Failed to generate image. Status code: ${response.status}`);
    }
  } catch (error) {
    console.error('Error generating image:', error.message || error);
    res.status(500).json({
      error: error.response?.data?.message || 'Image generation failed',
    });
  }
});
router.get('/image/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the image by ID
    const imageDoc = await Image.findById(id);

    if (!imageDoc) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Set the content type and send the image data
    res.set('Content-Type', imageDoc.image.contentType);
    res.send(imageDoc.image.data);
  } catch (error) {
    console.error('Error retrieving image:', error.message || error);
    res.status(500).json({ error: 'Failed to retrieve image' });
  }
});


module.exports = router;
