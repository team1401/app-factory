const form = document.getElementById('drama-form');
const dramaInput = document.getElementById('drama');
const vibeInput = document.getElementById('vibe');
const statusEl = document.getElementById('status');
const btn = document.getElementById('broadcast-btn');

const urgencyEl = document.getElementById('urgency');
const headlineEl = document.getElementById('headline');
const subheadlineEl = document.getElementById('subheadline');
const anchorEl = document.getElementById('anchor-intro');
const fieldEl = document.getElementById('field-report');
const panelGrid = document.getElementById('panel-grid');
const advisoryEl = document.getElementById('advisory');
const meterFill = document.getElementById('meter-fill');
const importanceText = document.getElementById('importance-text');
const tickerTrack = document.getElementById('ticker-track');

function safeText(v, fallback = '') {
  return (typeof v === 'string' && v.trim()) ? v.trim() : fallback;
}

function renderPanel(panel = []) {
  panelGrid.innerHTML = '';
  const fallback = [
    { name: 'Rita Spinwell', title: 'Senior Chaos Correspondent', take: 'Awaiting panel commentary.', bias: 'chaos' },
    { name: 'Cal Norton', title: 'Reality Analyst', take: 'Awaiting panel commentary.', bias: 'logic' },
    { name: 'Lexi Blaze', title: 'Petty Affairs Contributor', take: 'Awaiting panel commentary.', bias: 'petty' }
  ];

  const source = Array.isArray(panel) && panel.length ? panel : fallback;

  source.forEach((p, i) => {
    const card = document.createElement('article');
    const bias = ['chaos', 'logic', 'petty'].includes(p.bias) ? p.bias : ['chaos', 'logic', 'petty'][i % 3];
    card.className = `panel-card bias-${bias}`;

    const h4 = document.createElement('h4');
    h4.textContent = safeText(p.name, `Panelist ${i + 1}`);

    const role = document.createElement('span');
    role.textContent = safeText(p.title, 'Commentator');

    const take = document.createElement('p');
    take.textContent = safeText(p.take, 'No comment at this time.');

    card.append(h4, role, take);
    panelGrid.appendChild(card);
  });
}

function renderTicker(items = []) {
  const clean = Array.isArray(items)
    ? items.filter(i => typeof i === 'string' && i.trim()).slice(0, 12)
    : [];

  if (!clean.length) {
    tickerTrack.textContent = 'DDN TICKER: awaiting incoming drama feed...';
    return;
  }

  const line = clean.map(i => `✦ ${i.toUpperCase()}`).join('   //   ');
  tickerTrack.textContent = `${line}   //   ${line}`;
}

function renderImportance(value) {
  const num = Number.isFinite(Number(value)) ? Number(value) : 1;
  const clamped = Math.max(1, Math.min(10, Math.round(num)));
  meterFill.style.width = `${clamped * 10}%`;

  let label = 'low urgency';
  if (clamped >= 8) label = 'national emotional emergency';
  else if (clamped >= 6) label = 'high volatility';
  else if (clamped >= 4) label = 'elevated concern';

  importanceText.textContent = `${clamped} / 10 — ${label}`;
}

async function submitDrama(event) {
  event.preventDefault();

  const drama = dramaInput.value.trim();
  const vibe = vibeInput.value;

  if (drama.length < 12) {
    statusEl.textContent = 'Please provide at least 12 characters of context.';
    statusEl.style.color = '#ffadad';
    dramaInput.focus();
    return;
  }

  btn.disabled = true;
  statusEl.textContent = 'Newsroom is verifying sources...';
  statusEl.style.color = '#f2be42';

  try {
    const res = await fetch('/api/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drama, vibe })
    });

    const payload = await res.json();

    if (!res.ok) {
      throw new Error(payload.error || 'Broadcast failed.');
    }

    urgencyEl.textContent = safeText(payload.urgency, 'BREAKING');
    headlineEl.textContent = safeText(payload.headline, 'BREAKING: PERSONAL DRAMA UNFOLDS');
    subheadlineEl.textContent = safeText(payload.subheadline, 'Our team is investigating.');
    anchorEl.textContent = safeText(payload.anchorIntro, 'No anchor copy available yet.');
    fieldEl.textContent = safeText(payload.fieldReport, 'No field report yet.');
    advisoryEl.textContent = safeText(payload.publicAdvisory, 'Public advisory unavailable.');

    renderPanel(payload.panel);
    renderTicker(payload.ticker);
    renderImportance(payload.importance);

    statusEl.textContent = 'Broadcast live. Screenshot responsibly.';
    statusEl.style.color = '#a6ffb3';
  } catch (err) {
    statusEl.textContent = err.message || 'The newsroom feed is down. Try again.';
    statusEl.style.color = '#ffadad';
  } finally {
    btn.disabled = false;
  }
}

form.addEventListener('submit', submitDrama);
renderPanel();
renderTicker();
renderImportance(1);
