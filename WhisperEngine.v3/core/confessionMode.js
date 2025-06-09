const { eventBus } = require('../utils/eventBus.js');
let active = false;
function open(text) {
  if (active) return; 
  active = true;
  eventBus.emit('confession:open', { text });
  if (typeof document !== 'undefined') {
    const div = document.createElement('div');
    div.id = 'glyph-confession';
    div.className = 'confession';
    div.textContent = text;
    document.body.appendChild(div);
  }
}
function close() {
  if (!active) return;
  active = false;
  eventBus.emit('confession:close');
  if (typeof document !== 'undefined') {
    const div = document.getElementById('glyph-confession');
    if (div) div.remove();
  }
}
function isActive() { return active; }
module.exports = { open, close, isActive };
