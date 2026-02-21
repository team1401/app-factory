const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { fetchArxivPaper, downloadArxivPdf } = require('../services/arxiv');
const { analyzePaper } = require('../services/ai');
const { validateAIConfig, validateFileUpload } = require('../middleware/validation');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * POST /api/explain
 * Main endpoint for explaining research papers
 * 
 * Body:
 *   - arxivUrl: string (arXiv URL)
 *   - text: string (raw paper text)
 *   - file: PDF upload (multipart/form-data)
 * 
 * Headers:
 *   - X-AI-Provider: 'openai' | 'anthropic'
 *   - X-AI-API-Key: API key for the provider
 *   - X-AI-Model: (optional) specific model to use
 */
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    const startTime = Date.now();
    const { arxivUrl, text } = req.body;
    const file = req.file;
    
    logger.info('Explain request received', { 
      hasArxivUrl: !!arxivUrl, 
      hasText: !!text, 
      hasFile: !!file 
    });
    
    // Validate AI configuration
    const aiConfig = validateAIConfig(req);
    
    // Determine input type and extract paper text
    let paperText = '';
    let metadata = {};
    
    if (arxivUrl) {
      // Fetch from arXiv
      logger.info('Processing arXiv URL', { arxivUrl });
      const paper = await fetchArxivPaper(arxivUrl);
      metadata = {
        title: paper.title,
        authors: paper.authors,
        published: paper.published,
        source: 'arxiv',
        arxivId: paper.id
      };
      
      // Download and parse PDF
      const pdfBuffer = await downloadArxivPdf(paper.id);
      const pdfData = await pdfParse(pdfBuffer);
      paperText = pdfData.text;
      
      // If PDF text extraction failed, use summary from API
      if (!paperText || paperText.length < 100) {
        logger.warn('PDF text extraction poor, using arXiv summary');
        paperText = `Title: ${paper.title}\n\nAuthors: ${paper.authors}\n\nAbstract: ${paper.summary}`;
      }
      
    } else if (file) {
      // Parse uploaded PDF
      logger.info('Processing uploaded PDF');
      validateFileUpload(file);
      
      const pdfData = await pdfParse(file.buffer);
      paperText = pdfData.text;
      metadata = {
        title: pdfData.info?.Title || 'Uploaded Paper',
        source: 'upload',
        filename: file.originalname
      };
      
    } else if (text) {
      // Use raw text
      logger.info('Processing raw text', { textLength: text.length });
      paperText = text;
      metadata = {
        source: 'text'
      };
      
    } else {
      throw new Error('No input provided. Send arxivUrl, file upload, or text');
    }
    
    // Validate we have paper text
    if (!paperText || paperText.trim().length < 50) {
      throw new Error('Failed to extract text from paper. Text too short or empty.');
    }
    
    logger.info('Paper text extracted', { length: paperText.length });
    
    // Send to AI for analysis
    const analysis = await analyzePaper(
      paperText, 
      aiConfig.provider, 
      aiConfig.apiKey,
      aiConfig.model
    );
    
    const duration = Date.now() - startTime;
    logger.info('Analysis complete', { duration: `${duration}ms` });
    
    // Return structured response
    res.json({
      success: true,
      metadata,
      analysis,
      provider: aiConfig.provider,
      processingTime: `${duration}ms`
    });
    
  } catch (error) {
    next(error);
  }
});

module.exports = router;
