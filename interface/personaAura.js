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
}

module.exports = { init, getCurrent: () => current };
