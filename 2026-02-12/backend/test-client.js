/**
 * Simple test client for DebateArena backend
 * 
 * Usage: node test-client.js
 * 
 * This script:
 * 1. Checks health endpoint
 * 2. Creates a test debate
 * 3. Connects via WebSocket to watch it live
 */

const axios = require('axios');
const { io } = require('socket.io-client');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testBackend() {
  console.log('🧪 Testing DebateArena Backend');
  console.log('================================\n');

  // Test 1: Health check
  console.log('1️⃣  Testing health endpoint...');
  try {
    const healthRes = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthRes.data.status);
    console.log(`   Uptime: ${Math.round(healthRes.data.uptime)}s`);
    console.log(`   Memory: ${healthRes.data.memory.used}/${healthRes.data.memory.total} MB\n`);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
  }

  // Test 2: Create debate
  console.log('2️⃣  Creating test debate...');
  let debateId;
  try {
    const debateRes = await axios.post(`${BASE_URL}/api/debates`, {
      topic: 'Is artificial intelligence a threat to humanity?',
      models: [
        {
          name: 'claude-3-5-sonnet-20241022',
          provider: 'anthropic'
        },
        {
          name: 'gpt-4-turbo-preview',
          provider: 'openai'
        }
      ]
    });

    debateId = debateRes.data.debateId;
    console.log('✅ Debate created:', debateId);
    console.log(`   Topic: ${debateRes.data.topic}\n`);
  } catch (error) {
    console.error('❌ Failed to create debate:', error.response?.data || error.message);
    process.exit(1);
  }

  // Test 3: WebSocket connection
  console.log('3️⃣  Connecting via WebSocket...');
  const socket = io(BASE_URL, {
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket connected\n');
    console.log('📡 Joining debate room...');
    socket.emit('join-debate', debateId);
  });

  socket.on('debate-started', (data) => {
    console.log('🎬 Debate started!\n');
  });

  socket.on('model-thinking', (data) => {
    console.log(`💭 [Round ${data.round}] ${data.model} (${data.side}) is thinking...`);
  });

  socket.on('argument-chunk', (data) => {
    // Show first chunk only to avoid spam
    if (data.chunk.length < 50) {
      process.stdout.write(data.chunk);
    }
  });

  socket.on('argument-complete', (argument) => {
    console.log(`\n✅ [Round ${argument.round}] ${argument.side.toUpperCase()} (${argument.model}):`);
    console.log(`   ${argument.content.substring(0, 100)}...`);
    console.log(`   (${argument.content.length} characters)\n`);
  });

  socket.on('debate-complete', (data) => {
    console.log('🏁 Debate complete!');
    console.log(`   Total arguments: ${data.arguments.length}`);
    console.log(`   Vote counts: ${Object.keys(data.votes).length}\n`);
    
    console.log('✅ All tests passed!');
    socket.disconnect();
    process.exit(0);
  });

  socket.on('error', (error) => {
    console.error('❌ Socket error:', error.message);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  });

  // Timeout after 5 minutes
  setTimeout(() => {
    console.log('⏱️  Test timeout (5 minutes)');
    socket.disconnect();
    process.exit(0);
  }, 5 * 60 * 1000);
}

testBackend().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
