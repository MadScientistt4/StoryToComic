const mongoose = require('mongoose');
const GridFSBucket = mongoose.mongo.GridFSBucket;

let bucket;
mongoose.connection.on('connected', () => {
  bucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'ai_images'
  });
});

const storeImage = async (filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename);
    const readStream = require('fs').createReadStream(filename);
    
    readStream.pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => {
        resolve(uploadStream.id);
        require('fs').unlinkSync(filename); // Cleanup
      });
  });
};

module.exports = { storeImage };
