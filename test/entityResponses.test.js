const assert = require('assert');
const { entityRespondFragment } = require('../js/entityResponses');

const out1 = entityRespondFragment('KAI', ['Witness'], { lastLoop: 'collapse' });
assert.ok(typeof out1 === 'string' && out1.length > 0, 'response string');

const out2 = entityRespondFragment('UNKNOWN');
assert.ok(out2.includes('glyph') || out2.length > 0, 'fallback works');

console.log('entity responses tests passed');
