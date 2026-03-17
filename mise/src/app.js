/* ============================================================
   mise — Meal Timing Coordinator
   Backward-schedules all dishes from a target serve time
   ============================================================ */

'use strict';

// ============================================================
// DATA
// ============================================================

let dishes = [];
let editingId = null;
let serviceInterval = null;

const PRESETS = [
  { name: 'Roast chicken', prep: 15, cook: 90, rest: 15, cat: 'protein' },
  { name: 'Baked salmon', prep: 10, cook: 20, rest: 5, cat: 'protein' },
  { name: 'Prime rib', prep: 20, cook: 120, rest: 30, cat: 'protein' },
  { name: 'Pork tenderloin', prep: 10, cook: 25, rest: 10, cat: 'protein' },
  { name: 'Roasted veggies', prep: 10, cook: 35, rest: 0, cat: 'veg' },
  { name: 'Steamed broccoli', prep: 5, cook: 10, rest: 0, cat: 'veg' },
  { name: 'Sautéed mushrooms', prep: 5, cook: 12, rest: 0, cat: 'veg' },
  { name: 'Mashed potatoes', prep: 10, cook: 25, rest: 5, cat: 'starch' },
  { name: 'Roasted potatoes', prep: 10, cook: 45, rest: 0, cat: 'starch' },
  { name: 'Rice', prep: 2, cook: 18, rest: 5, cat: 'starch' },
  { name: 'Pasta', prep: 5, cook: 12, rest: 0, cat: 'starch' },
  { name: 'Pan gravy', prep: 5, cook: 10, rest: 0, cat: 'sauce' },
  { name: 'Hollandaise', prep: 5, cook: 15, rest: 0, cat: 'sauce' },
  { name: 'Dinner rolls', prep: 5, cook: 20, rest: 5, cat: 'bread' },
  { name: 'Garlic bread', prep: 5, cook: 12, rest: 2, cat: 'bread' },
  { name: 'Apple pie', prep: 30, cook: 55, rest: 20, cat: 'dessert' },
  { name: 'Brownies', prep: 15, cook: 30, rest: 15, cat: 'dessert' },
  { name: 'Salad', prep: 15, cook: 0, rest: 0, cat: 'veg' },
];

// ============================================================
// UTILS
// ============================================================

function generateId() {
  return 'dish-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

function getServeMinutes() {
  const input = document.getElementById('serve-time');
  if (!input || !input.value) return null;
  const [h, m] = input.value.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTimeStr(totalMinutes) {
  // wrap around midnight
  let mins = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h < 12 ? 'AM' : 'PM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}

function nowMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
}

function formatDelta(diffMins) {
  const abs = Math.abs(Math.round(diffMins));
  if (abs < 1) return 'now';
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const sign = diffMins >= 0 ? 'in ' : '';
  const suffix = diffMins < 0 ? ' ago' : '';
  if (h > 0) return `${sign}${h}h ${m > 0 ? m + 'm' : ''}${suffix}`.trim();
  return `${sign}${m}m${suffix}`;
}

function showToast(msg, duration = 2200) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => el.classList.add('hidden'), duration);
}

// ============================================================
// SCHEDULING LOGIC
// ============================================================

/**
 * For each dish, calculate:
 *   startTime = serveTime - rest - cook - prep
 *   Each phase starts at:
 *     prep: startTime
 *     cook: startTime + prep
 *     rest: startTime + prep + cook
 */
function scheduleDishes(serveMinutes) {
  return dishes.map(dish => {
    const total = dish.prep + dish.cook + dish.rest;
    const startMin = serveMinutes - total;
    const cookStartMin = startMin + dish.prep;
    const restStartMin = cookStartMin + dish.cook;
    return {
      ...dish,
      startMin,
      cookStartMin,
      restStartMin,
      endMin: restStartMin + dish.rest,
      totalMin: total,
    };
  }).sort((a, b) => a.startMin - b.startMin);
}

/**
 * Build action list: every phase transition becomes an action
 */
