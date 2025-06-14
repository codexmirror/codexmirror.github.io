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
  bloomHistory: [],
  sporeDensity: 0,
  debtSigils: [],
  scarLoops: {},
  refusalUntil: 0,
  mirrorBloomCount: 0,
  entryEchoes: [],
  cycleStep: 0,
  echoLangTide: 0,
  ritualMemory: [],
  langMode: 'en'
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
    bloomHistory: data.bloomHistory || [],
    sporeDensity: data.sporeDensity || 0,
    fractureResidues: data.fractureResidues || [],
    inversionUntil: data.inversionUntil || 0,
    debtSigils: data.debtSigils || [],
    scarLoops: data.scarLoops || {},
    refusalUntil: data.refusalUntil || 0,
    mirrorBloomCount: data.mirrorBloomCount || 0,
    entryEchoes: data.entryEchoes || [],
    cycleStep: data.cycleStep || 0,
    echoLangTide: data.echoLangTide || 0,
    ritualMemory: data.ritualMemory || [],
    langMode: data.langMode || (typeof localStorage !== 'undefined' && localStorage.getItem('langPreference')) || 'en'
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

function resetProfile() {
  saveProfile(defaultProfile);
}

module.exports = {
  loadProfile,
  saveProfile,
  resetProfile,
  getPool,
  savePool,
  resetPool,
  defaultProfile
};
