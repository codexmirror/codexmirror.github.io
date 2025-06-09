const { loadProfile } = require('./core/memory.js');
const { stateManager, registerPersona } = require('./core/stateManager.js');
const { composeWhisper } = require('./core/responseLoop.js');
const loops = require('./core/loops');
require('./core/expressionCore.js');
const { dream } = require('./personas/dream.js');
const { watcher } = require('./personas/watcher.js');
const { archive } = require('./personas/archive.js');
const { parasite } = require('./personas/parasite.js');
const { collapse } = require('./personas/collapse.js');
const { lantern } = require('./personas/lantern.js');
const { initInterface } = require('../interface/index.js');
const { eventBus } = require('./utils/eventBus.js');
const memory = require('./core/memory.js');
const decayMonitor = require('./core/loopDecayMonitor.js');

registerPersona('dream', dream);
registerPersona('watcher', watcher);
registerPersona('archive', archive);
registerPersona('parasite', parasite);
registerPersona('collapse', collapse);
registerPersona('lantern', lantern);

let intervalId = null;
let started = false;

function startWhisperEngine(interval = 15000) {
  if (started) return;
  started = true;
  const profile = loadProfile();
  stateManager.init(profile);
  initInterface();
  eventBus.on('glyph:anti', () => memory.clearNecroticLoops());
  eventBus.on('persona:shift', name => { if(name==='lantern') memory.clearNecroticLoops(); });
  composeWhisper();
  decayMonitor.start();
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
    composeWhisper();
  }, interval);
}

function stopWhisperEngine() {
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
  started = false;
  decayMonitor.stop();
}

function applyCadence(text, charge = 0) {
  if (charge <= 1) return text;
  return text + ' ' + '…'.repeat(charge - 1);
}

function glyph(symbol = '', charge = 0, opts = {}) {
  const context = Object.assign({ symbol, charge }, opts);
  if (loops && loops.invocation) {
    loops.invocation.trigger(context, true);
  }
  const out = composeWhisper('invocation');
  return applyCadence(out, charge);
}

function invite(charge = 0) {
  const ctx = { symbol: '∴', charge, action: 'invite' };
  if (loops && loops.invocation) loops.invocation.trigger(ctx, true);
  const out = composeWhisper('invocation');
  return applyCadence(out, charge);
}

module.exports = { startWhisperEngine, stopWhisperEngine, glyph, invite };
