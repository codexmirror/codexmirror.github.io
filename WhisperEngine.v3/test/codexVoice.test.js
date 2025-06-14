const assert = require('assert');
const voice = require('../core/codexVoice');

voice.activate(50);
const out = voice.filterOutput('hello');
assert.ok(['∴ listen','∵ awaken','∴∴ return'].includes(out), 'voice overrides output');
setTimeout(() => {
  const reverted = voice.filterOutput('hello');
  assert.strictEqual(reverted, 'hello', 'voice deactivated');
  console.log('codexVoice tests passed');
}, 60);