function buildActions(scheduled) {
  const actions = [];
  for (const d of scheduled) {
    if (d.prep > 0) {
      actions.push({ time: d.startMin, verb: 'START PREP', dish: d.name, notes: d.notes, dishId: d.id, phase: 'prep' });
    }
    if (d.cook > 0) {
      const verb = d.prep > 0 ? 'BEGIN COOKING' : 'START COOKING';
      actions.push({ time: d.cookStartMin, verb, dish: d.name, notes: '', dishId: d.id, phase: 'cook' });
    }
    if (d.rest > 0) {
      actions.push({ time: d.restStartMin, verb: 'REST / REMOVE', dish: d.name, notes: `Hold ${d.rest} min`, dishId: d.id, phase: 'rest' });
    }
  }
  actions.push({ time: scheduled.length > 0 ? scheduled[0].endMin : getServeMinutes(), verb: 'SERVE', dish: 'Dinner', notes: '', dishId: null, phase: 'serve', isServe: true });
  return actions.sort((a, b) => a.time - b.time);
}

// ============================================================
// TIMELINE RENDERING
// ============================================================

function renderSetupTimeline() {
  const serveMin = getServeMinutes();
  if (!serveMin || dishes.length === 0) {
    document.getElementById('timeline-section').classList.add('hidden');
    return;
  }

  const scheduled = scheduleDishes(serveMin);
  const timelineSection = document.getElementById('timeline-section');
  timelineSection.classList.remove('hidden');

  const earliestStart = Math.min(...scheduled.map(d => d.startMin));
  const latestEnd = serveMin;
  const span = latestEnd - earliestStart;
  const padLeft = 0.02 * span; // small left margin
  const totalSpan = span + padLeft;

  // Earliest start label
  const label = document.getElementById('earliest-start-label');
  label.textContent = `Start at ${minutesToTimeStr(earliestStart)}`;

  // Build timeline rows
  const container = document.getElementById('timeline-container');
  container.innerHTML = '';

  for (const dish of scheduled) {
    const row = document.createElement('div');
    row.className = 'timeline-row';

    const labelEl = document.createElement('div');
    labelEl.className = 'timeline-label';
    labelEl.textContent = dish.name.length > 18 ? dish.name.slice(0, 16) + '…' : dish.name;
    row.appendChild(labelEl);

    const barArea = document.createElement('div');
    barArea.className = 'timeline-bar-area';

    // Position: offset from earliestStart - padLeft
    const leftPct = ((dish.startMin - (earliestStart - padLeft)) / totalSpan) * 100;
    const widthPct = (dish.totalMin / totalSpan) * 100;

    const bar = document.createElement('div');
    bar.className = 'timeline-bar';
    bar.style.left = leftPct + '%';
    bar.style.width = widthPct + '%';

    const prepPct = (dish.totalMin > 0 && dish.prep > 0) ? (dish.prep / dish.totalMin) * 100 : 0;
    const cookPct = (dish.totalMin > 0 && dish.cook > 0) ? (dish.cook / dish.totalMin) * 100 : 0;
    const restPct = (dish.totalMin > 0 && dish.rest > 0) ? (dish.rest / dish.totalMin) * 100 : 0;

    if (dish.prep > 0) {
      const prepEl = document.createElement('div');
      prepEl.className = 'bar-prep';
      prepEl.style.width = prepPct + '%';
      bar.appendChild(prepEl);
    }
    if (dish.cook > 0) {
      const cookEl = document.createElement('div');
      cookEl.className = 'bar-cook';
      cookEl.style.width = cookPct + '%';
      bar.appendChild(cookEl);
    }
    if (dish.rest > 0) {
      const restEl = document.createElement('div');
      restEl.className = 'bar-rest';
      restEl.style.width = restPct + '%';
      bar.appendChild(restEl);
    }

    barArea.appendChild(bar);

    // Start time label
    const startLabel = document.createElement('div');
    startLabel.className = 'bar-time-label start';
    startLabel.style.left = leftPct + '%';
    startLabel.style.transform = 'translateX(-100%) translateY(-50%)';
    startLabel.textContent = minutesToTimeStr(dish.startMin);
    barArea.appendChild(startLabel);

    row.appendChild(barArea);
    container.appendChild(row);
  }

  // Serve time marker
  const servePct = (serveMin - (earliestStart - padLeft)) / totalSpan * 100;
  // Add a final "serve" row
  const serveRow = document.createElement('div');
  serveRow.className = 'timeline-row';
  const serveLabel = document.createElement('div');
  serveLabel.className = 'timeline-label';
  serveLabel.style.fontFamily = 'var(--mono)';
  serveLabel.style.color = 'var(--warn)';
  serveLabel.style.fontSize = '11px';
  serveLabel.style.letterSpacing = '0.08em';
  serveLabel.textContent = '⬛ SERVE';
  serveRow.appendChild(serveLabel);
  const serveBArea = document.createElement('div');
  serveBArea.className = 'timeline-bar-area';
  serveBArea.style.borderLeft = '2px solid var(--warn)';
  serveRow.appendChild(serveBArea);
  container.appendChild(serveRow);

  // Conflict check
  renderConflicts(scheduled, serveMin);
}

