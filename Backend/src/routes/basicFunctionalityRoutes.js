// backend/routes/story.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const mammoth = require('mammoth');
const axios = require('axios');
const mongoose = require('mongoose');
const { GridFSBucket, ObjectId } = require('mongodb');
const Document = require('../models/document');
const Story = require('../models/Story');
const Image = require('../models/image');
const upload = require('../middleware/upload');
const processPromptsToImages = require('../utils/imageProcessor');

// 1. Upload document and extract text
router.post('/upload-story', upload.single('storyFile'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

  try {
    // 1) Extract text from buffer
    const ext = req.file.originalname.toLowerCase().endsWith('.docx')
      ? 'docx' : 'txt';

    let storyText;
    if (ext === 'txt') {
      storyText = req.file.buffer.toString('utf8');
    } else {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      storyText = result.value;
    }

    // 2) Save the raw file into GridFS
    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype
    });
    uploadStream.end(req.file.buffer);

    // wait for the upload to finish
    const fileId = await new Promise((resolve, reject) => {
      uploadStream.on('finish', () => resolve(uploadStream.id));
      uploadStream.on('error', reject);
    });

    // 3) Persist Document record pointing at that fileId
    const document = await Document.create({
      originalName:   req.file.originalname,
      fileId,             // <-- store the GridFS _id
      imageCount:     0,
      images:         []
    });

    // 4) Create story record with extracted text
    const story = await Story.create({
      title:        req.file.originalname,
      document:     document._id,
      originalText: storyText,
      prompts:      []
    });

    res.status(201).json({
      success:    true,
      storyId:    story._id,
      documentId: document._id,
      storyText
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed.' });
  }
});

// 2. Generate prompts from story
router.post('/generate-prompts/:storyId', async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await Story.findById(storyId);
    if (!story) return res.status(404).json({ error: 'Story not found.' });

    const promptText = `
You are a visual storyteller and comic panel designer working for Marvel Comics.

Your task is to convert the short story below into detailed visual descriptions for comic panels. Understand the full context, characters, setting, and flow of the story. Then break it into vivid, cinematic comic panels — each describing exactly what should be illustrated in that scene.

Make sure each prompt includes:
- Who is in the scene (name, appearance, emotion)
- What action is happening
- What the background looks like
- Lighting or mood
- Marvel comic book style (bold, dramatic poses, dynamic composition)
-Should be colored
Keep the descriptions in the style of prompts for an AI image generator.
**Use present tense.** Output one prompt per line.

Here is the story:
---
${story.originalText}
---
Now begin creating your prompts:
`;


    const aiResponse = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      { model: 'mistralai/mistral-7b-instruct', messages: [{ role: 'user', content: promptText }] },
      { headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' } }
    );

    const content = aiResponse.data.choices[0].message.content;
    const prompts = content.split('\n').filter(line => line.trim());
    story.prompts = prompts;
    await story.save();

    res.status(200).json({ success: true, prompts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate prompts.' });
  }
});

// 3. Generate images from prompts
router.post('/generate-images/:storyId', async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await Story.findById(storyId).populate('document');
    if (!story) return res.status(404).json({ error: 'Story not found.' });
    const document = await Document.findById(story.document._id);

    // Reuse image generation logic
    await processPromptsToImages(story.prompts, document);

    const images = await Image.find({ document: document._id });
    res.json({
      success: true,
      images: images.map(img => ({
        id:     img._id.toString(),
        fileId: img.fileId.toString(),
        url:    img.url,
        prompt: img.prompt
      }))
      
    })
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate images.' });
  }
});

module.exports = router;
