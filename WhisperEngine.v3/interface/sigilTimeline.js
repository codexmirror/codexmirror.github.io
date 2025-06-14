const { eventBus } = require('../utils/eventBus.js');
const timeline = [];
let container;

function addEntry(name) {
  timeline.push({ name, time: Date.now() });
  if (container) {
    const span = document.createElement('span');
    span.className = 'sigil-entry';
    span.textContent = name;
    container.appendChild(span);
  }
}

function init() {
  container = typeof document !== 'undefined' ? document.getElementById('sigilTimeline') : null;
  ['invocation', 'absence', 'naming', 'threshold', 'quiet'].forEach(name => {
    eventBus.on(`loop:${name}`, () => addEntry(name));
  });
}

module.exports = { init, timeline };
