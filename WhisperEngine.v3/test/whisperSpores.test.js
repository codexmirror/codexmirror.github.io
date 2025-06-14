const { resetProfile, incrementSpore, loadProfile } = require('../core/memory.js');
resetProfile();
incrementSpore();
const p = loadProfile();
if(p.sporeDensity !== 1) throw new Error('spore count missing');
console.log('whisper spores tests passed');
