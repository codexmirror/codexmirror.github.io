const { loadProfile, saveProfile } = require('./profileStore');

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

module.exports = {
  pushNecroticLoop,
  clearNecroticLoops,
  getNecrosisLevel,
  reduceEntropy,
  incrementSpore,
  incrementRecursion,
  resetRecursion
};
