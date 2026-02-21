const axios = require('axios');
const xml2js = require('xml2js');
const logger = require('../utils/logger');

/**
 * Extract arXiv ID from URL
 * Supports: arxiv.org/abs/2301.12345, arxiv.org/pdf/2301.12345.pdf
 */
function extractArxivId(url) {
  const patterns = [
    /arxiv\.org\/abs\/(\d+\.\d+)/,
    /arxiv\.org\/pdf\/(\d+\.\d+)/,
    /(\d{4}\.\d{4,5})/  // Just the ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  throw new Error('Invalid arXiv URL format');
}

/**
 * Fetch paper metadata and PDF URL from arXiv API
 */
async function fetchArxivPaper(url) {
  try {
    const arxivId = extractArxivId(url);
    logger.info('Fetching arXiv paper', { arxivId });
    
    // arXiv API endpoint
    const apiUrl = `http://export.arxiv.org/api/query?id_list=${arxivId}`;
    
    const response = await axios.get(apiUrl, {
      timeout: 10000,
      headers: { 'User-Agent': 'PaperPlain/1.0' }
    });
    
    // Parse XML response
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(response.data);
    
    const entry = result.feed.entry?.[0];
    if (!entry) {
      throw new Error('Paper not found on arXiv');
    }
    
    // Extract metadata
    const paper = {
      id: arxivId,
      title: entry.title[0].trim(),
      authors: entry.author.map(a => a.name[0]).join(', '),
      summary: entry.summary[0].trim().replace(/\s+/g, ' '),
      published: entry.published[0],
      pdfUrl: `https://arxiv.org/pdf/${arxivId}.pdf`
    };
    
    logger.info('Successfully fetched arXiv paper', { title: paper.title });
    return paper;
    
  } catch (error) {
    logger.error('Error fetching arXiv paper', { error: error.message, url });
    throw new Error(`Failed to fetch arXiv paper: ${error.message}`);
  }
}

/**
 * Download PDF content from arXiv
 */
async function downloadArxivPdf(arxivId) {
  try {
    const pdfUrl = `https://arxiv.org/pdf/${arxivId}.pdf`;
    logger.info('Downloading arXiv PDF', { arxivId, pdfUrl });
    
    const response = await axios.get(pdfUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: { 'User-Agent': 'PaperPlain/1.0' }
    });
    
    return Buffer.from(response.data);
    
  } catch (error) {
    logger.error('Error downloading arXiv PDF', { error: error.message, arxivId });
    throw new Error(`Failed to download PDF: ${error.message}`);
  }
}

module.exports = {
  extractArxivId,
  fetchArxivPaper,
  downloadArxivPdf
};
