const logger = require('../utils/logger');

/**
 * Validate and extract AI provider configuration
 */
function validateAIConfig(req) {
  // Get from headers (BYOK) or environment variables
  const provider = (req.headers['x-ai-provider'] || 'openai').toLowerCase();
  const apiKey = req.headers['x-ai-api-key'] || 
                 (provider === 'openai' ? process.env.OPENAI_API_KEY : process.env.ANTHROPIC_API_KEY);
  const model = req.headers['x-ai-model'];
  
  if (!apiKey) {
    throw new Error(`No API key provided for ${provider}. Set X-AI-API-Key header or configure .env`);
  }
  
  if (!['openai', 'anthropic'].includes(provider)) {
    throw new Error(`Unsupported provider: ${provider}. Use 'openai' or 'anthropic'`);
  }
  
  logger.info('AI config validated', { provider, hasApiKey: !!apiKey, model });
  
  return { provider, apiKey, model };
}

/**
 * Validate file upload
 */
function validateFileUpload(file) {
  if (!file) {
    throw new Error('No file uploaded');
  }
  
  if (file.mimetype !== 'application/pdf') {
    throw new Error('Only PDF files are supported');
  }
  
  // Limit to 10MB
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File size exceeds 10MB limit');
  }
  
  logger.info('File upload validated', { 
    filename: file.originalname, 
    size: file.size,
    mimetype: file.mimetype 
  });
  
  return true;
}

/**
 * Error handler middleware
 */
function errorHandler(err, req, res, next) {
  logger.error('Request error', { 
    error: err.message, 
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = {
  validateAIConfig,
  validateFileUpload,
  errorHandler
};