function renderConflicts(scheduled, serveMin) {
  const container = document.getElementById('conflict-warnings');
  container.innerHTML = '';
  const conflicts = [];

  for (const dish of scheduled) {
    if (dish.startMin < 0) {
      conflicts.push(`<strong>${dish.name}</strong> needs to start at ${minutesToTimeStr(dish.startMin)} — that's ${Math.abs(dish.startMin / 60).toFixed(1)}h before midnight. Consider reducing cook time.`);
    }
    if (dish.endMin > serveMin + 5) {
      conflicts.push(`<strong>${dish.name}</strong> won't be ready until ${minutesToTimeStr(dish.endMin)} — ${Math.round(dish.endMin - serveMin)} min after dinner.`);
    }
  }

  // Check if two dishes both need the oven at the same time (heuristic: protein + starch that both have cook phases)
  const hasOvenUsers = scheduled.filter(d => ['protein', 'starch', 'bread', 'dessert'].includes(d.cat) && d.cook > 0);
  if (hasOvenUsers.length >= 2) {
    for (let i = 0; i < hasOvenUsers.length; i++) {
      for (let j = i + 1; j < hasOvenUsers.length; j++) {
        const a = hasOvenUsers[i], b = hasOvenUsers[j];
        const overlapStart = Math.max(a.cookStartMin, b.cookStartMin);
        const overlapEnd = Math.min(a.restStartMin, b.restStartMin);
        if (overlapEnd > overlapStart + 5) {
          conflicts.push(`⚠ Possible oven conflict: <strong>${a.name}</strong> and <strong>${b.name}</strong> both cook ${Math.round(overlapEnd - overlapStart)} min simultaneously.`);
        }
      }
    }
  }

  if (conflicts.length > 0) {
    container.classList.remove('hidden');
    container.innerHTML = conflicts.map(c => `<div class="conflict-item">${c}</div>`).join('');
  } else {
    container.classList.add('hidden');
  }
}

// ============================================================
// DISH LIST RENDERING
// ============================================================

function renderDishList() {
  const list = document.getElementById('dishes-list');
  const empty = document.getElementById('empty-state');
  const serveMin = getServeMinutes();

  if (dishes.length === 0) {
    list.innerHTML = '';
    empty.style.display = '';
    document.getElementById('timeline-section').classList.add('hidden');
    document.getElementById('start-service-btn').disabled = true;
    document.getElementById('service-hint').textContent = 'Add at least one dish to begin service';
    return;
  }

  empty.style.display = 'none';
  document.getElementById('start-service-btn').disabled = false;
  document.getElementById('service-hint').textContent = `${dishes.length} dish${dishes.length !== 1 ? 'es' : ''} planned`;

  const scheduled = serveMin ? scheduleDishes(serveMin) : dishes.map(d => ({ ...d, startMin: null }));
  const scheduledMap = {};
  scheduled.forEach(d => scheduledMap[d.id] = d);

  list.innerHTML = '';
  for (const dish of scheduled) {
    const card = document.createElement('div');
    card.className = 'dish-card';
    card.setAttribute('data-cat', dish.cat || 'other');
    card.setAttribute('data-id', dish.id);

    const now = nowMinutes();
    if (dish.startMin !== null && dish.startMin < now && serveMin > now) {
      card.classList.add('overdue');
    }

    const startStr = dish.startMin !== null ? minutesToTimeStr(dish.startMin) : '--:--';

    card.innerHTML = `
      <div class="dish-name">${escapeHtml(dish.name)}</div>
      <div class="dish-times">
        ${dish.prep > 0 ? `<span class="time-seg"><span class="seg-dot prep"></span>${dish.prep}m prep</span>` : ''}
        <span class="time-seg"><span class="seg-dot cook"></span>${dish.cook}m cook</span>
        ${dish.rest > 0 ? `<span class="time-seg"><span class="seg-dot rest"></span>${dish.rest}m rest</span>` : ''}
      </div>
      <div class="dish-start-time">Start ${startStr}</div>
      <div class="dish-actions">
        <button class="btn-icon" data-action="edit" data-id="${dish.id}" title="Edit">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 10 L9 3 L11 5 L4 12 Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
            <path d="M9 3 L11 1 L13 3 L11 5 Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
            <line x1="2" y1="12" x2="4" y2="12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
        </button>
        <button class="btn-icon danger" data-action="delete" data-id="${dish.id}" title="Remove">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5 L11 5 L10 12 L4 12 Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
            <line x1="1" y1="3" x2="13" y2="3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            <path d="M5 3 L5 1 L9 1 L9 3" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `;
    list.appendChild(card);
  }

  // Bind action buttons
  list.querySelectorAll('[data-action="edit"]').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(btn.dataset.id));
  });
  list.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', () => deleteDish(btn.dataset.id));
  });

  renderSetupTimeline();
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ============================================================
// MODAL
// ============================================================

