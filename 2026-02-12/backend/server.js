require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const logger = require('./utils/logger');
const debateRoutes = require('./routes/debate');
const healthRoutes = require('./routes/health');
const DebateManager = require('./services/debateManager');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.io setup with CORS
const io = new Server(server, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Initialize debate manager
const debateManager = new DebateManager(io);

// Make debate manager available to routes
app.set('debateManager', debateManager);

// Routes
app.use('/health', healthRoutes);
app.use('/api/debates', debateRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'DebateArena API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      health: '/health',
      debates: '/api/debates'
    }
  });
});

// Model ID to provider mapping
function getProvider(modelId) {
  const map = {
    'gpt-4': 'openai',
    'gpt-4-turbo': 'openai',
    'gpt-4-turbo-preview': 'openai',
    'gpt-3.5-turbo': 'openai',
    'claude-sonnet': 'anthropic',
    'claude-3-5-sonnet-20241022': 'anthropic',
    'claude-3-opus-20240229': 'anthropic',
    'gemini-pro': 'openai',
    'llama2': 'ollama',
    'llama3': 'ollama',
    'mistral': 'ollama',
  };
  return map[modelId] || 'ollama';
}

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Join debate room
  socket.on('join-debate', (debateId) => {
    socket.join(debateId);
    logger.info(`Client ${socket.id} joined debate: ${debateId}`);
  });

  // Leave debate room
  socket.on('leave-debate', (debateId) => {
    socket.leave(debateId);
    logger.info(`Client ${socket.id} left debate: ${debateId}`);
  });

  // Start debate via socket (frontend uses this)
  socket.on('debate:start', async (data) => {
    try {
      const { topic, models } = data;
      const { v4: uuidv4 } = require('uuid');
      const debateId = uuidv4();

      // Normalize models — frontend may send { modelA, modelB } or array
      let modelArray;
      if (Array.isArray(models)) {
        modelArray = models.map(m => typeof m === 'string' 
          ? { provider: getProvider(m), name: m }
          : m
        );
      } else if (models && models.modelA && models.modelB) {
        modelArray = [
          { provider: getProvider(models.modelA), name: models.modelA },
          { provider: getProvider(models.modelB), name: models.modelB }
        ];
      } else {
        socket.emit('error', { message: 'Invalid models format' });
        return;
      }

      const debate = await debateManager.createDebate({
        id: debateId,
        topic,
        models: modelArray,
        createdAt: new Date().toISOString()
      });

      socket.join(debateId);
      socket.emit('debate:started', { debateId, topic, models: modelArray });

      debateManager.startDebate(debateId).catch(err => {
        logger.error(`Failed to start debate ${debateId}:`, err);
      });
    } catch (error) {
      logger.error('debate:start error:', error);
      socket.emit('error', { message: error.message });
    }
  });

  // Vote on argument
  socket.on('vote', async (data) => {
    try {
      const { debateId, argumentId, vote, voteType } = data;
      const voteValue = vote || voteType || 'up';
      await debateManager.recordVote(debateId, argumentId, voteValue);
      
      // Broadcast updated vote counts to all clients in the debate
      const voteCount = await debateManager.getVoteCounts(debateId);
      io.to(debateId).emit('vote:update', { argumentId, voteCount });
      
      logger.info(`Vote recorded: debate=${debateId}, argument=${argumentId}, vote=${voteValue}`);
    } catch (error) {
      logger.error('Vote error:', error);
      socket.emit('error', { message: 'Failed to record vote' });
    }
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`🚀 DebateArena server running on port ${PORT}`);
  logger.info(`📡 WebSocket server ready`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});
