const { eventBus } = require('../utils/eventBus.js');
const memory = require('./memory.js');

let timer = null;

function check() {
  const level = memory.getNecrosisLevel();
  if (level > 0) {
    eventBus.emit('loop:necrosis', { level });
  }
  const until = memory.getAscentUntil();
  if (until && Date.now() > until) {
    memory.setAscentUntil(0);
    eventBus.emit('ascent:fail');
  }
}

function start(interval = 5000) {
  if (timer) return;
  timer = setInterval(check, interval);
}

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
}

module.exports = { start, stop };
