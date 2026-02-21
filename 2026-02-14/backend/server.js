const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const xml2js = require('xml2js');
const pdfParse = require('pdf-parse');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Extract text from PDF
async function extractPdfText(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

// Fetch paper from arXiv
async function fetchArxivPaper(url) {
  // Extract arXiv ID from URL
  const arxivIdMatch = url.match(/arxiv\.org\/(abs|pdf)\/(\d+\.\d+(v\d+)?)/);
  if (!arxivIdMatch) {
    throw new Error('Invalid arXiv URL');
  }
  
  const arxivId = arxivIdMatch[2];
  
  // Fetch metadata from arXiv API
  const apiUrl = `http://export.arxiv.org/api/query?id_list=${arxivId}`;
  const response = await axios.get(apiUrl);
  
  // Parse XML
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(response.data);
  
  const entry = result.feed.entry[0];
  const title = entry.title[0].replace(/\s+/g, ' ').trim();
  const abstract = entry.summary[0].replace(/\s+/g, ' ').trim();
  const authors = entry.author.map(a => a.name[0]).join(', ');
  
  // Try to fetch full PDF text
  try {
    const pdfUrl = `https://arxiv.org/pdf/${arxivId}.pdf`;
    const pdfResponse = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const fullText = await extractPdfText(Buffer.from(pdfResponse.data));
    
    return {
      title,
      authors,
      abstract,
      fullText: fullText.substring(0, 50000) // Limit to prevent token overflow
    };
  } catch (err) {
    // If PDF fetch fails, use abstract only
    return {
      title,
      authors,
      abstract,
      fullText: abstract
    };
  }
}

// Explain paper using AI
async function explainPaper(text, provider, apiKey) {
  const prompt = `You are an expert at explaining complex research papers in simple terms.

Analyze the following research paper and provide:

1. **TL;DR** - One sentence summary
2. **Key Findings** - 3-5 bullet points of main results
3. **Methodology** - Brief explanation of how they did the research
4. **Implications** - Why this matters, real-world impact
5. **ELI5** - Explain like I'm 5 years old
6. **Related Work** - 2-3 papers or topics to explore next

Paper text:
${text}

Respond in JSON format with keys: tldr, keyFindings (array), methodology, implications, eli5, relatedWork (array)`;

  if (provider === 'anthropic') {
    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
    
    const content = message.content[0].text;
    // Try to extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(content);
    
  } else {
    // Default to OpenAI
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{
        role: 'user',
        content: prompt
      }],
      response_format: { type: 'json_object' }
    });
    
    return JSON.parse(completion.choices[0].message.content);
  }
}

// Main explain endpoint
app.post('/api/explain', upload.single('pdf'), async (req, res) => {
  try {
    let paperText = '';
    let paperTitle = '';
    let paperAuthors = '';
    
    // Check for BYOK headers
    const provider = req.headers['x-ai-provider'] || 'openai';
    const customApiKey = req.headers['x-ai-api-key'];
    
    // Use custom key if provided, otherwise fall back to env
    const apiKey = customApiKey || 
      (provider === 'anthropic' ? process.env.ANTHROPIC_API_KEY : process.env.OPENAI_API_KEY);
    
    if (!apiKey) {
      return res.status(400).json({ 
        error: 'No API key provided. Either set environment variables or provide keys via X-AI-API-Key header' 
      });
    }
    
    // Handle different input methods
    if (req.body.arxivUrl) {
      const paper = await fetchArxivPaper(req.body.arxivUrl);
      paperText = paper.fullText;
      paperTitle = paper.title;
      paperAuthors = paper.authors;
    } else if (req.file) {
      paperText = await extractPdfText(req.file.buffer);
      paperTitle = 'Uploaded PDF';
    } else if (req.body.text) {
      paperText = req.body.text;
      paperTitle = 'Raw text';
    } else {
      return res.status(400).json({ error: 'No input provided. Send arxivUrl, pdf file, or raw text.' });
    }
    
    // Explain the paper
    const explanation = await explainPaper(paperText, provider, apiKey);
    
    res.json({
      title: paperTitle,
      authors: paperAuthors,
      ...explanation
    });
    
  } catch (error) {
    console.error('Error explaining paper:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3108;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`PaperPlain backend running on port ${PORT}`);
});
