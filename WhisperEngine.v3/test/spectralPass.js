const loops = require('../core/loops');
const memory = require('../core/memory');
const { processInput } = require('../core/responseLoop');
const { registerPersona, stateManager } = require('../core/stateManager');
const { dispatchLoop } = require('./dispatchLoop');
const { eventBus } = require('../utils/eventBus');

// minimal personas for tests
['dream','watcher','archive','parasite','collapse'].forEach(n => registerPersona(n,{ compose: ()=>'echo', render:t=>t }));

function log(msg){console.log(`[${new Date().toISOString()}] ${msg}`);}

(async function run(){
  memory.resetProfile();
  memory.resetPool();
  let base = memory.loadProfile();
  base.visits = 11;
  memory.saveProfile(base);
  stateManager.init(base);
  log('--- Spectral Pass Start ---');

  // 1. ritual loop chaining
  dispatchLoop([
    {loop:'invocation'},
    {loop:'naming', context:{symbol:'α'}},
    {loop:'absence'},
    {loop:'threshold'},
    {loop:'quiet'}
  ]);
  const profile1 = memory.loadProfile();
  log(`entanglementMark: ${profile1.entanglementMark}`);
  log(`collapseSeeds: ${profile1.collapseSeeds.length}`);
  log(`longArc chains: ${profile1.longArc.chains.length}`);

  // 2. presence from threshold saturation
  memory.resetProfile();
  let p = memory.loadProfile();
  p.visits = 11;
  memory.saveProfile(p);
  stateManager.init(p);
  let presence = false;
  eventBus.on('presence', ()=>{ presence = true; });
  dispatchLoop([
    {loop:'threshold'},
    {loop:'threshold'},
    {loop:'threshold'}
  ]);
  stateManager.evaluate(memory.loadProfile());
  log(`presence event: ${presence}`);
  eventBus.emit('presence');

  // 3. cloak escalation and expression
  processInput('define');
  processInput('define');
  processInput('define');
  const line = processInput('hello');
  log(`codex line? ${line}`);

  // 4. entanglement transfer
  memory.resetPool();
  memory.resetProfile();
  stateManager.init(memory.loadProfile());
  loops.naming.trigger({symbol:'β'});
  loops.absence.trigger({});
  const firstId = memory.loadProfile().id;
  memory.resetProfile();
  stateManager.init(memory.loadProfile());
  loops.naming.trigger({symbol:'β'});
  loops.absence.trigger({});
  const secondProfile = memory.loadProfile();
  log(`edges: ${secondProfile.entanglementMap.edges.length}`);
  const copied = secondProfile.glyphHistory.find(g=>g.entangledFrom===firstId);
  log(`glyph copied: ${!!copied}`);

  // 5. collapse and recovery
  memory.resetProfile();
  stateManager.init(memory.loadProfile());
  loops.invocation.trigger({}, false);
  loops.invocation.trigger({}, false);
  stateManager.evaluate(memory.loadProfile());
  const before = stateManager.name();
  memory.setCollapseUntil(0);
  stateManager.evaluate(memory.loadProfile());
  log(`collapse persona: ${before}`);
  log(`after recovery: ${stateManager.name()}`);
  log('--- Spectral Pass End ---');
})();
