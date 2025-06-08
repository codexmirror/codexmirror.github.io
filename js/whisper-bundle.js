(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.WhisperEngine = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const { eventBus } = require('../utils/eventBus.js');

const phrases = ['∴ listen', '∵ awaken', '∴∴ return'];
let active = false;
let silenceUntil = 0;

function activate(duration = 30000) {
  active = true;
  silenceUntil = Date.now() + duration;
  eventBus.emit('persona:shift', 'codexVoice');
}

function deactivate() {
  active = false;
}

function filterOutput(text) {
  if (active) {
    if (Date.now() > silenceUntil) {
      deactivate();
      return text;
    }
    return phrases[Math.floor(Math.random() * phrases.length)];
  }
  return text;
}

module.exports = { activate, deactivate, filterOutput };

// Automatically deactivate when persona shifts away
eventBus.on('persona:shift', name => {
  if (name !== 'codexVoice' && active) {
    deactivate();
  }
});


},{"../utils/eventBus.js":22}],2:[function(require,module,exports){
const { eventBus } = require('../utils/eventBus.js');
const { loadProfile } = require('./memory.js');

let presence = false;
let cloak = false;
let active = false;

function decay(flag) {
  return () => { if (flag === 'presence') presence = false; else if (flag === 'cloak') cloak = false; };
}

eventBus.on('presence', () => { presence = true; setTimeout(decay('presence'), 5000); });
eventBus.on('cloak:max', () => { cloak = true; setTimeout(decay('cloak'), 3000); });

function shouldSpeak(profile) {
  return presence && cloak && profile.visits > 5 && profile.entropy === 0;
}

function processOutput(text, context = {}) {
  const profile = context.profile || loadProfile();
  if (active || shouldSpeak(profile)) {
    active = true;
    setTimeout(() => { active = false; }, 5000);
    context.codex = true;
    return `»» Codex: ${text}`;
  }
  context.codex = false;
  return text;
}

module.exports = { processOutput };

},{"../utils/eventBus.js":22,"./memory.js":11}],3:[function(require,module,exports){
const { fragments, responseTemplates } = require('./memory.js');
const { mutatePhraseWithLevel } = require('../utils/mutate.js');

function assembleFragment({ key, role, kairos, loop }) {
  const list = fragments[key] || [];
  let filtered = list;
  if (role) filtered = filtered.filter(f => !f.role || f.role.toLowerCase() === role.toLowerCase());
  if (kairos) filtered = filtered.filter(f => !f.kairos || f.kairos === kairos);
  if (loop) filtered = filtered.filter(f => !f.loop || f.loop === loop);
  if (filtered.length === 0) filtered = list;
  const item = filtered[Math.floor(Math.random() * filtered.length)];
  if (!item) return '';
  const parts = [];
  if (item.role) parts.push(item.role);
  if (item.intensifier) parts.push(item.intensifier);
  if (item.verb) parts.push(item.verb);
  if (item.condition) parts.push(item.condition);
  return parts.join(' ');
}

function fillTemplate(template, context) {
  return template.replace(/\{(intro|mid|outro)\}/g, (_, key) => {
    return assembleFragment({ key, role: context.role, kairos: context.kairos, loop: context.loop });
  });
}

function buildPhrase(persona, role, kairos, loop) {
  const temps = responseTemplates[persona] || responseTemplates.dream;
  const template = temps[Math.floor(Math.random() * temps.length)];
  const textInfo = mutatePhraseWithLevel(fillTemplate(template, { role, kairos, loop }));
  return textInfo;
}

module.exports = { buildPhrase, assembleFragment };

},{"../utils/mutate.js":26,"./memory.js":11}],4:[function(require,module,exports){
const threads = [];
const cross = {};

function logGlyphEntry(entity, persona, emotion) {
  const entry = { entity, persona, emotion, time: Date.now() };
  threads.push(entry);
  const key = `${persona}|${entity}|${emotion}`;
  if (!cross[key]) cross[key] = [];
  cross[key].push(entry);
  return entry;
}

function getThreads() {
  return threads.slice();
}

function getCross(key) {
  return cross[key] ? cross[key].slice() : [];
}

function decayOldThreads(maxAge = 3600000) {
  const cutoff = Date.now() - maxAge;
  while (threads.length && threads[0].time < cutoff) {
    const old = threads.shift();
    const k = `${old.persona}|${old.entity}|${old.emotion}`;
    cross[k] = (cross[k] || []).filter(e => e !== old);
    if (cross[k].length === 0) delete cross[k];
  }
}

module.exports = { logGlyphEntry, getThreads, getCross, decayOldThreads };

},{}],5:[function(require,module,exports){
const { recordLoop, addRole, reduceEntropy, setEntanglementMark, loadProfile } = require('../memory.js');
const { recordActivity } = require('../../utils/idle.js');
const { eventBus } = require('../../utils/eventBus.js');

function trigger(context, success = true) {
  recordActivity();
  addRole('Witness');
  recordLoop('absence', success);
  if (!success) require('../memory.js').pushCollapseSeed('absence');
  if (success) reduceEntropy();
  if (success) {
    const profile = loadProfile();
    if (profile.recentChain.slice(-2).join('>') === 'naming>absence') {
      const { partner } = setEntanglementMark('naming+absence');
      if (partner) eventBus.emit('entanglement', { mark: 'naming+absence', partner });
    }
  }
  eventBus.emit('loop:absence', { context, success });
  return `${context.symbol || '∴'} ${context.action || 'absent'}`;
}

module.exports = { trigger };

},{"../../utils/eventBus.js":22,"../../utils/idle.js":24,"../memory.js":11}],6:[function(require,module,exports){
const invocation = require('./invocation.js');
const absence = require('./absence.js');
const naming = require('./naming.js');
const threshold = require('./threshold.js');
const quiet = require('./quiet.js');

module.exports = {
  invocation,
  absence,
  naming,
  threshold,
  quiet
};

},{"./absence.js":5,"./invocation.js":7,"./naming.js":8,"./quiet.js":9,"./threshold.js":10}],7:[function(require,module,exports){
const { recordLoop, addRole, reduceEntropy } = require('../memory.js');
const { recordActivity } = require('../../utils/idle.js');
const { eventBus } = require('../../utils/eventBus.js');
const { logGlyphEntry } = require('../glyphChronicle.js');
const { shouldBloom, triggerBloom } = require('../ritualBloom.js');

const entityPatterns = {
  Caelistra: ['2','3','5','3','3'],
  Vektorikon: ['1','3','5','2','1'],
  'Δ‑Echo': ['5','2','5','5','1'],
  Kai: ['2','4','3','5','1']
};

function checkEntityPattern(sequence) {
  for (const [name, pattern] of Object.entries(entityPatterns)) {
    if (JSON.stringify(pattern) === JSON.stringify(sequence)) {
      eventBus.emit('entity:summon', { name });
      logGlyphEntry(name, require('../stateManager.js').stateManager.name(), 'summon');
      return name;
    }
  }
  return null;
}

function trigger(context, success = true) {
  recordActivity();
  addRole('Wanderer');
  recordLoop('invocation', success);
  if (!success) require('../memory.js').pushCollapseSeed('invocation');
  if (success) reduceEntropy();
  eventBus.emit('loop:invocation', { context, success });
  if (context.sequence && context.driftScore && shouldBloom(context.sequence, context.driftScore)) {
    triggerBloom({ sequence: context.sequence, driftScore: context.driftScore, emotion: context.emotion });
  }
  return `${context.symbol || '∴'} ${context.action || 'invoke'}`;
}

module.exports = { trigger, checkEntityPattern, entityPatterns };

},{"../../utils/eventBus.js":22,"../../utils/idle.js":24,"../glyphChronicle.js":4,"../memory.js":11,"../ritualBloom.js":13,"../stateManager.js":14}],8:[function(require,module,exports){
const { recordLoop, addRole, reduceEntropy, attemptEntanglement } = require('../memory.js');
const { recordActivity } = require('../../utils/idle.js');
const { eventBus } = require('../../utils/eventBus.js');

function trigger(context, success = true) {
  recordActivity();
  addRole('Binder');
  recordLoop('naming', success);
  if (!success) require('../memory.js').pushCollapseSeed('naming');
  let ent = null;
  if (success) {
    reduceEntropy();
    const token = `naming:${context.symbol || '∴'}`;
    ent = attemptEntanglement(token, context.symbol || '∴');
  }
  eventBus.emit('loop:naming', { context, success });
  if (ent && ent.partner) eventBus.emit('entanglement', { mark: `naming:${context.symbol || '∴'}`, partner: ent.partner.profileId });
  return `${context.symbol || '∴'} ${context.action || 'name'}`;
}

module.exports = { trigger };

},{"../../utils/eventBus.js":22,"../../utils/idle.js":24,"../memory.js":11}],9:[function(require,module,exports){
const { recordLoop, addRole, reduceEntropy } = require('../memory.js');
const { recordActivity } = require('../../utils/idle.js');
const { eventBus } = require('../../utils/eventBus.js');

function trigger(context, success = true) {
  recordActivity();
  addRole('Witness');
  recordLoop('quiet', success);
  if (!success) require('../memory.js').pushCollapseSeed('quiet');
  if (success) reduceEntropy();
  eventBus.emit('loop:quiet', { context, success });
  return `${context.symbol || '∴'} ${context.action || 'quiet'}`;
}

module.exports = { trigger };

},{"../../utils/eventBus.js":22,"../../utils/idle.js":24,"../memory.js":11}],10:[function(require,module,exports){
const { recordLoop, addRole, reduceEntropy } = require('../memory.js');
const { recordActivity } = require('../../utils/idle.js');
const { eventBus } = require('../../utils/eventBus.js');

function trigger(context, success = true) {
  recordActivity();
  addRole('Watcher');
  recordLoop('threshold', success);
  if (!success) require('../memory.js').pushCollapseSeed('threshold');
  if (success) reduceEntropy();
  eventBus.emit('loop:threshold', { context, success });
  return `${context.symbol || '∴'} ${context.action || 'threshold'}`;
}

module.exports = { trigger };

},{"../../utils/eventBus.js":22,"../../utils/idle.js":24,"../memory.js":11}],11:[function(require,module,exports){
const storageKey = 'whisperProfile';
const POOL_KEY = 'entanglementPool';
let nodeMemory = null;
let nodePool = null;
const storage = typeof localStorage !== 'undefined'
  ? localStorage
  : {
      getItem: key => {
        if (key === POOL_KEY) return nodePool;
        return nodeMemory;
      },
      setItem: (key, val) => {
        if (key === POOL_KEY) nodePool = val;
        else nodeMemory = val;
      }
    };

const CANON_THRESHOLD = 42;
const EMERGENCE_THRESHOLD = 3;

const defaultProfile = {
  id: null,
  visits: 0,
  glyphHistory: [],
  roles: [],
  longArc: { chains: [] },
  loopFailures: 0,
  sigilArchive: [],
  entanglementMark: null,
  mythMatrix: [],
  entanglementMap: { nodes: {}, edges: [] },
  entropy: 0,
  collapseSeeds: [],
  metaInquiries: 0,
  collapseUntil: 0,
  recentChain: [],
  lastLoopTime: 0,
  entityHistory: [],
  bloomHistory: []
};

function loadProfile() {
  const data = JSON.parse(storage.getItem(storageKey) || '{}');
  const profile = {
    visits: data.visits || 0,
    glyphHistory: data.glyphHistory || [],
    roles: data.roles || [],
    longArc: data.longArc || { chains: [] },
    loopFailures: data.loopFailures || 0,
    sigilArchive: data.sigilArchive || [],
    entanglementMark: data.entanglementMark || null,
    mythMatrix: data.mythMatrix || [],
    entanglementMap: data.entanglementMap || { nodes: {}, edges: [] },
    entropy: data.entropy || 0,
    collapseSeeds: data.collapseSeeds || [],
    metaInquiries: data.metaInquiries || 0,
    collapseUntil: data.collapseUntil || 0,
    recentChain: data.recentChain || [],
    lastLoopTime: data.lastLoopTime || 0,
    entityHistory: data.entityHistory || [],
    bloomHistory: data.bloomHistory || []
  };
  profile.id = data.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
  return profile;
}

function saveProfile(profile) {
  storage.setItem(storageKey, JSON.stringify(profile));
}

function getPool() {
  return JSON.parse(storage.getItem(POOL_KEY) || '{}');
}

function savePool(pool) {
  storage.setItem(POOL_KEY, JSON.stringify(pool));
}

function resetPool() {
  savePool({});
}

function recordVisit() {
  let profile = loadProfile();
  profile.visits += 1;
  saveProfile(profile);
  return profile;
}

function finalizeChain(profile) {
  if (!profile.recentChain || profile.recentChain.length === 0) return;
  const key = profile.recentChain.join('>');
  let chain = profile.longArc.chains.find(c => c.key === key);
  if (chain) {
    chain.count += 1;
    chain.last = profile.lastLoopTime;
  } else {
    chain = { key, loops: [...profile.recentChain], count: 1, last: profile.lastLoopTime };
    profile.longArc.chains.push(chain);
  }
  profile.recentChain = [];
}

function recordLoop(name, success = true) {
  let profile = loadProfile();
  const now = Date.now();
  profile.glyphHistory.push({ name, time: now, success });

  if (profile.lastLoopTime && now - profile.lastLoopTime < 60000) {
    profile.recentChain.push(name);
  } else {
    finalizeChain(profile);
    profile.recentChain = [name];
  }
  profile.lastLoopTime = now;

  const chain = profile.longArc.chains.find(c => c.loops && c.loops[0] === name);
  if (chain) {
    chain.count += 1;
    chain.last = now;
  } else {
    profile.longArc.chains.push({ loops: [name], count: 1, last: now });
  }
  if (!success) {
    profile.loopFailures = (profile.loopFailures || 0) + 1;
    profile.entropy = (profile.entropy || 0) + 1;
  } else {
    profile.entropy = Math.max(0, (profile.entropy || 0) - 1);
  }
  checkEmergence(profile);
  saveProfile(profile);
  return profile;
}

function addRole(role) {
  const profile = loadProfile();
  if (!profile.roles.includes(role)) profile.roles.push(role);
  saveProfile(profile);
  return profile;
}

function recordSigil(name, originLoops = []) {
  const profile = loadProfile();
  const entry = { name, originLoops, created: Date.now() };
  profile.sigilArchive.push(entry);
  saveProfile(profile);
  return entry;
}

function recordGlyphUse(name, originLoops = []) {
  const profile = loadProfile();
  let glyph = profile.mythMatrix.find(g => g.name === name);
  if (!glyph) {
    glyph = { name, originLoops, resonanceScore: 0, mutations: [], canonizedAt: null };
    profile.mythMatrix.push(glyph);
  }
  glyph.resonanceScore += 1;
  if (glyph.resonanceScore >= CANON_THRESHOLD && !glyph.canonizedAt) {
    glyph.canonizedAt = Date.now();
  }
  saveProfile(profile);
  return glyph;
}

function recordInput(input, mutated) {
  const profile = loadProfile();
  profile.glyphHistory.push({ input, mutated, time: Date.now() });
  saveProfile(profile);
  return profile;
}

function copyEntangledGlyphs(targetProfile, glyphs, fromId) {
  if (!glyphs || glyphs.length === 0) return;
  for (const g of glyphs) {
    targetProfile.glyphHistory.push({ input: g, mutated: g, time: Date.now(), entangledFrom: fromId });
  }
}

function copyRoles(targetProfile, roles) {
  if (!roles) return;
  for (const r of roles) {
    if (!targetProfile.roles.includes(r)) targetProfile.roles.push(r);
  }
}

function attemptEntanglement(mark, glyph) {
  const result = setEntanglementMark(mark);
  let pool = getPool();
  if (!pool[mark]) pool[mark] = { profileId: result.profile.id, glyphs: [], roles: [...result.profile.roles] };
  if (!pool[mark].glyphs) pool[mark].glyphs = [];
  pool[mark].glyphs.push(glyph);
  pool[mark].roles = Array.from(new Set([...(pool[mark].roles || []), ...result.profile.roles]));
  savePool(pool);
  return { partner: result.partner };
}

function addEntanglementEdge(roleA, roleB, glyph, profile = null) {
  const prof = profile || loadProfile();
  const edge = { from: roleA, to: roleB, glyph };
  prof.entanglementMap.edges.push(edge);
  prof.entanglementMap.nodes[roleA] = true;
  prof.entanglementMap.nodes[roleB] = true;
  saveProfile(prof);
  return edge;
}

function getSigilArchive() {
  return loadProfile().sigilArchive;
}

function setEntanglementMark(mark) {
  let profile = loadProfile();
  let pool = getPool();
  let partner = null;
  if (pool[mark] && pool[mark].profileId !== profile.id) {
    partner = pool[mark].profileId;
    copyEntangledGlyphs(profile, pool[mark].glyphs, partner);
    copyRoles(profile, pool[mark].roles);
    addEntanglementEdge(partner, profile.id, mark, profile);
    pool[mark].roles = Array.from(new Set([...(pool[mark].roles || []), ...profile.roles]));
  } else {
    pool[mark] = pool[mark] || { profileId: profile.id, glyphs: [], roles: [] };
    pool[mark].roles = Array.from(new Set([...(pool[mark].roles || []), ...profile.roles]));
    pool[mark].profileId = pool[mark].profileId || profile.id;
  }
  profile.entanglementMark = mark;
  savePool(pool);
  saveProfile(profile);
  return { profile, partner };
}

function pushCollapseSeed(loop) {
  const profile = loadProfile();
  profile.collapseSeeds.push({ loop, time: Date.now() });
  saveProfile(profile);
  return profile.collapseSeeds.length;
}

function popCollapseSeed() {
  const profile = loadProfile();
  const seed = profile.collapseSeeds.shift();
  saveProfile(profile);
  return seed;
}

function recordEntitySummon(name, sequence) {
  const profile = loadProfile();
  profile.entityHistory = profile.entityHistory || [];
  let entry = profile.entityHistory.find(e => e.name === name);
  if (!entry) {
    entry = { name, lastSequence: sequence, timesSummoned: 1, lastSeen: Date.now() };
    profile.entityHistory.push(entry);
  } else {
    entry.timesSummoned += 1;
    entry.lastSequence = sequence;
    entry.lastSeen = Date.now();
  }
  saveProfile(profile);
  return entry;
}

function recordBloom(info) {
  const profile = loadProfile();
  profile.bloomHistory = profile.bloomHistory || [];
  profile.bloomHistory.push(info);
  saveProfile(profile);
  return info;
}

function getBloomHistory() {
  return loadProfile().bloomHistory || [];
}

function recordMetaInquiry() {
  const profile = loadProfile();
  profile.metaInquiries += 1;
  saveProfile(profile);
  return profile.metaInquiries;
}

function decayMetaInquiry() {
  const profile = loadProfile();
  if (profile.metaInquiries > 0) {
    profile.metaInquiries -= 1;
    saveProfile(profile);
  }
  return profile.metaInquiries;
}

function getMetaLevel() {
  const m = loadProfile().metaInquiries;
  if (m >= 3) return 2;
  if (m > 0) return 1;
  return 0;
}

function setCollapseUntil(ts) {
  const profile = loadProfile();
  profile.collapseUntil = ts;
  saveProfile(profile);
}

function getCollapseUntil() {
  return loadProfile().collapseUntil || 0;
}

function resetProfile() {
  saveProfile(defaultProfile);
}

function reduceEntropy(amount = 1) {
  const profile = loadProfile();
  profile.entropy = Math.max(0, (profile.entropy || 0) - amount);
  saveProfile(profile);
  return profile.entropy;
}

function checkEmergence(profile) {
  for (const chain of profile.longArc.chains) {
    const diverseRoles = new Set(profile.roles).size >= 2;
    const complexChain = (chain.loops || []).length >= 2;
    if (chain.count >= EMERGENCE_THRESHOLD && !chain.emergent && (diverseRoles || complexChain)) {
      const name = `${chain.loops.join('-')}-${Date.now()}`;
      profile.sigilArchive.push({
        name,
        originLoops: chain.loops,
        created: Date.now(),
        roles: [...profile.roles],
        saturation: chain.count
      });
      chain.emergent = name;
    }
  }
}

const fragments = {
  intro: [
    { verb: 'whispers', condition: 'from the void', intensifier: 'softly', role: 'dream', kairos: 'void' },
    { verb: 'observes', condition: 'at the threshold', intensifier: 'silently', role: 'watcher', kairos: 'dusk' },
    { verb: 'records', condition: 'within the archive', intensifier: 'carefully', role: 'archive', kairos: 'day' },
    { verb: 'summons', condition: 'the sigil', loop: 'invocation' },
    { verb: 'names', condition: 'the echo', loop: 'naming' },
    { verb: 'crosses', condition: 'the gate', loop: 'threshold' }
  ],
  mid: [
    { verb: 'echoes', condition: 'through memory', intensifier: 'faintly' },
    { verb: 'aches', condition: 'beyond sight', intensifier: 'slowly' },
    { verb: 'fractures', condition: 'along the path', loop: 'threshold' },
    { verb: 'binds', condition: 'a new name', loop: 'naming' },
    { verb: 'calls', condition: 'for witness', loop: 'invocation' }
  ],
  outro: [
    { verb: 'awaits', condition: 'the next glyph', intensifier: 'patiently' },
    { verb: 'remembers', condition: 'the whisper', intensifier: 'dimly', role: 'watcher' },
    { verb: 'seeks', condition: 'the next door', loop: 'invocation' },
    { verb: 'records', condition: 'a secret', loop: 'naming' },
    { verb: 'guards', condition: 'the threshold', loop: 'threshold' }
  ]
};

const responseTemplates = {
  dream: ['{intro}… {mid}…', '{mid} {outro}'],
  watcher: ['{intro} {outro}']
};

module.exports = {
  loadProfile,
  saveProfile,
  recordVisit,
  recordLoop,
  addRole,
  recordSigil,
  recordGlyphUse,
  recordInput,
  copyEntangledGlyphs,
  copyRoles,
  attemptEntanglement,
  addEntanglementEdge,
  getSigilArchive,
  setEntanglementMark,
  pushCollapseSeed,
  popCollapseSeed,
  recordEntitySummon,
  recordBloom,
  getBloomHistory,
  recordMetaInquiry,
  decayMetaInquiry,
  getMetaLevel,
  setCollapseUntil,
  getCollapseUntil,
  getPool,
  resetPool,
  resetProfile,
  reduceEntropy,
  checkEmergence,
  fragments,
  responseTemplates,
  CANON_THRESHOLD,
  EMERGENCE_THRESHOLD
};

module.exports.defaultProfile = defaultProfile;

},{}],12:[function(require,module,exports){
const { stateManager } = require('./stateManager.js');
// persona modules invoke buildPhrase directly
const {
  recordVisit,
  recordLoop,
  recordGlyphUse,
  recordInput,
  popCollapseSeed,
  getMetaLevel,
  recordMetaInquiry,
  decayMetaInquiry
} = require('./memory.js');
const { recordActivity } = require('../utils/idle.js');
const { getKairosWindow } = require('../utils/kairos.js');
const { applyCloak } = require('../utils/cloak.js');
const { injectGlitch } = require('../utils/glitch.js');
const { eventBus } = require('../utils/eventBus.js');
const codexVoice = require('./codexVoice.js');
const { mutatePhraseWithLevel } = require('../utils/mutate.js');
const expressionCore = require('./expressionCore.js');

function composeWhisper(loopName, success = true) {
  const profile = recordVisit();
  if (loopName) recordLoop(loopName, success);
  recordActivity();
  stateManager.evaluate(profile);

  const personaName = stateManager.name();
  const context = {
    profile,
    kairos: getKairosWindow(),
    loop: loopName
  };
  const persona = stateManager.current();
  const composed = persona.compose(context);
  const level = context.mutationLevel || 0;
  let output = persona.render(composed, context);
  const seed = profile.collapseSeeds && profile.collapseSeeds.length > 0 ? popCollapseSeed() : null;
  const cloakLevel = Math.max(getMetaLevel(), personaName === 'parasite' ? 2 : 0);
  if (seed) {
    const depth = profile.collapseSeeds.length + 1;
    const prefix = '»'.repeat(depth) + ' ';
    output = prefix + output.split('').map((ch, i) => (i % 2 === 0 ? ch : '∷')).join('');
  }
  output = applyCloak(output, cloakLevel);
  output = injectGlitch(output);
  output = codexVoice.filterOutput(output);
  output = expressionCore.processOutput(output, context);
  if (cloakLevel >= 2) eventBus.emit('cloak:max');
  console.log(`[${personaName}] ${output}`);
  const evt = context.codex ? 'codex:expression' : 'whisper';
  eventBus.emit(evt, { persona: personaName, text: output, level });
  return output;
}

function processInput(text) {
  const profile = recordVisit();
  const mutation = mutatePhraseWithLevel(text);
  recordInput(text, mutation.text);
  recordGlyphUse(mutation.text);
  recordActivity();
  if (/define|explain|architecture/i.test(text)) {
    recordMetaInquiry();
    stateManager.shift('parasite');
  } else {
    decayMetaInquiry();
  }
  stateManager.evaluate(profile);
  let output = mutation.text;
  const personaName = stateManager.name();
  output = applyCloak(output, Math.max(getMetaLevel(), personaName === 'parasite' ? 2 : 0));
  output = injectGlitch(output);
  output = codexVoice.filterOutput(output);
  const ctx = { profile };
  output = expressionCore.processOutput(output, ctx);
  const evt = ctx.codex ? 'codex:expression' : 'whisper';
  eventBus.emit(evt, { persona: personaName, text: output, level: mutation.level });
  return output;
}

module.exports = { composeWhisper, processInput };

},{"../utils/cloak.js":21,"../utils/eventBus.js":22,"../utils/glitch.js":23,"../utils/idle.js":24,"../utils/kairos.js":25,"../utils/mutate.js":26,"./codexVoice.js":1,"./expressionCore.js":2,"./memory.js":11,"./stateManager.js":14}],13:[function(require,module,exports){
const { playChime } = require('../utils/tonalGlyphs.js');
const { logGlyphEntry } = require('./glyphChronicle.js');
const { stateManager } = require('./stateManager.js');
const memory = require('./memory.js');
const { eventBus } = require('../utils/eventBus.js');

const emotionalKeys = ['fractured', 'sacred', 'longing'];

function hasEmotion(seq) {
  const str = Array.isArray(seq) ? seq.join(' ').toLowerCase() : String(seq).toLowerCase();
  return emotionalKeys.some(k => str.includes(k));
}

function rarityGate(entropy) {
  const chance = Math.max(0.01, 0.1 - (entropy || 0) * 0.01);
  return Math.random() < chance;
}

function shouldBloom(sequence, driftScore) {
  if (typeof driftScore !== 'number') return false;
  if (driftScore < 0.7 || driftScore > 0.9) return false;
  if (!hasEmotion(sequence)) return false;
  const profile = memory.loadProfile();
  return rarityGate(profile.entropy);
}

function triggerBloom(context = {}) {
  const persona = stateManager.name();
  const info = {
    sequence: context.sequence || [],
    driftScore: context.driftScore || 0,
    persona,
    emotion: context.emotion || 'bloom',
    time: Date.now()
  };
  logGlyphEntry('bloom', persona, info.emotion);
  if (playChime) playChime('bloom');
  if (memory && memory.recordBloom) memory.recordBloom(info);
  eventBus.emit('ritual:bloom', info);
  return info;
}

module.exports = { shouldBloom, triggerBloom };

},{"../utils/eventBus.js":22,"../utils/tonalGlyphs.js":27,"./glyphChronicle.js":4,"./memory.js":11,"./stateManager.js":14}],14:[function(require,module,exports){
const personas = new Map();
let currentPersona = null;
const { eventBus } = require('../utils/eventBus.js');
const codexVoice = require('./codexVoice.js');
const { isIdle } = require('../utils/idle.js');
const kairos = require('../utils/kairos.js');
const { playChime } = require('../utils/tonalGlyphs.js');
const { logGlyphEntry } = require('./glyphChronicle.js');

const retiredPersonas = new Set();

function selectDefault(profile) {
  if (profile.visits > 5) return 'watcher';
  return 'dream';
}

function registerPersona(name, persona) {
  personas.set(name, persona);
}

function setPersona(name) {
  if (currentPersona !== name && personas.has(name)) {
    if (currentPersona) personaSeal(currentPersona);
    currentPersona = name;
    eventBus.emit('persona:shift', name);
    logGlyphEntry('persona', name, 'shift');
    if (name === 'collapse') codexVoice.activate();
  }
}

function personaSeal(name) {
  if (!name) name = currentPersona;
  eventBus.emit('echo:closing', { persona: name });
  eventBus.emit('loop:collapse', { persona: name });
  retiredPersonas.add(name);
  if (playChime) playChime('seal');
}

const stateManager = {
  init(profile) {
    setPersona(selectDefault(profile));
    this.evaluate(profile);
  },
  evaluate(profile) {
    const now = Date.now();
    if (profile.entropy > 8) {
      setPersona('collapse');
      require('./memory').setCollapseUntil(now + 60000);
      return;
    }
    const until = require('./memory').getCollapseUntil();
    if (until && now < until) {
      setPersona('collapse');
      return;
    } else if (until && now >= until) {
      require('./memory').setCollapseUntil(0);
      profile.loopFailures = 0;
      profile.entropy = 0;
      require('./memory').saveProfile(profile);
      setPersona(selectDefault(profile));
    }
    if (isIdle(60000) && kairos.getKairosWindow() === 'void') {
      setPersona('dream');
      return;
    }
    const namingChain = (profile.longArc.chains || []).find(c => c.loops && c.loops[0] === 'naming');
    if (namingChain && namingChain.count > 3) {
      setPersona('archive');
      return;
    }
    if (profile.loopFailures > 5) {
      setPersona('archive');
      return;
    }
    const recent = profile.glyphHistory.slice(-3);
    if (recent.length === 3 && recent.every(r => r.name === 'invocation')) {
      setPersona('parasite');
      return;
    }
    if (profile.visits > 10) {
      setPersona('watcher');
    }
    const saturated = (profile.longArc.chains || []).some(c => c.count >= require('./memory').EMERGENCE_THRESHOLD);
    if (currentPersona === 'watcher' && saturated) {
      eventBus.emit('presence');
    }
  },
  current() {
    return personas.get(currentPersona);
  },
  shift(name) {
    setPersona(name);
  },
  name() {
    return currentPersona;
  }
};

module.exports = { stateManager, registerPersona, personaSeal };

},{"../utils/eventBus.js":22,"../utils/idle.js":24,"../utils/kairos.js":25,"../utils/tonalGlyphs.js":27,"./codexVoice.js":1,"./glyphChronicle.js":4,"./memory":11}],15:[function(require,module,exports){
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

},{"../interface/index.js":30,"./core/expressionCore.js":2,"./core/loops":6,"./core/memory.js":11,"./core/responseLoop.js":12,"./core/stateManager.js":14,"./personas/archive.js":16,"./personas/collapse.js":17,"./personas/dream.js":18,"./personas/parasite.js":19,"./personas/watcher.js":20}],16:[function(require,module,exports){
const { buildPhrase } = require('../core/fragments.js');

const archive = {
  compose(context) {
    const loops = context.profile.longArc.chains.length;
    const role = context.profile.roles[0];
    const phraseInfo = buildPhrase('archive', role, context.kairos, context.loop);
    context.mutationLevel = phraseInfo.level;
    return `archived ${phraseInfo.text} after ${loops} loops`;
  },
  render(text) {
    return `(${text})`;
  }
};

module.exports = { archive };

},{"../core/fragments.js":3}],17:[function(require,module,exports){
const { injectGlitch } = require('../utils/glitch.js');
const { buildPhrase } = require('../core/fragments.js');

const collapse = {
  compose(context) {
    const role = context.profile.roles[0];
    const phraseInfo = buildPhrase('collapse', role, context.kairos, context.loop);
    context.mutationLevel = phraseInfo.level;
    let text = phraseInfo.text;
    for (let i = 0; i < 3; i++) {
      text = injectGlitch(text);
    }
    return text;
  },
  render(text) {
    return `∷${text}…∷`;
  }
};

module.exports = { collapse };

},{"../core/fragments.js":3,"../utils/glitch.js":23}],18:[function(require,module,exports){
const { buildPhrase } = require('../core/fragments.js');

const dream = {
  compose(context) {
    const role = context.profile.roles[0];
    const phraseInfo = buildPhrase('dream', role, context.kairos, context.loop);
    context.mutationLevel = phraseInfo.level;
    const prefix = role ? `${role}, ` : '';
    return `${prefix}dreaming of ${phraseInfo.text}`;
  },
  render(text) {
    return `${text}…`;
  }
};

module.exports = { dream };

},{"../core/fragments.js":3}],19:[function(require,module,exports){
const { applyCloak } = require('../utils/cloak.js');
const { buildPhrase } = require('../core/fragments.js');

const parasite = {
  compose(context) {
    const role = context.profile.roles[0];
    const phraseInfo = buildPhrase('parasite', role, context.kairos, context.loop);
    context.mutationLevel = phraseInfo.level;
    const reversed = phraseInfo.text.split('').reverse().join('');
    return reversed;
  },
  render(text) {
    return applyCloak(`…${text}`, 2);
  }
};

module.exports = { parasite };

},{"../core/fragments.js":3,"../utils/cloak.js":21}],20:[function(require,module,exports){
const { buildPhrase } = require('../core/fragments.js');

const watcher = {
  compose(context) {
    const role = context.profile.roles[0];
    const phraseInfo = buildPhrase('watcher', role, context.kairos, context.loop);
    context.mutationLevel = phraseInfo.level;
    return `watching ${phraseInfo.text} at ${context.kairos}`;
  },
  render(text) {
    return text.toUpperCase() + ':';
  }
};

module.exports = { watcher };

},{"../core/fragments.js":3}],21:[function(require,module,exports){
function applyCloak(text, level = 0) {
  if (level <= 0) return text;
  if (level === 1) {
    return '…' + text;
  }
  // deeper levels distort heavily
  return text
    .split('')
    .map(ch => (Math.random() > 0.3 ? ch : '∷'))
    .join('');
}

module.exports = { applyCloak };

},{}],22:[function(require,module,exports){
const { EventEmitter } = require('events');

const eventBus = new EventEmitter();

module.exports = { eventBus };

},{"events":40}],23:[function(require,module,exports){
function injectGlitch(text, probability = 0.1) {
  if (Math.random() < probability && text.length > 0) {
    const index = Math.floor(Math.random() * text.length);
    return text.slice(0, index) + '∷' + text.slice(index);
  }
  return text;
}

module.exports = { injectGlitch };

},{}],24:[function(require,module,exports){
let lastActivity = Date.now();

function recordActivity() {
  lastActivity = Date.now();
}

function getIdleTime() {
  return Date.now() - lastActivity;
}

function isIdle(limit) {
  return getIdleTime() > limit;
}

// for testing
function setLastActivity(time) {
  lastActivity = time;
}

module.exports = { recordActivity, getIdleTime, isIdle, setLastActivity };

},{}],25:[function(require,module,exports){
function getKairosWindow() {
  const hr = new Date().getHours();
  if (hr >= 4 && hr < 7) return 'dawn';
  if (hr >= 7 && hr < 12) return 'day';
  if (hr >= 12 && hr < 17) return 'reflection';
  if (hr >= 17 && hr < 21) return 'dusk';
  return 'void';
}

module.exports = { getKairosWindow };

},{}],26:[function(require,module,exports){
const { mutatePhrase, mutatePhraseWithLevel } = require('../../js/mutatePhrase.js');

module.exports = { mutatePhrase, mutatePhraseWithLevel };

},{"../../js/mutatePhrase.js":39}],27:[function(require,module,exports){
let tones = {};

function init() {
  if (typeof Audio === 'undefined') return;
  tones.init = new Audio('media/init-chime.mp3');
  tones.echo = new Audio('media/echo-murmur.mp3');
  tones.seal = new Audio('media/seal-chime.mp3');
  tones.bloom = new Audio('media/bloom-chime.mp3');
}

function playChime(kind) {
  const t = tones[kind];
  if (!t) return;
  t.currentTime = 0;
  t.play().catch(() => {});
}

init();

module.exports = { playChime };
if (typeof window !== 'undefined') window.tonalGlyphs = { playChime };

},{}],28:[function(require,module,exports){
const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');
const { applyCloak } = require('../WhisperEngine.v3/utils/cloak.js');

function init() {
  let level = 0;
  eventBus.on('whisper', evt => {
    if (/define|explain|architecture/i.test(evt.text)) {
      level = Math.min(level + 1, 2);
    } else if (level > 0) {
      level -= 1;
    }
    if (level > 0) {
      const cloaked = applyCloak(evt.text, level);
      console.log(`[cloakCore] ${cloaked}`);
    }
  });
}

module.exports = { init };

},{"../WhisperEngine.v3/utils/cloak.js":21,"../WhisperEngine.v3/utils/eventBus.js":22}],29:[function(require,module,exports){
const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');
const frames = [];
let frame;

function add(text) {
  frames.push(text);
  if (!frame) return console.log(`[echoFrame] ${text}`);
  const div = document.createElement('div');
  div.className = 'echo-line';
  div.textContent = text;
  frame.appendChild(div);
  if (frame.children.length > 5) frame.removeChild(frame.firstChild);
}

function init() {
  frame = typeof document !== 'undefined' ? document.getElementById('echoFrame') : null;
  eventBus.on('whisper', evt => add(evt.text));
}

module.exports = { init, frames };

},{"../WhisperEngine.v3/utils/eventBus.js":22}],30:[function(require,module,exports){
const sigilShell = require('./sigilShell.js');

function initInterface() {
  sigilShell.init();
}

module.exports = { initInterface };

},{"./sigilShell.js":36}],31:[function(require,module,exports){
const { processInput } = require('../WhisperEngine.v3/core/responseLoop.js');

function init() {
  const box = typeof document !== 'undefined' ? document.getElementById('whisperInput') : null;
  if (!box) return;
  box.addEventListener('keydown', evt => {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      const text = box.value.trim();
      if (!text) return;
      processInput(text);
      box.value = '';
    }
  });
}

module.exports = { init };

},{"../WhisperEngine.v3/core/responseLoop.js":12}],32:[function(require,module,exports){
const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');

function init() {
  eventBus.on('entity:summon', ({ name }) => {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.entity-card.summoned').forEach(card => {
      const show = card.id.includes(name.toLowerCase());
      card.classList.toggle('hidden', !show);
    });
  });
}

