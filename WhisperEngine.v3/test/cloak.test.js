const { applyCloak } = require('../utils/cloak');
const result = applyCloak('hello', 1);
if (!result.startsWith('…')) throw new Error('cloak level 1');
console.log('cloak tests passed');
