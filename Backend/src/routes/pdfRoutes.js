// routes/pdf.js
const router = require('express').Router();
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const { promisify } = require('util');
const PDFDocument = require('pdfkit');
const fs = require('fs');
// At the top of your PDF routes file
const Story = require('../models/Story'); // Adjust path as needed
const Document = require('../models/document');
const Image = require('../models/image');
const path = require('path'); 
const PDF = require('../models/PDF');

// Initialize GridFS
let gfs;
const conn = mongoose.connection;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('pdfs');
});

// Ensure temp directory exists
const ensureTempDir = async () => {
  const tempDir = path.join(__dirname, '..', 'temp');
  try {
    await fs.mkdir(tempDir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
  return tempDir;
};

// PDF Generation Route
router.post('/generate-pdf/:storyId', async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await Story.findById(storyId)
      .populate({
        path: 'document',
        populate: { path: 'images' }
      });

    if (!story) return res.status(404).json({ error: 'Story not found' });

    const pdfDoc = new PDFDocument();
    const chunks = [];
    const tempDir = await ensureTempDir();

    // PDF Content Generation
    pdfDoc.on('data', chunk => chunks.push(chunk));
    
    const pdfPromise = new Promise((resolve) => {
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    // Process images sequentially
    for (const [index, image] of story.document.images.entries()) {
      const imagePath = path.join(tempDir, `image-${index}.jpg`);
      
      // Write image to temp file
      await new Promise((resolve, reject) => {
        const writeStream = require('fs').createWriteStream(imagePath);
        const readStream = gfs.createReadStream({ _id: image.fileId });
        
        readStream.on('error', reject);
        writeStream.on('error', reject);
        writeStream.on('finish', resolve);
        readStream.pipe(writeStream);
      });

      // Add image to PDF
      pdfDoc.image(imagePath, { fit: [500, 400], align: 'center' });
      pdfDoc.text(image.prompt, { align: 'center' });
      pdfDoc.addPage();

      // Cleanup temp file
      await fs.unlink(imagePath);
    }

    pdfDoc.end();
    const pdfBuffer = await pdfPromise;

    // Store in GridFS
    const filename = `${story.title}-${Date.now()}.pdf`;
    const writeStream = gfs.createWriteStream({ filename, contentType: 'application/pdf' });
    writeStream.write(pdfBuffer);
    writeStream.end();

    // Save PDF metadata
    const newPDF = new PDF({
      filename,
      story: storyId,
      document: story.document._id,
      fileId: writeStream.id
    });
    await newPDF.save();

    res.json({
      success: true,
      pdfId: newPDF._id,
      url: `/api/pdfs/${newPDF._id}`
    });

  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ 
      error: 'PDF generation failed',
      details: err.message 
    });
  }
});

// Get all PDFs
router.get('/pdfs', async (req, res) => {
  try {
    const pdfs = await PDF.find()
      .populate('story', 'title createdAt')
      .sort({ createdAt: -1 });
      
    res.json({ success: true, pdfs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch PDFs' });
  }
});

// Get PDF file
router.get('/pdf/:id', async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id);
    if (!pdf) return res.status(404).json({ error: 'PDF not found' });

    const readStream = gfs.createReadStream({ _id: pdf.fileId });
    res.set('Content-Type', 'application/pdf');
    readStream.pipe(res);
    
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve PDF' });
  }
});
router.delete('/pdf/:id', async (req, res) => {
    try {
      const pdf = await PDF.findById(req.params.id);
      if (!pdf) return res.status(404).json({ error: 'PDF not found' });
  
      // Delete from GridFS
      gfs.remove({ _id: pdf.fileId }, (err) => {
        if (err) throw err;
      });
  
      // Delete PDF document
      await PDF.findByIdAndDelete(req.params.id);
      
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete PDF' });
    }
  });
  
module.exports = router;
