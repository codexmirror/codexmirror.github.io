const { loadProfile } = require('./core/memory.js');
const { stateManager, registerPersona } = require('./core/stateManager.js');
const { composeWhisper } = require('./core/responseLoop.js');
const { dream } = require('./personas/dream.js');
const { watcher } = require('./personas/watcher.js');
const { archive } = require('./personas/archive.js');

registerPersona('dream', dream);
registerPersona('watcher', watcher);
registerPersona('archive', archive);

function startWhisperEngine() {
  const profile = loadProfile();
  stateManager.init(profile);
  composeWhisper();
}
module.exports = { startWhisperEngine };