function openAddModal() {
  editingId = null;
  document.getElementById('modal-title').textContent = 'Add dish';
  document.getElementById('dish-name').value = '';
  document.getElementById('dish-prep').value = '0';
  document.getElementById('dish-cook').value = '30';
  document.getElementById('dish-rest').value = '0';
  document.getElementById('dish-notes').value = '';
  setActiveCategory('protein');
  document.getElementById('dish-modal').classList.remove('hidden');
  setTimeout(() => document.getElementById('dish-name').focus(), 100);
}

function openEditModal(id) {
  const dish = dishes.find(d => d.id === id);
  if (!dish) return;
  editingId = id;
  document.getElementById('modal-title').textContent = 'Edit dish';
  document.getElementById('dish-name').value = dish.name;
  document.getElementById('dish-prep').value = dish.prep;
  document.getElementById('dish-cook').value = dish.cook;
  document.getElementById('dish-rest').value = dish.rest;
  document.getElementById('dish-notes').value = dish.notes || '';
  setActiveCategory(dish.cat || 'protein');
  document.getElementById('dish-modal').classList.remove('hidden');
  setTimeout(() => document.getElementById('dish-name').focus(), 100);
}

function closeModal() {
  document.getElementById('dish-modal').classList.add('hidden');
  editingId = null;
}

function setActiveCategory(cat) {
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === cat);
  });
}

function getActiveCategory() {
  const active = document.querySelector('.cat-btn.active');
  return active ? active.dataset.cat : 'other';
}

function saveDish() {
  const name = document.getElementById('dish-name').value.trim();
  if (!name) {
    showToast('Please enter a dish name');
    document.getElementById('dish-name').focus();
    return;
  }

  const prep = Math.max(0, parseInt(document.getElementById('dish-prep').value) || 0);
  const cook = Math.max(0, parseInt(document.getElementById('dish-cook').value) || 0);
  const rest = Math.max(0, parseInt(document.getElementById('dish-rest').value) || 0);
  const notes = document.getElementById('dish-notes').value.trim();
  const cat = getActiveCategory();

  if (cook === 0 && prep === 0) {
    showToast('Please enter at least a cook or prep time');
    return;
  }

  if (editingId) {
    const idx = dishes.findIndex(d => d.id === editingId);
    if (idx !== -1) {
      dishes[idx] = { ...dishes[idx], name, prep, cook, rest, notes, cat };
    }
  } else {
    dishes.push({ id: generateId(), name, prep, cook, rest, notes, cat });
  }

  closeModal();
  renderDishList();
  persist();
}

function deleteDish(id) {
  dishes = dishes.filter(d => d.id !== id);
  renderDishList();
  persist();
}

function applyPreset(preset) {
  document.getElementById('dish-name').value = preset.name;
  document.getElementById('dish-prep').value = preset.prep;
  document.getElementById('dish-cook').value = preset.cook;
  document.getElementById('dish-rest').value = preset.rest;
  setActiveCategory(preset.cat);
}

// ============================================================
// PRESETS GRID
// ============================================================

function renderPresets() {
  const grid = document.getElementById('presets-grid');
  grid.innerHTML = '';
  PRESETS.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'preset-btn';
    btn.textContent = p.name;
    btn.addEventListener('click', () => applyPreset(p));
    grid.appendChild(btn);
  });
}

// ============================================================
// SERVICE MODE
// ============================================================

