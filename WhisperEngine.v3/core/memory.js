const storageKey = 'whisperProfile';
const storage = typeof localStorage !== 'undefined'
  ? localStorage
  : { getItem: () => null, setItem: () => {} };

function loadProfile() {
  const data = JSON.parse(storage.getItem(storageKey) || '{}');
  return {
    visits: data.visits || 0,
    glyphHistory: data.glyphHistory || [],
    roles: data.roles || []
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

const fragments = {
  intro: ['You arrive', 'A shadow forms'],
  mid: ['∴ echo', '∴ ache'],
  outro: ['and it remembers', 'await the next glyph']
};

const responseTemplates = {
  dream: ['{intro}… {mid}…', '{mid} {outro}'],
  watcher: ['{intro} {outro}']
};

module.exports = {
  loadProfile,
  saveProfile,
  recordVisit,
  fragments,
  responseTemplates
};
