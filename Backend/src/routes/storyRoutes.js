const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const mammoth = require("mammoth");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

const Story = require("../models/Story");
const Image = require("../models/image");
const Document = require("../models/document");

const runPython = require("../utils/runPython");

const router = express.Router();
const upload = multer({ dest: "uploads/" });
const storyController = require('../controllers/storyController');

// List all stories
router.get('/', storyController.getAllStories);

// Get images for a specific story
router.get('/:storyId/images', storyController.getImagesByStory);
// Helper function to process prompts into images
const processPromptsToImages = async (prompts, document) => {
  const conn = mongoose.connection.db;
  const bucket = new GridFSBucket(conn, { bucketName: "ai_images" });

  for (const prompt of prompts) {
    try {
      const outputFile = `temp-${Date.now()}.png`;
      const imagePath = await runPython(prompt, outputFile);

      const uploadStream = bucket.openUploadStream(outputFile, {
        metadata: { prompt, document: document._id },
      });

      const imageBuffer = fs.readFileSync(imagePath);
      uploadStream.end(imageBuffer);

      const imageDoc = new Image({
        prompt,
        filename: uploadStream.id.toString(),
        url: `/api/images/${uploadStream.id}`,
        document: document._id,
      });

      await imageDoc.save();

      document.images.push(imageDoc._id);
      document.imageCount += 1;
      await document.save();

      fs.unlinkSync(imagePath);
    } catch (error) {
      console.error(`Image gen failed for prompt: "${prompt}"`, error);
    }
  }
};

router.post("/generate-prompts", upload.single("storyFile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  let storyText = "";
  try {
    const filePath = path.join(req.file.destination, req.file.filename);
    const ext = path.extname(req.file.originalname).toLowerCase();

    if (ext === ".txt") {
      storyText = fs.readFileSync(filePath, "utf-8");
    } else if (ext === ".docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      storyText = result.value;
    } else {
      return res.status(400).json({ error: "Unsupported file type." });
    }

    fs.unlinkSync(filePath);

    const prompt = `
            Convert the following short story into a list of comic panel prompts.
            Each line should describe a vivid visual scene for a comic panel.

            Story:
            ${storyText}

            Output one panel description per line:
            `;

    const aiResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = aiResponse.data.choices[0].message.content;
    const prompts = content.split("\n").filter((line) => line.trim());

    // Create the document first
    const document = new Document({
        originalName: req.file.originalname,
        imageCount: 0,
        images: [],
    });
    await document.save();
    
    // Then create the story using the document ID
    const newStory = new Story({
        title: req.file.originalname,
        document: document._id,
        originalText: storyText,
        prompts
    });
    await newStory.save();
  
    await document.save();

    // Call internal image generator with prompts
    await processPromptsToImages(prompts, document);
    const updatedDocument = await Document.findById(document._id);

    res.status(201).json({
        success: true,
        storyId: newStory._id,
        documentId: document._id,
        prompts,
        imageCount: updatedDocument.imageCount
      });
      
  } catch (error) {
    console.error("Error generating:", error.message);
    res.status(500).json({ error: "Processing failed." });
  }
});

// Route to get all stories
router.get("/stories", async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stories." });
  }
});

// Route to get a specific story by ID
router.get("/stories/:id", async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: "Story not found." });
    res.json(story);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch story." });
  }
});

module.exports = router;
