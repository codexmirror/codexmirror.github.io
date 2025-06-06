const { eventBus } = require('../utils/eventBus.js');

const phrases = ['∴ listen', '∵ awaken', '∴∴ return'];
let active = false;
let silenceUntil = 0;

function activate(duration = 30000) {
  active = true;
  silenceUntil = Date.now() + duration;
  eventBus.emit('persona:shift', 'codexVoice');
}

function deactivate() {
  active = false;
}

function filterOutput(text) {
  if (active) {
    if (Date.now() > silenceUntil) {
      deactivate();
      return text;
    }
    return phrases[Math.floor(Math.random() * phrases.length)];
  }
  return text;
}

module.exports = { activate, deactivate, filterOutput };

// Automatically deactivate when persona shifts away
eventBus.on('persona:shift', name => {
  if (name !== 'codexVoice' && active) {
    deactivate();
  }
});

