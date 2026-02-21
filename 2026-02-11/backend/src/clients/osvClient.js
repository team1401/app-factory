const axios = require('axios');

const OSV_API_URL = 'https://api.osv.dev/v1';

/**
 * Query OSV.dev for vulnerabilities
 * @param {object} dependency - { name, version, ecosystem }
 * @returns {Array} vulnerabilities
 */
async function queryVulnerabilities(dependency) {
  try {
    const response = await axios.post(
      `${OSV_API_URL}/query`,
      {
        package: {
          name: dependency.name,
          ecosystem: dependency.ecosystem
        },
        version: dependency.version !== 'latest' ? dependency.version : undefined
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );

    if (!response.data || !response.data.vulns) {
      return [];
    }

    // Transform OSV response to our format
    return response.data.vulns.map(vuln => {
      // Determine severity
      let severity = 'UNKNOWN';
      if (vuln.severity) {
        if (Array.isArray(vuln.severity)) {
          severity = vuln.severity[0]?.type || 'UNKNOWN';
        } else if (typeof vuln.severity === 'object') {
          severity = vuln.severity.type || 'UNKNOWN';
        }
      }

      // Extract CVSS score if available
      let cvssScore = null;
      if (vuln.severity) {
        const severityArray = Array.isArray(vuln.severity) ? vuln.severity : [vuln.severity];
        for (const sev of severityArray) {
          if (sev.score && typeof sev.score === 'string') {
            const match = sev.score.match(/([0-9.]+)/);
            if (match) {
              cvssScore = parseFloat(match[1]);
              break;
            }
          }
        }
      }

      // Always derive severity from CVSS score when available
      if (cvssScore) {
        if (cvssScore >= 9.0) severity = 'CRITICAL';
        else if (cvssScore >= 7.0) severity = 'HIGH';
        else if (cvssScore >= 4.0) severity = 'MEDIUM';
        else severity = 'LOW';
      } else if (severity !== 'UNKNOWN') {
        // If no CVSS score but we got a type string like "CVSS_V3", mark as MEDIUM
        severity = 'MEDIUM';
      }

      return {
        id: vuln.id,
        package: dependency.name,
        version: dependency.version,
        ecosystem: dependency.ecosystem,
        severity,
        cvssScore,
        summary: vuln.summary || 'No summary available',
        details: vuln.details || '',
        references: vuln.references || [],
        aliases: vuln.aliases || [],
        published: vuln.published,
        modified: vuln.modified,
        affected: vuln.affected || []
      };
    });
  } catch (error) {
    // Don't throw errors for individual package checks
    console.error(`OSV query failed for ${dependency.name}:`, error.message);
    return [];
  }
}

/**
 * Batch query vulnerabilities for multiple dependencies
 * @param {Array} dependencies
 * @returns {Array} all vulnerabilities
 */
async function batchQuery(dependencies) {
  const results = [];
  
  // Process in batches to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < dependencies.length; i += batchSize) {
    const batch = dependencies.slice(i, i + batchSize);
    const promises = batch.map(dep => queryVulnerabilities(dep));
    const batchResults = await Promise.all(promises);
    results.push(...batchResults.flat());
  }

  return results;
}

module.exports = {
  queryVulnerabilities,
  batchQuery
};
