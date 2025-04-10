const Story = require('../models/Story');
const Document = require('../models/document');
const Image = require('../models/image');

// GET all stories
exports.getAllStories = async (req, res) => {
  try {
    const stories = await Story.find().populate('document');
    
    res.json({
      success: true,
      stories: stories.map(story => ({
        id: story._id,
        title: story.title,
        documentId: story.document?._id,
        uploadedAt: story.createdAt,
        imageCount: story.document?.imageCount || 0
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET images by story ID
exports.getImagesByStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId).populate('document');
    if (!story || !story.document) {
      return res.status(404).json({ success: false, error: 'Story or document not found' });
    }

    const document = await Document.findById(story.document._id).populate('images');
    res.json({
      success: true,
      storyId: story._id,
      documentId: document._id,
      images: document.images.map(img => ({
        prompt: img.prompt,
        url: img.url,
        createdAt: img.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