function startService() {
  const serveMin = getServeMinutes();
  if (!serveMin || dishes.length === 0) return;

  const scheduled = scheduleDishes(serveMin);
  const actions = buildActions(scheduled);

  // Switch views
  document.getElementById('setup-view').classList.remove('active');
  document.getElementById('service-view').classList.add('active');

  // Render service timeline
  renderServiceTimeline(scheduled, serveMin);

  // Track completed actions
  const completed = new Set();

  function tick() {
    const now = nowMinutes();
    const nowStr = (() => {
      const d = new Date();
      const h = d.getHours() % 12 || 12;
      const m = String(d.getMinutes()).padStart(2, '0');
      const period = d.getHours() < 12 ? 'AM' : 'PM';
      return `${h}:${m} ${period}`;
    })();

    document.getElementById('service-clock').textContent = nowStr;

    const diffToServe = serveMin - now;
    if (diffToServe > 0) {
      document.getElementById('service-countdown').textContent = formatDelta(diffToServe) + ' until dinner';
    } else if (diffToServe === 0) {
      document.getElementById('service-countdown').textContent = '🍽 Time to serve!';
    } else {
      document.getElementById('service-countdown').textContent = `${formatDelta(diffToServe)} — dinner served`;
    }

    // Update playhead
    updatePlayhead(scheduled, serveMin, now);

    // Update service row statuses
    updateServiceStatuses(scheduled, serveMin, now);

    // Render action queue
    renderActionQueue(actions, now, completed);
  }

  tick();
  serviceInterval = setInterval(tick, 10000);
}

function stopService() {
  if (serviceInterval) {
    clearInterval(serviceInterval);
    serviceInterval = null;
  }
  document.getElementById('service-view').classList.remove('active');
  document.getElementById('setup-view').classList.add('active');
}

function renderServiceTimeline(scheduled, serveMin) {
  const container = document.getElementById('service-timeline');
  container.innerHTML = '';

  const earliestStart = Math.min(...scheduled.map(d => d.startMin));
  const span = serveMin - earliestStart;
  const padLeft = 0.02 * span;
  const totalSpan = span + padLeft;

  for (const dish of scheduled) {
    const row = document.createElement('div');
    row.className = 'service-timeline-row';
    row.dataset.dishId = dish.id;

    const lbl = document.createElement('div');
    lbl.className = 'stl-label';
    lbl.textContent = dish.name.length > 18 ? dish.name.slice(0, 16) + '…' : dish.name;
    row.appendChild(lbl);

    const barArea = document.createElement('div');
    barArea.className = 'stl-bar-area';

    const leftPct = ((dish.startMin - (earliestStart - padLeft)) / totalSpan) * 100;
    const widthPct = (dish.totalMin / totalSpan) * 100;

    const bar = document.createElement('div');
    bar.className = 'stl-bar';
    bar.style.left = leftPct + '%';
    bar.style.width = widthPct + '%';

    if (dish.prep > 0) {
      const el = document.createElement('div');
      el.className = 'bar-prep';
      el.style.width = (dish.prep / dish.totalMin * 100) + '%';
      bar.appendChild(el);
    }
    if (dish.cook > 0) {
      const el = document.createElement('div');
      el.className = 'bar-cook';
      el.style.width = (dish.cook / dish.totalMin * 100) + '%';
      bar.appendChild(el);
    }
    if (dish.rest > 0) {
      const el = document.createElement('div');
      el.className = 'bar-rest';
      el.style.width = (dish.rest / dish.totalMin * 100) + '%';
      bar.appendChild(el);
    }

    barArea.appendChild(bar);
    row.appendChild(barArea);

    const status = document.createElement('div');
    status.className = 'stl-status';
    status.dataset.dishId = dish.id;
    status.innerHTML = '<span class="status-badge pending">Pending</span>';
    row.appendChild(status);

    container.appendChild(row);
  }

  // Store for playhead
  window._serviceScheduled = { scheduled, serveMin, earliestStart, totalSpan, padLeft };
}

function updatePlayhead(scheduled, serveMin, nowMin) {
  const track = document.getElementById('timeline-now-track');
  const playhead = document.getElementById('timeline-playhead');
  if (!window._serviceScheduled) return;

  const { earliestStart, totalSpan, padLeft } = window._serviceScheduled;

  const leftPct = ((nowMin - (earliestStart - padLeft)) / totalSpan) * 100;
  if (leftPct >= 0 && leftPct <= 100) {
    playhead.style.left = leftPct + '%';
    playhead.style.opacity = '1';
  } else {
    playhead.style.opacity = '0';
  }
}

