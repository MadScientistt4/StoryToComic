const express = require('express');
const router = express.Router();
const { processDocument, getAllDocuments, getDocumentImages} = require('../controllers/aiController');
const validatePrompt = require('../middleware/validatePrompt');
const rateLimit = require('express-rate-limit');
const upload = require('../middleware/upload');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT || 5
});
router.post('/upload', upload, processDocument);
router.get('/documents', getAllDocuments); // New route
router.get('/documents/:documentId', getDocumentImages); // New route
//router.get('/images/:id', getImage);

// Add these to exports
module.exports = router;
