const { resetProfile, loadProfile } = require('../WhisperEngine.v3/core/memory.js');
const { capture } = require('../WhisperEngine.v3/core/entryEcho.js');

resetProfile();
for(let i=0;i<5;i++) capture();
const tide = loadProfile().echoLangTide;
if (typeof tide !== 'number') throw new Error('echoLangTide missing');
console.log('echoLangTide test passed');
