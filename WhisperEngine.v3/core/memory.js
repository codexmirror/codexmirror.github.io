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
  lastLoopTime: 0
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
    lastLoopTime: data.lastLoopTime || 0
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
  const profile = loadProfile();
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
  const profile = loadProfile();
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

function attemptEntanglement(mark, glyph) {
  const profile = loadProfile();
  let pool = getPool();
  let partner = null;
  if (pool[mark] && pool[mark].profileId !== profile.id) {
    partner = pool[mark];
    copyEntangledGlyphs(profile, partner.glyphs, partner.profileId);
    const edge = { from: profile.id, to: partner.profileId, glyph };
    profile.entanglementMap.edges.push(edge);
    profile.entanglementMap.nodes[profile.id] = true;
    profile.entanglementMap.nodes[partner.profileId] = true;
    pool[mark].glyphs.push(glyph);
  } else if (pool[mark]) {
    pool[mark].glyphs.push(glyph);
  } else {
    pool[mark] = { profileId: profile.id, glyphs: [glyph] };
  }
  setEntanglementMark(mark);
  savePool(pool);
  saveProfile(profile);
  return { partner };
}

function addEntanglementEdge(roleA, roleB, glyph) {
  const profile = loadProfile();
  const edge = { from: roleA, to: roleB, glyph };
  profile.entanglementMap.edges.push(edge);
  profile.entanglementMap.nodes[roleA] = true;
  profile.entanglementMap.nodes[roleB] = true;
  saveProfile(profile);
  return edge;
}

function getSigilArchive() {
  return loadProfile().sigilArchive;
}

function setEntanglementMark(mark) {
  const profile = loadProfile();
  profile.entanglementMark = mark;
  saveProfile(profile);
  return profile;
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
  attemptEntanglement,
  addEntanglementEdge,
  getSigilArchive,
  setEntanglementMark,
  pushCollapseSeed,
  popCollapseSeed,
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
