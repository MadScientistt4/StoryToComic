// backend/middleware/upload.js
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = file.originalname.toLowerCase();
    if (ext.endsWith('.txt') || ext.endsWith('.docx')) cb(null, true);
    else cb(new Error('Only .txt and .docx allowed'), false);
  }
});
module.exports = upload;
