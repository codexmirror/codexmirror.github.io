const { applyCloak } = require('../WhisperEngine.v3/utils/cloak');
const result = applyCloak('hello', 1);
if (!result.startsWith('…')) throw new Error('cloak level 1');
console.log('cloak tests passed');
