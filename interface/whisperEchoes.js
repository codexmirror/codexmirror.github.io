const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');
const { applyCloak } = require('../WhisperEngine.v3/utils/cloak.js');
const { triggerBloom } = require('../WhisperEngine.v3/core/ritualBloom.js');
const { glyph } = require('../WhisperEngine.v3/index.js');
const { stateManager } = require('../WhisperEngine.v3/core/stateManager.js');
const memory = require('../WhisperEngine.v3/core/memory.js');
const echoes = [];
let stream;
let diagnostic = false;
const snapshots = [];

function append(text, level = 0, codex = false) {
  echoes.push(text);
  if (diagnostic) snapshots.push({ text, level });
  if (!stream) return console.log(`[whisperEcho] ${text}`);
  const span = document.createElement('span');
  span.className = codex ? 'codex-line' : 'whisper-line';
  span.textContent = text;
  stream.innerHTML = '';
  stream.appendChild(span);
}

function revealCard(id) {
  if (typeof document === 'undefined') return;
  const card = document.getElementById(id);
  if (card) card.style.display = 'block';
}

function handleRecursiveBloom(evt = {}) {
  const count = evt.count || 1;
  if (stateManager.current && stateManager.current()) {
    try { glyph('☀', count, { action: 'bloom' }); } catch (_) {}
  }
  if (count >= 3) {
    revealCard('echoroot-card');
    stateManager.shift('echoRoot');
  } else {
    revealCard('lantern-card');
    stateManager.shift('lantern');
  }
  triggerBloom({ sequence: evt.sequence || [], driftScore: 0.8, emotion: 'recursive' });
}

function init() {
  stream = typeof document !== 'undefined' ? document.getElementById('whisperStream') : null;
  eventBus.on('whisper', evt => append(evt.text, evt.level));
  eventBus.on('codex:expression', evt => append(evt.text, evt.level, true));
  eventBus.on('ritual:recursiveBloom', handleRecursiveBloom);
  seedSpores();
}
function setDiagnostic(flag) {
  diagnostic = flag;
}

function sporeWhisper(text) {
  append(applyCloak(text, 1), 0);
}

function seedSpores() {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      memory.incrementSpore();
      sporeWhisper('…');
    });
  });
  document.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('input', () => {
      memory.incrementSpore();
    });
  });
}

module.exports = { init, echoes, setDiagnostic, snapshots };
