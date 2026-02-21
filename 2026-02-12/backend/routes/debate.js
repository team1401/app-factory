const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * Create a new debate
 * POST /api/debates
 */
router.post('/', async (req, res) => {
  try {
    const { topic, models } = req.body;

    if (!topic || !models || models.length !== 2) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Topic and exactly 2 models are required'
      });
    }

    const debateManager = req.app.get('debateManager');
    const debateId = uuidv4();

    const debate = await debateManager.createDebate({
      id: debateId,
      topic,
      models,
      createdAt: new Date().toISOString()
    });

    logger.info(`Debate created: ${debateId} - "${topic}"`);

    res.status(201).json({
      debateId,
      topic,
      models,
      status: 'created'
    });

    // Start the debate asynchronously
    debateManager.startDebate(debateId).catch(err => {
      logger.error(`Failed to start debate ${debateId}:`, err);
    });

  } catch (error) {
    logger.error('Error creating debate:', error);
    res.status(500).json({
      error: 'Failed to create debate',
      message: error.message
    });
  }
});

/**
 * Get debate by ID
 * GET /api/debates/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const debateManager = req.app.get('debateManager');
    
    const debate = await debateManager.getDebate(id);
    
    if (!debate) {
      return res.status(404).json({ error: 'Debate not found' });
    }

    res.json(debate);
  } catch (error) {
    logger.error('Error fetching debate:', error);
    res.status(500).json({
      error: 'Failed to fetch debate',
      message: error.message
    });
  }
});

/**
 * Get all debates
 * GET /api/debates
 */
router.get('/', async (req, res) => {
  try {
    const debateManager = req.app.get('debateManager');
    const debates = await debateManager.getAllDebates();
    
    res.json({
      debates,
      count: debates.length
    });
  } catch (error) {
    logger.error('Error fetching debates:', error);
    res.status(500).json({
      error: 'Failed to fetch debates',
      message: error.message
    });
  }
});

module.exports = router;
