const express = require("express");
const axios = require("axios");
const Story = require("../models/Story");
const Image = require("../models/image");
const Document = require("../models/document");
const { PDFDocument } = require('pdf-lib');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const router = express.Router();
/**
 * GET /api/story/all-stories
 * List all stories
 */
router.get('/all-stories', async (req, res) => {
  try {
    const stories = await Story.find()
      .sort({ createdAt: -1 }); // most recent first
    res.json({ success: true, stories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/story/story/:id
 * Delete a story and all its associated images
 */
router.delete('/story/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res
        .status(404)
        .json({ success: false, error: 'Story not found' });
    }

    // Remove all images linked to this story's document
    await Image.deleteMany({ document: story.document });

    // Delete the story using its ID
    await Story.findByIdAndDelete(req.params.id);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/story/stories/:id/images
 * Fetch all image URLs for a given story
 */
router.get('/stories/:id/images', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Find all Image docs whose `document` matches the story.document
    const images = await Image.find({ document: story.document })
      .select('url prompt filename fileId -_id');

    // If you just want to send back an array of URLs:
    // const urls = images.map(img => img.url);
    // return res.json({ images: urls });

    res.json({ images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

//Prompts for a story
// backend/routes/story.js
router.get('/prompts/:storyId', async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId).select('prompts');
    if (!story) return res.status(404).json({ error: 'Story not found' });
    res.json({ success: true, prompts: story.prompts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get prompts.' });
  }
});
// delete a story
router.delete('/story/:id', async (req, res) => {
  try {
    await Story.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete story.' });
  }
});

//download as pdf
router.get('/story-pdf/:storyId', async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId).populate('document');
    const images = await Image.find({ document: story.document });

    const pdfDoc = await PDFDocument.create();

    for (const img of images) {
      const imageBytes = await fetch(`http://localhost:5000${img.url}`).then(res => res.arrayBuffer());
      const image = await pdfDoc.embedJpg(imageBytes);
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height
      });
    }

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="comic.pdf"');
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate PDF.' });
  }
});


module.exports = router;
