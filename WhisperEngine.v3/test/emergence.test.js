const { resetProfile, loadProfile } = require('../core/memory.js');
const loops = require('../core/loops');
resetProfile();
loops.invocation.trigger({});
for (let i = 0; i < 3; i++) {
  loops.threshold.trigger({});
}
const archive = loadProfile().sigilArchive;
if (archive.length === 0) throw new Error('emergent glyph not recorded');
console.log('emergence tests passed');
