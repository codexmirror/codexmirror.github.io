const STORE_KEY = 'ritualChronicle';

function logSequence(sequence) {
  if (typeof localStorage === 'undefined') return;
  const log = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
  log.push({ sequence, time: Date.now() });
  localStorage.setItem(STORE_KEY, JSON.stringify(log));
}

function logEntitySummon(name, sequence) {
  if (typeof localStorage === 'undefined') return;
  const log = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
  log.push({ type: 'entitySummon', name, sequence, time: Date.now() });
  localStorage.setItem(STORE_KEY, JSON.stringify(log));
}

function getRitualHistory() {
  if (typeof localStorage === 'undefined') return [];
  return JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
}

function renderChronicle(container) {
  const logs = getRitualHistory();
  if (!container) return logs;
  container.innerHTML = '';
  logs.slice(-20).forEach(entry => {
    const div = document.createElement('div');
    div.className = 'ritual-log-entry';
    div.textContent = entry.sequence.join(' ');
    container.appendChild(div);
  });
  return logs;
}

function spawnPhantom(containerId, level = 1) {
  if (typeof document === 'undefined') return;
  const logs = getRitualHistory();
  if (!logs.length) return;
  const entry = logs[Math.floor(Math.random() * logs.length)];
  const container = document.getElementById(containerId);
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'phantom-echo intensity-' + level;
  div.textContent = entry.sequence.join(' ');
  container.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

const api = { logSequence, logEntitySummon, getRitualHistory, renderChronicle, spawnPhantom };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') window.whisperLog = api;
