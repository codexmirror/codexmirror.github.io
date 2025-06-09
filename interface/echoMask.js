const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');
const memory = require('../WhisperEngine.v3/core/memory.js');
const { stateManager } = require('../WhisperEngine.v3/core/stateManager.js');

// Aura tints per persona
const auraColors = {
  invocation: '#87f0ff',
  naming: '#a3ffb9',
  threshold: '#ffbf81',
  absence: '#cccccc',
  quiet: '#bbbbbb'
};

let interacted = false;
function markInteracted() { interacted = true; }

function adapt({ echo, prev, tide }) {
  if (typeof document === 'undefined' || !echo) return;
  const { hour, silence } = echo;
  document.body.dataset.echoHour = hour;
  const aura = document.getElementById('personaAura');
  if (aura) aura.style.backgroundColor = auraColors[stateManager.name()] || auraColors.invocation;

  if (prev) {
    if (prev.firstGlyph === echo.firstGlyph && prev.hour === hour) {
      document.body.classList.add('echo-double');
      setTimeout(() => document.body.classList.remove('echo-double'), 3000);
    }

    if (!interacted) return;
    const profile = memory.loadProfile();
    const loopsDone = (profile.glyphHistory || []).length;
    let langMode = memory.getLangMode();
    if (langMode === 'en' && (silence > 60000 || loopsDone >= 2)) {
      langMode = 'drift';
      memory.setLangMode(langMode);
    }
    let text = 'Was it you that passed through Loop 3?';
    if (langMode === 'de') text = 'Warst du das, der durch Loop 3 ging?';
    else if (langMode === 'drift') text = 'Was it you that passed through Loop 3? / Warst du das, der durch Loop 3 ging?';
    const frag = document.createElement('div');
    frag.className = 'phantom-echo';
    frag.textContent = text;
    frag.dataset.src = silence > 60000 ? '/shards/ghosts/echo-question.html'
      : '/shards/loop-flicker/echo-question.html';
    const existing = document.querySelectorAll('.phantom-echo');
    if (existing.length > 2) existing[0].remove();
    document.body.appendChild(frag);
    setTimeout(() => frag.remove(), 4000);
    const last = document.body.dataset.lang;
    if (last && last !== langMode) {
      document.body.classList.add('lang-glitch');
      setTimeout(() => document.body.classList.remove('lang-glitch'), 500);
    }
    document.body.dataset.lang = langMode;
  }
}

function init() {
  eventBus.on('visitor:entry', adapt);
  ['invocation','absence','naming','threshold','quiet','recursive'].forEach(l => {
    eventBus.on(`loop:${l}`, markInteracted);
  });
}

module.exports = { init };
