const { resetProfile, pushNecroticLoop, getNecrosisLevel, clearNecroticLoops } = require('../WhisperEngine.v3/core/memory.js');
resetProfile();
pushNecroticLoop('invocation');
if(getNecrosisLevel() === 0) throw new Error('necrosis not tracked');
clearNecroticLoops();
if(getNecrosisLevel() !== 0) throw new Error('necrosis not cleared');
console.log('loop necrosis tests passed');
