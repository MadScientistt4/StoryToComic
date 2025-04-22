const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const app = express();
const storyRoutes = require("./src/routes/storyRoutes.js");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });

    //const imageRoutes = require('./src/routes/imageGeneration.js');
    //const imagePollinationRoutes = require('./src/routes/imagePollination.js');
    const documentProcessingRoutes = require('./src/testing/generatePrompts.js');
    const basicFunctionality = require("./src/routes/basicFunctionalityRoutes")
    const imageRoutes = require("./src/routes/imageRoutes")
    const pdfRoutes = require("./src/routes/pdfRoutes.js")
    //app.use('/api/image/stability', imageRoutes);
    //app.use('/api/image/pollination', imagePollinationRoutes);
    //app.use('/api/document', documentProcessingRoutes);
    app.use("/api/pdf", pdfRoutes);
    app.use("/api/image", imageRoutes);
    app.use('/api/story', storyRoutes);
    app.use('/api/functionality', basicFunctionality)
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    
    const errorHandler = require('./src/middleware/errorHandler.js');
    app.use(errorHandler);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1); 
  });
