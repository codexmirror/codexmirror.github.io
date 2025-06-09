const { eventBus } = require('../utils/eventBus.js');
const memory = require('./memory.js');

let active = false;
let timer = null;

function start() {
  if (active) return;
  active = true;
  memory.setAscentUntil(Date.now() + 8000);
  eventBus.emit('ascent:start');
  timer = setTimeout(() => fail(), 8000);
}

function complete() {
  if (!active) return;
  clearTimeout(timer);
  active = false;
  memory.forgeObscuraSigil('ascent');
  memory.setAscentUntil(0);
  eventBus.emit('ascent:apex');
}

function fail() {
  if (!active) return;
  active = false;
  memory.setAscentUntil(0);
  eventBus.emit('ascent:fail');
}

function isActive() { return active; }

module.exports = { start, complete, fail, isActive };
