const { processInput } = require('../WhisperEngine.v3/core/responseLoop');
const { registerPersona, stateManager } = require('../WhisperEngine.v3/core/stateManager');

// register a simple persona for testing
registerPersona('dream', { compose: c => c.base, render: t => t });
stateManager.shift('dream');
const output = processInput('echo');
if (typeof output !== 'string') throw new Error('processInput failed');
console.log('responseLoop tests passed');
