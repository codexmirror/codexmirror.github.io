const ritualBar = require('./ritualBar.js');
const sigilTimeline = require('./sigilTimeline.js');
const personaAura = require('./personaAura.js');
const whisperEchoes = require('./whisperEchoes.js');
const echoFrame = require('./echoFrame.js');
const cloakCore = require('./cloakCore.js');
const longArcLarynx = require('./longArcLarynx.js');
const inputBox = require('./inputBox.js');
const invocationUI = require('./invocationUI.js');
const auraTracker = require('../utils/auraTracker.js');
const { eventBus } = require('../utils/eventBus.js');
const echoMask = require('./echoMask.js');
const kairosWindow = require('./kairosWindow.js');

function signalEntanglement() {
  const aura = document.getElementById('personaAura');
  if (!aura) return console.log('[entanglement] link formed');
  aura.classList.add('entangled');
  setTimeout(() => aura.classList.remove('entangled'), 1000);
}

function init() {
  ritualBar.init();
  sigilTimeline.init();
  personaAura.init();
  whisperEchoes.init();
  echoFrame.init();
  cloakCore.init();
  longArcLarynx.init();
  inputBox.init();
  invocationUI.init();
  auraTracker.init();
  echoMask.init();
  kairosWindow.init();
  eventBus.on('entanglement', signalEntanglement);
  eventBus.on('skin:invert', () => {
    if (typeof document === 'undefined') return;
    document.body.classList.add('inversion-mode');
    setTimeout(() => document.body.classList.remove('inversion-mode'), 15000);
  });
  eventBus.on('persona:phantom', () => {
    if (typeof document === 'undefined') return;
    document.body.classList.add('phantom-layer');
    setTimeout(() => document.body.classList.remove('phantom-layer'), 60000);
  });
  eventBus.on('loop:necrosis', () => {
    if (typeof document === 'undefined') return;
    document.body.classList.add('necrotic');
  });
}

module.exports = { init };
