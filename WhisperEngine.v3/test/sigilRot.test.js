const assert = require('assert');
const { recordGlyphUse, isGlyphRotted, resetProfile } = require('../core/memory.js');

resetProfile();
for (let i = 0; i < 21; i++) {
  recordGlyphUse('decay');
}
assert.ok(isGlyphRotted('decay'), 'glyph marked as rotted after repeated use');
console.log('sigil rot tests passed');
