const { loadProfile } = require('./core/memory.js');
const { stateManager, registerPersona } = require('./core/stateManager.js');
const { composeWhisper } = require('./core/responseLoop.js');
const { dream } = require('./personas/dream.js');
const { watcher } = require('./personas/watcher.js');
const { archive } = require('./personas/archive.js');
const { parasite } = require('./personas/parasite.js');
const { collapse } = require('./personas/collapse.js');
const { initInterface } = require('../interface/index.js');

registerPersona('dream', dream);
registerPersona('watcher', watcher);
registerPersona('archive', archive);
registerPersona('parasite', parasite);
registerPersona('collapse', collapse);

let intervalId = null;
let started = false;

function startWhisperEngine(interval = 15000) {
  if (started) return;
  started = true;
  const profile = loadProfile();
  stateManager.init(profile);
  initInterface();
  composeWhisper();
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
    composeWhisper();
  }, interval);
}

function stopWhisperEngine() {
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
  started = false;
}

module.exports = { startWhisperEngine, stopWhisperEngine };
