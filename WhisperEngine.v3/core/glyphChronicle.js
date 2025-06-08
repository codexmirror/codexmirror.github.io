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
