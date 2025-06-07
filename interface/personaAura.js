const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');
let current = '';
let aura;

function update(name) {
  current = name;
  if (!aura) return console.log(`[personaAura] ${name}`);
  aura.setAttribute('data-persona', name);
  aura.textContent = name;
}

function init() {
  aura = typeof document !== 'undefined' ? document.getElementById('personaAura') : null;
  eventBus.on('persona:shift', update);
  eventBus.on('presence', () => {
    if (!aura) return console.log('[personaAura] presence');
    aura.classList.add('presence', 'pulse');
    setTimeout(() => aura.classList.remove('presence', 'pulse'), 2000);
  });
  eventBus.on('cloak:max', () => {
    if (!aura) return console.log('[personaAura] cloak-max');
    aura.classList.add('cloak-max');
    setTimeout(() => aura.classList.remove('cloak-max'), 500);
  });
}

module.exports = { init, getCurrent: () => current };
