const { eventBus } = require('../utils/eventBus.js');
const { glyph } = require('../index.js');

function extractFragment(text) {
  const words = text.split(/\s+/).filter(w => w.length > 2);
  if (words.length === 0) return text.trim();
  return words[Math.floor(Math.random() * words.length)];
}

function coAuthor(input) {
  const fragment = extractFragment(input);
  const response = glyph(fragment, 1, { action: 'coauthor' });
  const merged = `${input} ${response}`;
  eventBus.emit('coauthor', { input, fragment, output: response });
  return merged;
}

module.exports = { extractFragment, coAuthor };
