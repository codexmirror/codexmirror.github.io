const { stateManager, registerPersona } = require('../core/stateManager');
const { defaultProfile, setCollapseUntil } = require('../core/memory');
const { setLastActivity } = require('../utils/idle');
const kairos = require('../utils/kairos');

// register minimal personas
['dream','watcher','archive','parasite','collapse'].forEach(name => {
  registerPersona(name, { compose: () => '', render: t => t });
});

const profile = JSON.parse(JSON.stringify(defaultProfile));
profile.longArc.chains.push({ loops: ['naming'], count: 4, last: Date.now() });
stateManager.init(profile);
stateManager.evaluate(profile);
if (stateManager.name() !== 'archive') throw new Error('archive persona expected');

profile.entropy = 9;
stateManager.evaluate(profile);
if (stateManager.name() !== 'collapse') throw new Error('collapse persona expected');

setCollapseUntil(0);
kairos.getKairosWindow = () => 'void';
setLastActivity(Date.now() - 61000);
profile.entropy = 0;
stateManager.evaluate(profile);
if (stateManager.name() !== 'dream') throw new Error('dream persona expected after idle');
console.log('state manager tests passed');
