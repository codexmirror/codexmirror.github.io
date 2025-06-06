const { stateManager } = require('./stateManager.js');
const { buildPhrase } = require('./fragments.js');
const { recordVisit } = require('./memory.js');

function composeWhisper() {
  const profile = recordVisit();
  const persona = stateManager.name();
  const phrase = buildPhrase(persona);
  console.log(`[${persona}] ${phrase}`); // placeholder for DOM update
  return phrase;
}

module.exports = { composeWhisper };
