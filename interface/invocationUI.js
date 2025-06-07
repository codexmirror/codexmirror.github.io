const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');

function init() {
  eventBus.on('entity:summon', ({ name }) => {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.entity-card.summoned').forEach(card => {
      const show = card.id.includes(name.toLowerCase());
      card.classList.toggle('hidden', !show);
    });
  });
}

module.exports = { init };
