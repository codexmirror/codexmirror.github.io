const { resetProfile, recordGlyphDrift, getDriftVariant } = require('../WhisperEngine.v3/core/memory.js');
resetProfile();
recordGlyphDrift('1','2');
recordGlyphDrift('1','2');
recordGlyphDrift('1','2');
const v = getDriftVariant('2','1');
if(v === '2') throw new Error('drift variant missing');
console.log('glyph drift tests passed');
