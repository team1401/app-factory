const logger = require('../utils/logger');
const AIProviderFactory = require('./aiProviderFactory');

class DebateManager {
  constructor(io) {
    this.io = io;
    this.debates = new Map();
    this.votes = new Map();
  }

  /**
   * Create a new debate
   */
  async createDebate(debateData) {
    const debate = {
      ...debateData,
      status: 'pending',
      arguments: [],
      currentRound: 0,
      maxRounds: 3
    };

    this.debates.set(debate.id, debate);
    return debate;
  }

  /**
   * Start a debate and manage turns
   */
  async startDebate(debateId) {
    const debate = this.debates.get(debateId);
    if (!debate) {
      throw new Error('Debate not found');
    }

    debate.status = 'active';
    this.io.to(debateId).emit('debate:started', { debateId });

    try {
      const providers = debate.models.map(model => 
        AIProviderFactory.getProvider(model.provider, model.name)
      );

      // 3 rounds, alternating between models
      for (let round = 1; round <= debate.maxRounds; round++) {
        debate.currentRound = round;

        for (let turn = 0; turn < 2; turn++) {
          const provider = providers[turn];
          const modelInfo = debate.models[turn];
          const side = turn === 0 ? 'pro' : 'con';

          // Emit thinking status
          this.io.to(debateId).emit('debate:thinking', {
            model: modelInfo.name,
            side,
            round
          });

          logger.info(`Round ${round}, ${side}: ${modelInfo.name} is generating argument`);

          try {
            // Build conversation context
            const context = this.buildContext(debate, side, round);
            
            // Stream the argument
            const argument = await this.streamArgument(
              provider,
              debate.topic,
              context,
              debateId,
              modelInfo,
              side,
              round
            );

            // Store the argument
            const argumentData = {
              id: `${debateId}-r${round}-${side}`,
              round,
              side,
              model: modelInfo.name,
              content: argument,
              timestamp: new Date().toISOString()
            };

            debate.arguments.push(argumentData);

            // Emit argument complete
            this.io.to(debateId).emit('debate:argument', argumentData);

            logger.info(`Argument completed: ${argumentData.id}`);

          } catch (error) {
            logger.error(`Error generating argument for ${modelInfo.name}:`, error);
            this.io.to(debateId).emit('error', {
              message: `Failed to generate argument for ${modelInfo.name}`,
              error: error.message
            });
          }

          // Brief pause between turns
          await this.sleep(1000);
        }
      }

      // Debate complete
      debate.status = 'completed';
      debate.completedAt = new Date().toISOString();
      
      this.io.to(debateId).emit('debate:complete', {
        debateId,
        arguments: debate.arguments,
        votes: this.getVoteCounts(debateId)
      });

      logger.info(`Debate completed: ${debateId}`);

    } catch (error) {
      logger.error(`Debate error for ${debateId}:`, error);
      debate.status = 'error';
      this.io.to(debateId).emit('error', {
        message: 'Debate encountered an error',
        error: error.message
      });
    }
  }

  /**
   * Stream an argument with real-time updates
   */
  async streamArgument(provider, topic, context, debateId, modelInfo, side, round) {
    let fullArgument = '';

    const onChunk = (chunk) => {
      fullArgument += chunk;
      this.io.to(debateId).emit('argument-chunk', {
        model: modelInfo.name,
        side,
        round,
        chunk
      });
    };

    await provider.generateArgument(topic, context, onChunk);
    
    return fullArgument;
  }

  /**
   * Build context for AI based on previous arguments
   */
  buildContext(debate, side, currentRound) {
    const previousArgs = debate.arguments.filter(arg => 
      arg.round < currentRound || (arg.round === currentRound && arg.side !== side)
    );

    if (previousArgs.length === 0) {
      return side === 'pro' 
        ? 'You are arguing FOR this topic. Present a strong opening argument.'
        : 'You are arguing AGAINST this topic. Present a strong opening argument.';
    }

    const context = side === 'pro'
      ? 'You are arguing FOR this topic. Here are the previous arguments:\n\n'
      : 'You are arguing AGAINST this topic. Here are the previous arguments:\n\n';

    return context + previousArgs.map(arg => 
      `[Round ${arg.round}] ${arg.side.toUpperCase()} (${arg.model}):\n${arg.content}\n`
    ).join('\n');
  }

  /**
   * Record a vote
   */
  async recordVote(debateId, argumentId, vote) {
    const voteKey = `${debateId}-${argumentId}`;
    
    if (!this.votes.has(voteKey)) {
      this.votes.set(voteKey, { up: 0, down: 0 });
    }

    const voteData = this.votes.get(voteKey);
    
    if (vote === 'up') {
      voteData.up++;
    } else if (vote === 'down') {
      voteData.down++;
    }

    return voteData;
  }

  /**
   * Get vote counts for a debate
   */
  getVoteCounts(debateId) {
    const votes = {};
    
    for (const [key, data] of this.votes.entries()) {
      if (key.startsWith(debateId)) {
        votes[key] = data;
      }
    }

    return votes;
  }

  /**
   * Get debate by ID
   */
  async getDebate(debateId) {
    const debate = this.debates.get(debateId);
    if (!debate) return null;

    return {
      ...debate,
      votes: this.getVoteCounts(debateId)
    };
  }

  /**
   * Get all debates
   */
  async getAllDebates() {
    return Array.from(this.debates.values()).map(debate => ({
      id: debate.id,
      topic: debate.topic,
      models: debate.models,
      status: debate.status,
      createdAt: debate.createdAt,
      completedAt: debate.completedAt,
      argumentCount: debate.arguments.length
    }));
  }

  /**
   * Utility: sleep for ms
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = DebateManager;
