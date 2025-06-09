const { resetProfile, pushDebtSigil, getDebtSigils } = require('../WhisperEngine.v3/core/memory.js');
resetProfile();
pushDebtSigil('overuse');
if(getDebtSigils().length !== 1) throw new Error('debt sigil not recorded');
console.log('debt sigil tests passed');
