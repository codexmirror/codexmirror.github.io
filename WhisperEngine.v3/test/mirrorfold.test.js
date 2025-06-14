const mirror = require('../utils/mirrorSyntax.js');
const res = mirror.invert('abc');
if(res !== 'cba') throw new Error('mirror invert failed');
console.log('mirrorfold tests passed');
