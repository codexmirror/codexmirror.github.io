const storageKey = 'whisperProfile';
const POOL_KEY = 'entanglementPool';
let nodeMemory = null;
let nodePool = null;
const { eventBus } = require('../utils/eventBus.js');
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
const ROT_THRESHOLD = 20;
const glyphWeather = require('./glyphWeather.js');

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
  ritualDebris: [],
  recursionDepth: 0,
  mutationAnchors: [],
  obscuraSigils: [],
  acheMarkers: [],
  fractureResidues: [],
  possessedEntity: null,
  inversionUntil: 0,
  glyphWeather: 'veil',
  collapseSeeds: [],
  metaInquiries: 0,
  collapseUntil: 0,
  glyphDrift: {},
  necroticLoops: [],
  personaShifts: [],
  phantomActive: false,
  ascentUntil: 0,
  recentChain: [],
  lastLoopTime: 0,
  entityHistory: [],
  bloomHistory: [],
  sporeDensity: 0,
  debtSigils: [],
  scarLoops: {},
  refusalUntil: 0,
  mirrorBloomCount: 0
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
    ritualDebris: data.ritualDebris || [],
    recursionDepth: data.recursionDepth || 0,
    mutationAnchors: data.mutationAnchors || [],
    obscuraSigils: data.obscuraSigils || [],
    acheMarkers: data.acheMarkers || [],
    glyphWeather: data.glyphWeather || 'veil',
    collapseSeeds: data.collapseSeeds || [],
    metaInquiries: data.metaInquiries || 0,
    collapseUntil: data.collapseUntil || 0,
    glyphDrift: data.glyphDrift || {},
    necroticLoops: data.necroticLoops || [],
    personaShifts: data.personaShifts || [],
    phantomActive: data.phantomActive || false,
    ascentUntil: data.ascentUntil || 0,
    recentChain: data.recentChain || [],
    lastLoopTime: data.lastLoopTime || 0,
    entityHistory: data.entityHistory || [],
    bloomHistory: data.bloomHistory || [],
    sporeDensity: data.sporeDensity || 0,
    fractureResidues: data.fractureResidues || [],
    possessedEntity: data.possessedEntity || null,
    inversionUntil: data.inversionUntil || 0,
    debtSigils: data.debtSigils || [],
    scarLoops: data.scarLoops || {},
    refusalUntil: data.refusalUntil || 0,
    mirrorBloomCount: data.mirrorBloomCount || 0
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
    pushNecroticLoop(name);
    pushRitualDebris({ loop: name }, profile);
    pushFractureResidue({ loop: name }, profile);
    if (profile.loopFailures % 3 === 0) forgeObscuraSigil('loopFailure');
    if (profile.loopFailures % 5 === 0) {
      pushAcheMarker(profile.loopFailures, profile);
      require('../utils/eventBus').eventBus.emit('ache:marker', { count: profile.loopFailures });
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
    require('../utils/eventBus').eventBus.emit('skin:invert');
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
    if (entry.timesSummoned >= 3 && profile.possessedEntity !== name) {
      profile.possessedEntity = name;
      require('../utils/eventBus').eventBus.emit('entity:possess', { name });
    }
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

function pushNecroticLoop(name) {
  const profile = loadProfile();
  profile.necroticLoops = profile.necroticLoops || [];
  profile.necroticLoops.push({ name, time: Date.now() });
  saveProfile(profile);
}

function clearNecroticLoops() {
  const profile = loadProfile();
  profile.necroticLoops = [];
  saveProfile(profile);
}

function getNecrosisLevel() {
  const profile = loadProfile();
  return (profile.necroticLoops || []).length;
}

function recordPersonaShift(name) {
  const profile = loadProfile();
  profile.personaShifts = profile.personaShifts || [];
  profile.personaShifts.push({ name, time: Date.now() });
  if (profile.personaShifts.length > 10) profile.personaShifts.shift();
  saveProfile(profile);
}

function checkPhantomInfluence() {
  const profile = loadProfile();
  const now = Date.now();
  const recent = (profile.personaShifts || []).filter(p => now - p.time < 60000);
  if (recent.length >= 3 && !profile.phantomActive) {
    profile.phantomActive = true;
    saveProfile(profile);
    require('../utils/eventBus').eventBus.emit('persona:phantom');
  } else if (recent.length < 2 && profile.phantomActive) {
    profile.phantomActive = false;
    saveProfile(profile);
  }
  return profile.phantomActive;
}

function setAscentUntil(ts) {
  const profile = loadProfile();
  profile.ascentUntil = ts;
  saveProfile(profile);
}

function getAscentUntil() {
  return loadProfile().ascentUntil || 0;
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

function incrementSpore() {
  const profile = loadProfile();
  profile.sporeDensity = (profile.sporeDensity || 0) + 1;
  saveProfile(profile);
  return profile.sporeDensity;
}

function incrementRecursion(anchor = null) {
  const profile = loadProfile();
  profile.recursionDepth = (profile.recursionDepth || 0) + 1;
  if (anchor) {
    profile.mutationAnchors = profile.mutationAnchors || [];
    profile.mutationAnchors.push({ glyph: anchor, depth: profile.recursionDepth, time: Date.now() });
  }
  saveProfile(profile);
  return profile.recursionDepth;
}

function resetRecursion() {
  const profile = loadProfile();
  profile.recursionDepth = 0;
  saveProfile(profile);
  return profile.recursionDepth;
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
  triggerMirrorBloom
};

module.exports.defaultProfile = defaultProfile;
