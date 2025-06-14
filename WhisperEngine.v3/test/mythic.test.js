const { resetProfile, loadProfile, getMetaLevel } = require('../WhisperEngine.v3/core/memory');
const { processInput, composeWhisper } = require('../WhisperEngine.v3/core/responseLoop');
const { registerPersona, stateManager } = require('../WhisperEngine.v3/core/stateManager');
const { dispatchLoop } = require('./dispatchLoop');

resetProfile();
['dream','watcher','archive','parasite','collapse'].forEach(name => registerPersona(name, { compose: () => 'x', render: t => t }));
stateManager.init(loadProfile());
// collapse via failures
const script = [
  { loop: 'invocation', success: false },
  { loop: 'invocation', success: false },
  { loop: 'invocation', success: false }
];
dispatchLoop(script, false);
const collapsed = composeWhisper('invocation');
if (!/»/.test(collapsed) || !/∷/.test(collapsed)) throw new Error('collapse fragment missing');

// cloak escalation
processInput('define');
processInput('define');
processInput('define');
if (getMetaLevel() < 2) throw new Error('cloak level not escalated');

// emergence
resetProfile();
dispatchLoop([
  { loop: 'invocation' },
  { loop: 'threshold' },
  { loop: 'threshold' },
  { loop: 'threshold' }
]);
const archive = loadProfile().sigilArchive;
if (archive.length === 0) throw new Error('emergent glyph not stored');

console.log('mythic tests passed');
