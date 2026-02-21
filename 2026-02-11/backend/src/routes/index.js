const express = require('express');
const scanService = require('../services/scanService');

const router = express.Router();

// POST /api/scan - Create a new vulnerability scan
router.post('/scan', async (req, res, next) => {
  try {
    const { fileContent, fileName } = req.body;

    if (!fileContent) {
      return res.status(400).json({ error: 'fileContent is required' });
    }

    if (!fileName) {
      return res.status(400).json({ error: 'fileName is required' });
    }

    // Validate file content size and type
    if (typeof fileContent !== 'string' || fileContent.length > 1048576) {
      return res.status(400).json({ error: 'Invalid or oversized file content (max 1MB)' });
    }

    if (fileContent.length < 2) {
      return res.status(400).json({ error: 'File content too short' });
    }

    // Initiate scan
    const scanId = await scanService.createScan(fileContent, fileName);

    res.status(202).json({
      scanId,
      message: 'Scan initiated',
      statusUrl: `/api/scan/${scanId}`
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/scan/:id - Get scan results
router.get('/scan/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = scanService.getScanResult(id);

    if (!result) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