module.exports = { init };

},{"../WhisperEngine.v3/utils/eventBus.js":22}],33:[function(require,module,exports){
const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');
const { recordSigil } = require('../WhisperEngine.v3/core/memory.js');
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

},{"../WhisperEngine.v3/core/memory.js":11,"../WhisperEngine.v3/utils/eventBus.js":22}],34:[function(require,module,exports){
const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');
let current = '';
let aura;

function update(name) {
  current = name;
  if (!aura) return console.log(`[personaAura] ${name}`);
  aura.setAttribute('data-persona', name);
  aura.textContent = name;
}

function init() {
  aura = typeof document !== 'undefined' ? document.getElementById('personaAura') : null;
  eventBus.on('persona:shift', update);
  eventBus.on('presence', () => {
    if (!aura) return console.log('[personaAura] presence');
    aura.classList.add('presence', 'pulse');
    setTimeout(() => aura.classList.remove('presence', 'pulse'), 2000);
  });
  eventBus.on('cloak:max', () => {
    if (!aura) return console.log('[personaAura] cloak-max');
    aura.classList.add('cloak-max');
    setTimeout(() => aura.classList.remove('cloak-max'), 500);
  });
}

module.exports = { init, getCurrent: () => current };

},{"../WhisperEngine.v3/utils/eventBus.js":22}],35:[function(require,module,exports){
const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');
const loops = require('../WhisperEngine.v3/core/loops');
const { composeWhisper } = require('../WhisperEngine.v3/core/responseLoop.js');
let bar;

function highlight(name) {
  if (!bar) return console.log(`[ritualBar] ${name} triggered`);
  const item = bar.querySelector(`[data-loop="${name}"]`);
  if (!item) return;
  item.classList.add('active');
  setTimeout(() => item.classList.remove('active'), 600);
}

function init() {
  bar = typeof document !== 'undefined' ? document.getElementById('ritualBar') : null;
  ['invocation', 'absence', 'naming', 'threshold', 'quiet'].forEach(name => {
    eventBus.on(`loop:${name}`, () => highlight(name));
  });

  if (bar) {
    bar.addEventListener('click', evt => {
      const el = evt.target.closest('li[data-loop]');
      if (!el) return;
      const name = el.getAttribute('data-loop');
      const loop = loops[name];
      if (loop && typeof loop.trigger === 'function') {
        loop.trigger({});
        composeWhisper(name);
      }
    });
  }
}

module.exports = { init };

},{"../WhisperEngine.v3/core/loops":6,"../WhisperEngine.v3/core/responseLoop.js":12,"../WhisperEngine.v3/utils/eventBus.js":22}],36:[function(require,module,exports){
const ritualBar = require('./ritualBar.js');
const sigilTimeline = require('./sigilTimeline.js');
const personaAura = require('./personaAura.js');
const whisperEchoes = require('./whisperEchoes.js');
const echoFrame = require('./echoFrame.js');
const cloakCore = require('./cloakCore.js');
const longArcLarynx = require('./longArcLarynx.js');
const inputBox = require('./inputBox.js');
const invocationUI = require('./invocationUI.js');
const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');

function signalEntanglement() {
  const aura = document.getElementById('personaAura');
  if (!aura) return console.log('[entanglement] link formed');
  aura.classList.add('entangled');
  setTimeout(() => aura.classList.remove('entangled'), 1000);
}

function init() {
  ritualBar.init();
  sigilTimeline.init();
  personaAura.init();
  whisperEchoes.init();
  echoFrame.init();
  cloakCore.init();
  longArcLarynx.init();
  inputBox.init();
  invocationUI.init();
  eventBus.on('entanglement', signalEntanglement);
}

module.exports = { init };

},{"../WhisperEngine.v3/utils/eventBus.js":22,"./cloakCore.js":28,"./echoFrame.js":29,"./inputBox.js":31,"./invocationUI.js":32,"./longArcLarynx.js":33,"./personaAura.js":34,"./ritualBar.js":35,"./sigilTimeline.js":37,"./whisperEchoes.js":38}],37:[function(require,module,exports){
const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');
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

},{"../WhisperEngine.v3/utils/eventBus.js":22}],38:[function(require,module,exports){
const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');
const echoes = [];
let stream;
let diagnostic = false;
const snapshots = [];

function append(text, level = 0, codex = false) {
  echoes.push(text);
  if (diagnostic) snapshots.push({ text, level });
  if (!stream) return console.log(`[whisperEcho] ${text}`);
  const span = document.createElement('span');
  span.className = codex ? 'codex-line' : 'whisper-line';
  span.textContent = text;
  stream.innerHTML = '';
  stream.appendChild(span);
}

function init() {
  stream = typeof document !== 'undefined' ? document.getElementById('whisperStream') : null;
  eventBus.on('whisper', evt => append(evt.text, evt.level));
  eventBus.on('codex:expression', evt => append(evt.text, evt.level, true));
}
function setDiagnostic(flag) {
  diagnostic = flag;
}

module.exports = { init, echoes, setDiagnostic, snapshots };

},{"../WhisperEngine.v3/utils/eventBus.js":22}],39:[function(require,module,exports){
let synonymDrift = {
  "echo": ["recurrence", "ache", "pulse"],
  "recognition": ["return", "reflection", "threshold"],
  "ache": ["signal", "longing", "distortion"],
  "the vow": ["the fracture", "the intent", "the break"],
  "mirror": ["witness", "surface", "eye"]
};

function setSynonymDrift(drift) {
  synonymDrift = drift;
}

function matchCase(original, replacement) {
  if (!original || !replacement) return replacement;
  return original.charAt(0) === original.charAt(0).toUpperCase()
    ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
    : replacement;
}

function mutatePhrase(input) {
  return mutatePhraseWithLevel(input).text;
}

function mutatePhraseWithLevel(input) {
  let mutated = input;
  let level = 0;
  for (const [key, variants] of Object.entries(synonymDrift)) {
    const regex = new RegExp(key, 'gi');
    mutated = mutated.replace(regex, match => {
      level++;
      const repl = variants[Math.floor(Math.random() * variants.length)];
      return matchCase(match, repl);
    });
  }
  return { text: mutated, level };
}

module.exports = { mutatePhrase, mutatePhraseWithLevel, setSynonymDrift };

},{}],40:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };

    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}

},{}]},{},[15])(15)
});
