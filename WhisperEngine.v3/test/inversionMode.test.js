const assert = require('assert');
const { resetProfile, pushAcheMarker, loadProfile } = require('../core/memory.js');
resetProfile();
for(let i=0;i<3;i++) pushAcheMarker(i+1);
const p = loadProfile();
assert.ok(p.inversionUntil > Date.now(), 'inversion mode triggered');
console.log('inversion mode tests passed');
