const fs = require('fs');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const Image = require('../models/image');
const runPython = require('./runPython');

async function processPromptsToImages(prompts, document) {
  const conn = mongoose.connection.db;
  const bucket = new GridFSBucket(conn, { bucketName: 'ai_images' });

  for (const prompt of prompts) {
    try {
      const outputFile = `temp-${Date.now()}.png`;
      const imagePath = await runPython(prompt, outputFile);

      // stream into GridFS
      const uploadStream = bucket.openUploadStream(outputFile, {
        metadata: { prompt, document: document._id },
      });
      const imageBuffer = fs.readFileSync(imagePath);  // <- fix variable name
      await new Promise((resolve, reject) => {
        uploadStream.on("finish", resolve);
        uploadStream.on("error", reject);
        uploadStream.end(imageBuffer); // <- now using correct variable
      });
      // record in your Image collection
      const imgDoc = new Image({
        prompt,
        filename: uploadStream.id.toString(),
        fileId:   uploadStream.id,   // store it here, too
        url:      `/api/image/${uploadStream.id}`,
        document: document._id,
      });
      
      await imgDoc.save();

      // update Document
      document.images.push(imgDoc._id);
      document.imageCount += 1;
      await document.save();

      fs.unlinkSync(imagePath);
    } catch (err) {
      console.error(`Image gen failed for prompt "${prompt}"`, err);
    }
  }
}

module.exports = processPromptsToImages;
