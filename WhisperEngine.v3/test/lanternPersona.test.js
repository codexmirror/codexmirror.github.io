const { registerPersona, stateManager } = require('../WhisperEngine.v3/core/stateManager.js');
const { resetProfile, loadProfile, pushCollapseSeed } = require('../WhisperEngine.v3/core/memory.js');

registerPersona('lantern', { compose: () => '', render: t => t });
resetProfile();
for(let i=0;i<3;i++) pushCollapseSeed('invocation');
const profile = loadProfile();
stateManager.init(profile);
stateManager.evaluate(profile);
if(stateManager.name() !== 'lantern') throw new Error('lantern persona expected');
console.log('lantern persona tests passed');
