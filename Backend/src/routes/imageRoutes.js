const express = require("express");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

const router = express.Router();

// GET /api/image/:id
router.get('/:id', async (req, res) => {
    try {
      const fileId = new mongoose.Types.ObjectId(req.params.id);
      const conn = mongoose.connection.db;
      const bucket = new mongoose.mongo.GridFSBucket(conn, {
        bucketName: 'ai_images',
      });
  
      const downloadStream = bucket.openDownloadStream(fileId);
  
      res.set('Content-Type', 'image/png'); // or dynamic type later
      downloadStream.pipe(res);
  
      downloadStream.on('error', () => {
        res.status(404).json({ error: 'Image not found' });
      });
    } catch (err) {
      console.error('Image fetch error:', err);
      res.status(500).json({ error: 'Failed to fetch image' });
    }
  });


module.exports = router;
