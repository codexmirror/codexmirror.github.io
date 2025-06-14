const { resetProfile, recordLoop, loadProfile } = require('../core/memory.js');
const weather = require('../core/glyphWeather.js');

resetProfile();
for(let i=0;i<21;i++) recordLoop('invocation');
const current = weather.evaluate();
if(current !== 'storm') throw new Error('weather not storm after heavy use');
console.log('glyph weather tests passed');
