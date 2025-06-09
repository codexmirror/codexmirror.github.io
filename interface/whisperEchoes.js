const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');
const { applyCloak } = require('../WhisperEngine.v3/utils/cloak.js');
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
  setTimeout(() => span.classList.add('fade'), 4000);
}

function init() {
  stream = typeof document !== 'undefined' ? document.getElementById('whisperStream') : null;
  eventBus.on('whisper', evt => append(evt.text, evt.level));
  eventBus.on('codex:expression', evt => append(evt.text, evt.level, true));
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
    inp.addEventListener('input', e => {
      memory.incrementSpore();
      e.target.value = applyCloak(e.target.value, 1);
    });
  });
}

module.exports = { init, echoes, setDiagnostic, snapshots };
