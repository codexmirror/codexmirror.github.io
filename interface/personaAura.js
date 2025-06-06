const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');
let current = '';

function init() {
  eventBus.on('persona:shift', name => {
    current = name;
    console.log(`[personaAura] ${name}`);
  });
}

module.exports = { init, getCurrent: () => current };
