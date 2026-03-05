const form = document.getElementById('scriptForm');
const scriptInput = document.getElementById('scriptInput');
const venue = document.getElementById('venue');
const tempo = document.getElementById('tempo');
const formError = document.getElementById('formError');

const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const resultsState = document.getElementById('resultsState');
const statusPill = document.getElementById('statusPill');

const momentsList = document.getElementById('momentsList');
const riskList = document.getElementById('riskList');
const rescueList = document.getElementById('rescueList');
const waveCanvas = document.getElementById('waveCanvas');

const POSITIVE_WORDS = ['love', 'win', 'amazing', 'wow', 'secret', 'crazy', 'finally', 'surprise', 'free'];
const PUNCH_WORDS = ['listen', 'truth', 'plot twist', 'confession', 'imagine', 'here\'s the thing'];
const RISK_WORDS = ['process', 'framework', 'synergy', 'leverage', 'utilize', 'methodology'];

const VENUE_MULTIPLIER = {
  club: 1.2,
  conference: 0.95,
  wedding: 1.05,
  classroom: 0.85,
};

function setStatus(type, text) {
  statusPill.className = `status ${type}`;
  statusPill.textContent = text;
}

function showState(key) {
  loadingState.hidden = key !== 'loading';
  emptyState.hidden = key !== 'empty';
  resultsState.hidden = key !== 'results';
}

function sentenceChunks(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function scoreSentence(sentence, multiplier) {
  const lower = sentence.toLowerCase();
  let score = 15;

  POSITIVE_WORDS.forEach((w) => {
    if (lower.includes(w)) score += 8;
  });

  PUNCH_WORDS.forEach((w) => {
    if (lower.includes(w)) score += 12;
  });

  RISK_WORDS.forEach((w) => {
    if (lower.includes(w)) score -= 10;
  });

  if (sentence.includes('!')) score += 6;
  if (sentence.includes('?')) score += 4;
  if (sentence.length > 180) score -= 12;
  if (sentence.length < 45) score += 5;

  score *= multiplier;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildTimeline(sentences, wordsPerMinute, venueType) {
  const timeline = [];
  let elapsed = 0;
  const multiplier = VENUE_MULTIPLIER[venueType] ?? 1;

  for (const sentence of sentences) {
    const words = sentence.split(/\s+/).length;
    const seconds = Math.max(2, (words / wordsPerMinute) * 60);
    const score = scoreSentence(sentence, multiplier);

    let event = 'quiet chuckle';
    if (score >= 72) event = 'big laugh';
    else if (score >= 55) event = 'applause ripple';
    else if (score <= 22) event = 'awkward silence';

    timeline.push({
      sentence,
      score,
      event,
      start: elapsed,
      end: elapsed + seconds,
    });

    elapsed += seconds;
  }

  return timeline;
}

function renderList(listEl, values, fallbackText) {
  listEl.innerHTML = '';
  if (!values.length) {
    const li = document.createElement('li');
    li.textContent = fallbackText;
    listEl.appendChild(li);
    return;
  }

  values.forEach((v) => {
    const li = document.createElement('li');
    li.textContent = v;
    listEl.appendChild(li);
  });
}

function drawWaveform(data) {
  const ctx = waveCanvas.getContext('2d');
  const w = waveCanvas.width;
  const h = waveCanvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#f9f3de';
  ctx.fillRect(0, 0, w, h);

  // chart grid
  ctx.strokeStyle = '#d8cfb2';
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += 45) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += 26) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.strokeStyle = '#138a5a';
  ctx.lineWidth = 3;

  data.forEach((point, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * (w - 40) + 20;
    const y = h - (point.score / 100) * (h - 30) - 15;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);

    if (point.event === 'big laugh') {
      ctx.fillStyle = '#d7263d';
      ctx.fillRect(x - 3, y - 3, 6, 6);
    }
  });

  ctx.stroke();

  ctx.fillStyle = '#1f222d';
  ctx.font = '600 14px "IBM Plex Mono"';
  ctx.fillText('Audience Energy', 20, 20);
}

function analyzeScript(text, venueType, wordsPerMinute) {
  const sentences = sentenceChunks(text);
  const timeline = buildTimeline(sentences, wordsPerMinute, venueType);

  const bigMoments = timeline
    .filter((t) => t.score >= 55)
    .slice(0, 6)
    .map((t) => `${Math.round(t.start)}s — ${t.event}: “${t.sentence.slice(0, 80)}${t.sentence.length > 80 ? '…' : ''}”`);

  const riskMoments = timeline
    .filter((t) => t.score <= 25)
    .slice(0, 5)
    .map((t) => `${Math.round(t.start)}s — Flattened energy around “${t.sentence.slice(0, 55)}${t.sentence.length > 55 ? '…' : ''}”`);

  const rescue = [
    'Drop a personal confession line: “I probably should not admit this, but…”',
    'Use a pattern break: pause 1.5 seconds before the next key sentence.',
    'Convert one long sentence into a call-and-response question.',
    'Add one concrete prop/detail (name, place, weird object) right before a punchline.',
  ];

  return { timeline, bigMoments, riskMoments, rescue };
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  formError.textContent = '';

  const text = scriptInput.value.trim();

  if (text.length < 40) {
    setStatus('error', 'Need more text');
    formError.textContent = 'Please paste at least 40 characters so the simulator has enough data.';
    showState('empty');
    return;
  }

  const wordsPerMinute = Number(tempo.value);
  if (!Number.isFinite(wordsPerMinute) || wordsPerMinute < 90 || wordsPerMinute > 240) {
    setStatus('error', 'Bad pace value');
    formError.textContent = 'Delivery pace is invalid. Pick another option.';
    showState('empty');
    return;
  }

  const btn = document.getElementById('analyzeBtn');
  btn.disabled = true;
  setStatus('loading', 'Simulating room');
  showState('loading');

  try {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const results = analyzeScript(text, venue.value, wordsPerMinute);

    if (!results.timeline.length) {
      throw new Error('No timeline points generated');
    }

    drawWaveform(results.timeline);
    renderList(momentsList, results.bigMoments, 'No big moments yet — try shorter setup lines and stronger reveals.');
    renderList(riskList, results.riskMoments, 'No dead-air zones detected. Tight script.');
    renderList(rescueList, results.rescue, 'No rescue tips available.');

    setStatus('ready', `Ready • ${results.timeline.length} beats mapped`);
    showState('results');
  } catch (err) {
    console.error(err);
    formError.textContent = 'Simulation failed. Try a different script block.';
    setStatus('error', 'Simulation failed');
    showState('empty');
  } finally {
    btn.disabled = false;
  }
});
