const { resetProfile, loadProfile, recordLoop } = require('../WhisperEngine.v3/core/memory.js');
resetProfile();
for (let i = 0; i < 3; i++) {
  recordLoop('threshold');
}
const archive = loadProfile().sigilArchive;
if (archive.length === 0) throw new Error('emergent glyph not recorded');
console.log('emergence tests passed');
