const { processInput } = require('../core/responseLoop');
const { registerPersona, stateManager } = require('../core/stateManager');

// register a simple persona for testing
registerPersona('dream', {
  compose: ctx => {
    ctx.mutationLevel = 0;
    return 'test whisper';
  },
  render: t => t
});
stateManager.shift('dream');
const output = processInput('echo');
if (typeof output !== 'string') throw new Error('processInput failed');
console.log('responseLoop tests passed');
