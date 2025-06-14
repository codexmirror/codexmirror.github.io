const { eventBus } = require('../utils/eventBus.js');
let current = '';
let aura;
let activated = false;

function update(name) {
  current = name;
  if (!aura || !activated) return;
  requestAnimationFrame(() => {
    aura.setAttribute('data-persona', name);
    aura.textContent = name;
  });
}

function activate() {
  if (!activated) {
    activated = true;
    if (current) update(current);
  }
}

function init() {
  aura = typeof document !== 'undefined' ? document.getElementById('personaAura') : null;
  if (aura) aura.setAttribute('data-persona', 'neutral');
  eventBus.on('persona:shift', update);
  ['invocation','absence','naming','threshold','quiet','recursive'].forEach(l => {
    eventBus.on(`loop:${l}`, activate);
  });
  setTimeout(() => { if (!activated) activate(); }, 5000);
  eventBus.on('presence', () => {
    if (!aura || !activated) return;
    aura.classList.add('presence', 'pulse');
    setTimeout(() => aura.classList.remove('presence', 'pulse'), 2000);
  });
  eventBus.on('cloak:max', () => {
    if (!aura || !activated) return;
    aura.classList.add('cloak-max');
    setTimeout(() => aura.classList.remove('cloak-max'), 500);
  });
}

module.exports = { init, getCurrent: () => current };
