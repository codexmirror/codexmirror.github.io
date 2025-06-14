const { registerPersona, stateManager } = require('../core/stateManager.js');
const { resetProfile, loadProfile, pushCollapseSeed } = require('../core/memory.js');

registerPersona('lantern', { compose: () => '', render: t => t });
resetProfile();
for(let i=0;i<3;i++) pushCollapseSeed('invocation');
const profile = loadProfile();
stateManager.init(profile);
stateManager.evaluate(profile);
if(stateManager.name() !== 'lantern') throw new Error('lantern persona expected');
console.log('lantern persona tests passed');
