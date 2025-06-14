const { eventBus } = require('../utils/eventBus.js');
const memory = require('../core/memory.js');
const { stateManager } = require('../core/stateManager.js');

// Aura tints per persona
const auraColors = {
  invocation: 'rgba(135, 240, 255, 0.28)',
  naming: 'rgba(163, 255, 185, 0.28)',
  threshold: 'rgba(255, 191, 129, 0.28)',
  absence: 'rgba(204, 204, 204, 0.28)',
  quiet: 'rgba(187, 187, 187, 0.28)'
};

let interacted = false;
function markInteracted() { interacted = true; }

function adapt({ echo, prev, tide }) {
  if (typeof document === 'undefined' || !echo) return;
  const { hour, silence } = echo;
  document.body.dataset.echoHour = hour;
  const aura = document.getElementById('personaAura');
  if (aura && interacted) {
    aura.style.backgroundColor = auraColors[stateManager.name()] || auraColors.invocation;
  }

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
    if (existing.length >= 3) {
      existing[0].classList.add('fade-out');
      setTimeout(() => existing[0].remove(), 300);
    }
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
