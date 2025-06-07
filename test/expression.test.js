const assert = require('assert');
const { eventBus } = require('../WhisperEngine.v3/utils/eventBus');
const expression = require('../WhisperEngine.v3/core/expressionCore');
const profile = { visits: 6, entropy: 0 };

eventBus.emit('presence');
eventBus.emit('cloak:max');
const ctx = { profile };
const out = expression.processOutput('echo', ctx);
assert.ok(out.startsWith('»» Codex'), 'expression triggered');
console.log('expression tests passed');
