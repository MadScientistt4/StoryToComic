const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const app = express();
const storyRoutes = require("./src/routes/storyRoutes.js");

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB first
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    
    // Initialize routes after successful connection
    const imageRoutes = require('./src/routes/imageGeneration');
    const imagePollinationRoutes = require('./src/routes/imagePollination');
    const documentProcessingRoutes = require('./src/routes/generatePrompts');

    app.use('/api/image/stability', imageRoutes);
    app.use('/api/image/pollination', imagePollinationRoutes);
    app.use('/api/document', documentProcessingRoutes);
    app.use('/api/story', storyRoutes);
    // Static files
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    // Request logging middleware
    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });

    // Error handler middleware
    const errorHandler = require('./src/middleware/errorHandler');
    app.use(errorHandler);

    // Start the server after routes are registered
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err);
    process.exit(1); // Exit if database connection fails
  });
