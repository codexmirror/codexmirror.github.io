const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');

function init() {
  ['invocation','absence','naming','threshold','quiet'].forEach(name => {
    eventBus.on(`loop:${name}`, () => {
      console.log(`[ritualBar] ${name} triggered`);
    });
  });
}

module.exports = { init };
