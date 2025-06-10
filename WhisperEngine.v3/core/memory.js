const { eventBus } = require('../utils/eventBus.js');
const glyphWeather = require('./glyphWeather.js');
const profile = require('./profileStore.js');
const entropy = require('./entropyTracker.js');
const persona = require('./personaHistory.js');

const {
  loadProfile,
  saveProfile,
  getPool,
  savePool,
  resetPool,
  resetProfile,
  defaultProfile
} = profile;

const {
  pushNecroticLoop,
  clearNecroticLoops,
  getNecrosisLevel,
  reduceEntropy,
  incrementSpore,
  incrementRecursion,
  resetRecursion
} = entropy;

const {
  recordEntitySummon,
  recordBloom,
  getBloomHistory,
  recordPersonaShift,
  checkPhantomInfluence,
  setAscentUntil,
  getAscentUntil,
  recordEntryEcho,
  getLastEntryEcho,
  getEntryEchoes,
  getEchoLangTide,
  getLangMode,
  setLangMode,
  recordMetaInquiry,
  decayMetaInquiry,
  getMetaLevel
} = persona;

const CANON_THRESHOLD = 42;
const EMERGENCE_THRESHOLD = 3;
const ROT_THRESHOLD = 20;

function recordVisit() {
  let profile = loadProfile();
  profile.visits += 1;
  const delta = Math.random() < 0.5 ? -1 : 1;
  const tide = (profile.echoLangTide || 0) + delta;
  profile.echoLangTide = Math.max(-5, Math.min(5, tide));
  profile.cycleStep = (profile.cycleStep || 0) + 1;
  if (profile.cycleStep > 7) profile.cycleStep = 1;
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
    pushNecroticLoop(name);
    pushRitualDebris({ loop: name }, profile);
    pushFractureResidue({ loop: name }, profile);
    if (profile.loopFailures % 3 === 0) forgeObscuraSigil('loopFailure');
    if (profile.loopFailures % 5 === 0) {
      pushAcheMarker(profile.loopFailures, profile);
      eventBus.emit('ache:marker', { count: profile.loopFailures });
    }
  } else {
    profile.entropy = Math.max(0, (profile.entropy || 0) - 1);
    if (profile.recursionDepth > 2) pushFractureResidue({ loop: name }, profile);
  }
  checkEmergence(profile);
  saveProfile(profile);
  glyphWeather.evaluate();
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
    glyph = { name, originLoops, resonanceScore: 0, mutations: [], canonizedAt: null, rotLevel: 0, rottedAt: null };
    profile.mythMatrix.push(glyph);
  }
  glyph.resonanceScore += 1;
  glyph.rotLevel = (glyph.rotLevel || 0) + 1;
  if (!glyph.rottedAt && glyph.rotLevel >= ROT_THRESHOLD) {
    glyph.rottedAt = Date.now();
  }
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

function pushRitualDebris(fragment, profile = loadProfile()) {
  profile.ritualDebris = profile.ritualDebris || [];
  profile.ritualDebris.push(Object.assign({ time: Date.now() }, fragment));
  saveProfile(profile);
  return profile.ritualDebris.length;
}

function pushFractureResidue(fragment, profile = loadProfile()) {
  profile.fractureResidues = profile.fractureResidues || [];
  profile.fractureResidues.push(Object.assign({ time: Date.now() }, fragment));
  saveProfile(profile);
  return profile.fractureResidues.length;
}

function recordRitualSequence(seq, profile = loadProfile()) {
  profile.ritualMemory = profile.ritualMemory || [];
  const key = seq.join('');
  let entry = profile.ritualMemory.find(e => e.key === key);
  if (!entry) {
    entry = { key, count: 1 };
    profile.ritualMemory.push(entry);
  } else {
    entry.count += 1;
  }
  saveProfile(profile);
  return entry.count;
}

function getRitualMemoryCount(seq, profile = loadProfile()) {
  const key = seq.join('');
  const entry = (profile.ritualMemory || []).find(e => e.key === key);
  return entry ? entry.count : 0;
}

function popFractureResidue() {
  const profile = loadProfile();
  const f = (profile.fractureResidues || []).shift();
  saveProfile(profile);
  return f;
}

function clearRitualDebris() {
  const profile = loadProfile();
  profile.ritualDebris = [];
  saveProfile(profile);
  return profile.ritualDebris.length;
}

