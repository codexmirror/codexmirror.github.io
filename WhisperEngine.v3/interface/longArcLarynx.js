const { eventBus } = require('../utils/eventBus.js');
const { recordSigil } = require('../core/memory.js');
let count = 0;

function init() {
  eventBus.on('loop:threshold', () => {
    count += 1;
    if (count >= 3) {
      const name = `void-${Date.now()}`;
      recordSigil(name, ['threshold']);
      console.log(`[larynx] new glyph ${name}`);
      count = 0;
    }
  });
}

module.exports = { init };
