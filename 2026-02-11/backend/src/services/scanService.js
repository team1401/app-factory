const dependencyParser = require('../parsers/dependencyParser');
const osvClient = require('../clients/osvClient');
const aiService = require('./aiService');

// In-memory storage for scan results
const scans = new Map();

// Generate a simple UUID-like ID
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new vulnerability scan
 * @param {string} fileContent - The content of the dependency file
 * @param {string} fileName - The name of the file (e.g., package.json)
 * @returns {string} scanId
 */
async function createScan(fileContent, fileName) {
  const scanId = generateId();

  // Initialize scan record
  scans.set(scanId, {
    scanId,
    status: 'processing',
    fileName,
    createdAt: new Date().toISOString(),
    progress: 0
  });

  // Process scan asynchronously
  processScan(scanId, fileContent, fileName).catch(error => {
    console.error(`Scan ${scanId} failed:`, error);
    scans.set(scanId, {
      ...scans.get(scanId),
      status: 'failed',
      error: error.message,
      completedAt: new Date().toISOString()
    });
  });

  return scanId;
}

/**
 * Process a vulnerability scan
 * @param {string} scanId
 * @param {string} fileContent
 * @param {string} fileName
 */
async function processScan(scanId, fileContent, fileName) {
  try {
    // Parse dependencies
    const dependencies = dependencyParser.parse(fileContent, fileName);
    
    updateScan(scanId, { 
      progress: 20, 
      totalDependencies: dependencies.length,
      message: `Found ${dependencies.length} dependencies`
    });

    if (dependencies.length === 0) {
      updateScan(scanId, {
        status: 'completed',
        progress: 100,
        vulnerabilities: [],
        summary: {
          total: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0
        },
        completedAt: new Date().toISOString()
      });
      return;
    }

    // Check vulnerabilities for each dependency
    const vulnerabilityResults = [];
    let checked = 0;

    for (const dep of dependencies) {
      try {
        const vulns = await osvClient.queryVulnerabilities(dep);
        if (vulns.length > 0) {
          vulnerabilityResults.push(...vulns);
        }
        checked++;
        updateScan(scanId, {
          progress: 20 + Math.floor((checked / dependencies.length) * 60),
          message: `Checked ${checked}/${dependencies.length} dependencies`
        });
      } catch (error) {
        console.error(`Error checking ${dep.name}:`, error.message);
      }
    }

    updateScan(scanId, {
      progress: 80,
      message: 'Analyzing vulnerabilities with AI...'
    });

    // AI analysis for vulnerabilities
    let aiAnalysis = null;
    if (vulnerabilityResults.length > 0) {
      try {
        aiAnalysis = await aiService.analyzeVulnerabilities(
          vulnerabilityResults,
          dependencies
        );
      } catch (error) {
        console.error('AI analysis failed:', error.message);
        aiAnalysis = {
          summary: 'AI analysis unavailable',
          recommendations: []
        };
      }
    }

    // Calculate summary
    const summary = {
      total: vulnerabilityResults.length,
      critical: vulnerabilityResults.filter(v => v.severity === 'CRITICAL').length,
      high: vulnerabilityResults.filter(v => v.severity === 'HIGH').length,
      medium: vulnerabilityResults.filter(v => v.severity === 'MEDIUM').length,
      low: vulnerabilityResults.filter(v => v.severity === 'LOW').length
    };

    // Update final results
    updateScan(scanId, {
      status: 'completed',
      progress: 100,
      vulnerabilities: vulnerabilityResults,
      summary,
      aiAnalysis,
      completedAt: new Date().toISOString()
    });

  } catch (error) {
    throw error;
  }
}

/**
 * Update scan status
 * @param {string} scanId
 * @param {object} updates
 */
function updateScan(scanId, updates) {
  const current = scans.get(scanId);
  if (current) {
    scans.set(scanId, { ...current, ...updates });
  }
}

/**
 * Get scan result
 * @param {string} scanId
 * @returns {object|null}
 */
function getScanResult(scanId) {
  return scans.get(scanId) || null;
}

// Cleanup old scans to prevent memory leaks
function cleanupOldScans() {
  const ONE_HOUR = 3600000;
  const now = Date.now();
  for (const [scanId, scan] of scans.entries()) {
    const age = now - new Date(scan.createdAt).getTime();
    if (age > ONE_HOUR) {
      scans.delete(scanId);
      console.log(`Cleaned up old scan: ${scanId}`);
    }
  }
}

// Run cleanup every 10 minutes
setInterval(cleanupOldScans, 600000);

module.exports = {
  createScan,
  getScanResult
};