function updateServiceStatuses(scheduled, serveMin, now) {
  for (const dish of scheduled) {
    const el = document.querySelector(`.stl-status[data-dish-id="${dish.id}"]`);
    if (!el) continue;

    let badge, text;
    if (now < dish.startMin) {
      badge = 'pending'; text = minutesToTimeStr(dish.startMin);
    } else if (now >= dish.startMin && now < dish.cookStartMin && dish.prep > 0) {
      badge = 'active'; text = 'PREPPING';
    } else if (now >= dish.cookStartMin && now < dish.restStartMin) {
      badge = 'cooking'; text = 'COOKING';
    } else if (now >= dish.restStartMin && now < dish.endMin && dish.rest > 0) {
      badge = 'resting'; text = 'RESTING';
    } else if (now >= dish.endMin) {
      badge = 'done'; text = 'READY';
    }

    el.innerHTML = `<span class="status-badge ${badge}">${text}</span>`;
  }
}

function renderActionQueue(actions, now, completed) {
  const list = document.getElementById('action-list');
  const completedListEl = document.getElementById('completed-list');
  const completedLog = document.getElementById('completed-log');

  // Auto-complete past actions
  actions.forEach(a => {
    if (a.time <= now - 1 && !a.isServe) {
      completed.add(a.time + a.dish + a.verb);
    }
  });

  const pending = actions.filter(a => !completed.has(a.time + a.dish + a.verb));
  const done = actions.filter(a => completed.has(a.time + a.dish + a.verb));

  list.innerHTML = '';

  if (pending.length === 0) {
    list.innerHTML = '<div class="action-item"><div class="action-content"><div class="action-dish">All done! 🍽</div></div></div>';
  }

  pending.slice(0, 5).forEach((action, idx) => {
    const item = document.createElement('div');
    item.className = 'action-item';

    const diffMins = action.time - now;
    if (diffMins <= 2 && diffMins > -5) item.classList.add('urgent');
    if (idx === 0 && diffMins <= 15) item.classList.add('active');

    const deltaText = formatDelta(diffMins);

    item.innerHTML = `
      <div class="action-time">${minutesToTimeStr(action.time)}</div>
      <div class="action-content">
        <div class="action-verb">${action.verb}</div>
        <div class="action-dish">${escapeHtml(action.dish)}</div>
        ${action.notes ? `<div class="action-notes">${escapeHtml(action.notes)}</div>` : ''}
      </div>
      <div class="action-delta">${deltaText}</div>
    `;
    list.appendChild(item);
  });

  // Completed
  if (done.length > 0) {
    completedLog.classList.remove('hidden');
    completedListEl.innerHTML = done.reverse().slice(0, 5).map(a => `
      <div class="completed-item">
        <div class="completed-check"></div>
        <div class="completed-dish-name">${escapeHtml(a.verb)} — ${escapeHtml(a.dish)}</div>
        <div class="completed-at">${minutesToTimeStr(a.time)}</div>
      </div>
    `).join('');
  } else {
    completedLog.classList.add('hidden');
  }
}

// ============================================================
// PERSISTENCE
// ============================================================

function persist() {
  try {
    localStorage.setItem('mise_dishes', JSON.stringify(dishes));
    const serveInput = document.getElementById('serve-time');
    if (serveInput) localStorage.setItem('mise_serve_time', serveInput.value);
  } catch(e) {}
}

function restore() {
  try {
    const d = localStorage.getItem('mise_dishes');
    if (d) dishes = JSON.parse(d);
    const t = localStorage.getItem('mise_serve_time');
    const serveInput = document.getElementById('serve-time');
    if (t && serveInput) serveInput.value = t;
  } catch(e) {}
}

// ============================================================
// INIT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  restore();
  renderPresets();
  renderDishList();

  // Add dish button
  document.getElementById('add-dish-btn').addEventListener('click', openAddModal);

  // Serve time change
  document.getElementById('serve-time').addEventListener('change', () => {
    renderDishList();
    persist();
  });

  // Modal
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
  document.getElementById('modal-save-btn').addEventListener('click', saveDish);

  // Category buttons
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => setActiveCategory(btn.dataset.cat));
  });

  // Close modal on overlay click
  document.getElementById('dish-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('dish-modal')) closeModal();
  });

  // Enter in name field saves
  document.getElementById('dish-name').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveDish();
  });

  // Service mode
  document.getElementById('start-service-btn').addEventListener('click', startService);
  document.getElementById('exit-service-btn').addEventListener('click', stopService);

  // Keyboard: Escape closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!document.getElementById('dish-modal').classList.contains('hidden')) {
        closeModal();
      }
    }
  });
});
