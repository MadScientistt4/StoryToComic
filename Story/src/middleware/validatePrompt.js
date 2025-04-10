const validatePrompt = (req, res, next) => {
    const { prompt } = req.body;
    
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    if (prompt.length > 500) {
      return res.status(400).json({ error: 'Prompt too long (max 500 chars)' });
    }
    
    next();
  };
  
  module.exports = validatePrompt;
  