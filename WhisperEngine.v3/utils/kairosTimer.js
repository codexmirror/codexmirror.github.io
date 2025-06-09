const { eventBus } = require('./eventBus.js');
let timer = null;

function startSilence(duration = 3000) {
  clearTimeout(timer);
  eventBus.emit('silence:start');
  timer = setTimeout(() => eventBus.emit('silence:end'), duration);
}

module.exports = { startSilence };
