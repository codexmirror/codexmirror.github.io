const { resetProfile, loadProfile } = require('../core/memory.js');
const { capture } = require('../core/entryEcho.js');

resetProfile();
for(let i=0;i<5;i++) capture();
const tide = loadProfile().echoLangTide;
if (typeof tide !== 'number') throw new Error('echoLangTide missing');
console.log('echoLangTide test passed');
