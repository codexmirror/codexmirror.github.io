const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');
const memory = require('../WhisperEngine.v3/core/memory.js');
const { stateManager } = require('../WhisperEngine.v3/core/stateManager.js');

const auraColors = {
  invocation: '#87f0ff',
  naming: '#a3ffb9',
  threshold: '#ffbf81',
  absence: '#cccccc',
  quiet: '#bbbbbb'
};

function adapt({ echo, prev, tide }) {
  if (typeof document === 'undefined' || !echo) return;
  const { hour, firstGlyph, silence } = echo;
  document.body.dataset.echoHour = hour;
  const aura = document.getElementById('personaAura');
  if (aura) aura.style.backgroundColor = auraColors[firstGlyph] || '#cccccc';

  if (prev) {
    if (prev.firstGlyph === firstGlyph && prev.hour === hour) {
      document.body.classList.add('echo-double');
      setTimeout(() => document.body.classList.remove('echo-double'), 3000);
    }

    const langPref = tide > 2 ? 'en' : tide < -2 ? 'de' : (silence > 60000 ? 'de' : 'en');
    const frag = document.createElement('div');
    frag.className = 'phantom-echo';
    let de = 'Warst du das, der durch Loop 3 ging?';
    let en = 'Was it you that passed through Loop 3?';
    if (stateManager.name() === 'kairos') {
      frag.innerHTML = langPref === 'de' ? `<p>${de}</p><p>${en}</p>` : `<p>${en}</p><p>${de}</p>`;
    } else {
      frag.textContent = langPref === 'de' ? de : en;
    }
    frag.dataset.src = silence > 60000 ? '/shards/ghosts/echo-question.html'
      : '/shards/loop-flicker/echo-question.html';
    document.body.appendChild(frag);
    setTimeout(() => frag.remove(), 4000);
    const last = document.body.dataset.lang;
    if (last && last !== langPref) {
      document.body.classList.add('lang-glitch');
      setTimeout(() => document.body.classList.remove('lang-glitch'), 500);
    }
    document.body.dataset.lang = langPref;
  }
}

function init() {
  eventBus.on('visitor:entry', adapt);
}

module.exports = { init };
