const loops = require('../core/loops');
const { composeWhisper } = require('../core/responseLoop');
async function dispatchLoop(script, immediate = true) {
  for (const step of script) {
    if (loops[step.loop]) {
      loops[step.loop].trigger({}, step.success !== false);
      if (immediate) composeWhisper(step.loop, step.success !== false);
    }
  }
  if (!immediate) {
    const last = script[script.length - 1];
    composeWhisper(last.loop, last.success !== false);
  }
}
module.exports = { dispatchLoop };
