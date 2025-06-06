const storageKey = 'whisperProfile';
let nodeMemory = null;
const storage = typeof localStorage !== 'undefined'
  ? localStorage
  : {
      getItem: () => nodeMemory,
      setItem: (_key, val) => {
        nodeMemory = val;
      }
    };

const CANON_THRESHOLD = 42;
const EMERGENCE_THRESHOLD = 3;

const defaultProfile = {
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
  recentChain: [],
  lastLoopTime: 0
};

function loadProfile() {
  const data = JSON.parse(storage.getItem(storageKey) || '{}');
  return {
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
    recentChain: data.recentChain || [],
    lastLoopTime: data.lastLoopTime || 0
  };
}

function saveProfile(profile) {
  storage.setItem(storageKey, JSON.stringify(profile));
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
    if (chain.count >= EMERGENCE_THRESHOLD && !chain.emergent) {
      const name = `${chain.loops.join('-')}-${Date.now()}`;
      profile.sigilArchive.push({ name, originLoops: chain.loops, created: Date.now() });
      chain.emergent = name;
    }
  }
}

const fragments = {
  intro: [{ text: 'You arrive' }, { text: 'A shadow forms' }],
  mid: [{ text: '∴ echo' }, { text: '∴ ache' }],
  outro: [{ text: 'and it remembers' }, { text: 'await the next glyph' }]
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
  addEntanglementEdge,
  getSigilArchive,
  setEntanglementMark,
  resetProfile,
  reduceEntropy,
  checkEmergence,
  fragments,
  responseTemplates,
  CANON_THRESHOLD,
  EMERGENCE_THRESHOLD
};

module.exports.defaultProfile = defaultProfile;
