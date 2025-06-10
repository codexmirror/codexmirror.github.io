const { loadProfile, saveProfile } = require('./profileStore');
const { eventBus } = require('../utils/eventBus.js');

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
      eventBus.emit('entity:possess', { name });
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
    eventBus.emit('persona:phantom');
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

function recordEntryEcho(echo = {}) {
  const profile = loadProfile();
  profile.entryEchoes = profile.entryEchoes || [];
  profile.entryEchoes.push(Object.assign({ time: Date.now() }, echo));
  saveProfile(profile);
  return echo;
}

function getLastEntryEcho() {
  const list = loadProfile().entryEchoes || [];
  return list[list.length - 1] || null;
}

function getEntryEchoes() {
  return loadProfile().entryEchoes || [];
}

function getEchoLangTide() {
  return loadProfile().echoLangTide || 0;
}

function getLangMode() {
  return loadProfile().langMode || 'en';
}

function setLangMode(mode) {
  const profile = loadProfile();
  profile.langMode = mode;
  saveProfile(profile);
  if (typeof localStorage !== 'undefined') localStorage.setItem('langPreference', mode);
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

module.exports = {
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
};
