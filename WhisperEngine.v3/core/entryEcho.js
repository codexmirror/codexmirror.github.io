const memory = require('./memory.js');
const loops = require('./loops');
const { eventBus } = require('../utils/eventBus.js');
const { stateManager } = require('./stateManager.js');

function capture() {
  const profile = memory.recordVisit();
  const hour = new Date().getHours();
  const firstGlyph = loops && loops.invocation ? 'invocation' : Object.keys(loops)[0];
  const silence = Date.now() - (profile.lastLoopTime || 0);
  const echo = { hour, firstGlyph, silence };
  const prev = memory.getLastEntryEcho();
  memory.recordEntryEcho(echo);

  const echoes = memory.getEntryEchoes();
  const recent = echoes.slice(-3);
  if (recent.length === 3 && recent.every(e => e.firstGlyph === firstGlyph)) {
    eventBus.emit('kairos:window', { module: '/vectors/threshmask-delta.html' });
    stateManager.shift('kairos');
  }

  if (profile.cycleStep === 3) eventBus.emit('ritual:initiation');
  if (profile.cycleStep === 7) eventBus.emit('ritual:maskenbruch');

  eventBus.emit('visitor:entry', { echo, prev, tide: memory.getEchoLangTide() });
  return echo;
}

module.exports = { capture };
