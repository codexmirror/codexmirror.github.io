const { eventBus } = require('./eventBus.js');
let lastTime = 0;
let spam = 0;
const JAM_LIMIT = 5;
const WINDOW = 400;
const hotGlyphs = {};
function register(glyph) {
  const now = Date.now();
  if (now - lastTime < WINDOW) spam++; else spam = 1;
  lastTime = now;
  if (spam >= JAM_LIMIT) {
    hotGlyphs[glyph] = now + 3000;
    spam = 0;
    eventBus.emit('sigil:jam', { glyph });
    return true;
  }
  if (hotGlyphs[glyph] && now < hotGlyphs[glyph]) {
    return true;
  }
  return false;
}
module.exports = { register };