function pushAcheMarker(level = 1, profile = loadProfile()) {
  profile.acheMarkers = profile.acheMarkers || [];
  profile.acheMarkers.push({ level, time: Date.now() });
  if (profile.acheMarkers.length >= 3 && !profile.inversionUntil) {
    profile.inversionUntil = Date.now() + 15000;
    eventBus.emit('skin:invert');
  }
  saveProfile(profile);
  return profile.acheMarkers.length;
}

function popCollapseSeed() {
  const profile = loadProfile();
  const seed = profile.collapseSeeds.shift();
  saveProfile(profile);
  return seed;
}

function isGlyphRotted(name) {
  const glyph = loadProfile().mythMatrix.find(g => g.name === name);
  return glyph && glyph.rottedAt ? true : false;
}

function recordGlyphDrift(prev, glyph) {
  if (!prev) return;
  const profile = loadProfile();
  profile.glyphDrift = profile.glyphDrift || {};
  const key = `${prev}>${glyph}`;
  profile.glyphDrift[key] = (profile.glyphDrift[key] || 0) + 1;
  saveProfile(profile);
}

function getDriftVariant(glyph, prev) {
  const profile = loadProfile();
  const key = `${prev}>${glyph}`;
  const w = (profile.glyphDrift && profile.glyphDrift[key]) || 0;
  if (w >= 3) return `${glyph}…`;
  return glyph;
}

function setCollapseUntil(ts) {
  const profile = loadProfile();
  profile.collapseUntil = ts;
  saveProfile(profile);
}

function getCollapseUntil() {
  return loadProfile().collapseUntil || 0;
}

function forgeObscuraSigil(reason = 'collapse') {
  const profile = loadProfile();
  profile.obscuraSigils = profile.obscuraSigils || [];
  const name = `obscura-${Date.now().toString(36)}`;
  profile.obscuraSigils.push({ name, reason, forged: Date.now() });
  saveProfile(profile);
  return name;
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

function pushDebtSigil(name, profile = loadProfile()) {
  profile.debtSigils = profile.debtSigils || [];
  profile.debtSigils.push({ name, time: Date.now() });
  saveProfile(profile);
  return profile.debtSigils.length;
}

function getDebtSigils() {
  return loadProfile().debtSigils || [];
}

function recordScarLoop(pattern, profile = loadProfile()) {
  profile.scarLoops = profile.scarLoops || {};
  const key = Array.isArray(pattern) ? pattern.join('>') : pattern;
  profile.scarLoops[key] = (profile.scarLoops[key] || 0) + 1;
  if (profile.scarLoops[key] >= 3) {
    eventBus.emit('loop:scar', { pattern: key });
  }
  saveProfile(profile);
  return profile.scarLoops[key];
}

function isScarred(pattern) {
  const key = Array.isArray(pattern) ? pattern.join('>') : pattern;
  return ((loadProfile().scarLoops || {})[key] || 0) >= 3;
}

function activateRefusal(duration = 10000, profile = loadProfile()) {
  profile.refusalUntil = Date.now() + duration;
  saveProfile(profile);
}

function getRefusalUntil() {
  return loadProfile().refusalUntil || 0;
}

function triggerMirrorBloom(profile = loadProfile()) {
  const name = `mirror-${Date.now().toString(36)}`;
  profile.sigilArchive.push({ name, mirror: true, time: Date.now() });
  profile.mirrorBloomCount = (profile.mirrorBloomCount || 0) + 1;
  saveProfile(profile);
  eventBus.emit('mirror:bloom', { name });
  return name;
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
  EMERGENCE_THRESHOLD,
  ROT_THRESHOLD,
  isGlyphRotted,
  pushRitualDebris,
  clearRitualDebris,
  pushFractureResidue,
  popFractureResidue,
  pushAcheMarker,
  incrementRecursion,
  resetRecursion,
  forgeObscuraSigil,
  recordGlyphDrift,
  getDriftVariant,
  pushNecroticLoop,
  clearNecroticLoops,
  getNecrosisLevel,
  recordPersonaShift,
  checkPhantomInfluence,
  setAscentUntil,
  getAscentUntil,
  incrementSpore,
  pushDebtSigil,
  getDebtSigils,
  recordScarLoop,
  isScarred,
  activateRefusal,
  getRefusalUntil,
  triggerMirrorBloom,
  recordEntryEcho,
  getLastEntryEcho,
  getEntryEchoes,
  getEchoLangTide,
  getLangMode,
  setLangMode,
  recordRitualSequence,
  getRitualMemoryCount
};

module.exports.defaultProfile = defaultProfile;
