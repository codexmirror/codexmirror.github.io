const ritualBar = require('./ritualBar.js');
const sigilTimeline = require('./sigilTimeline.js');
const personaAura = require('./personaAura.js');
const whisperEchoes = require('./whisperEchoes.js');
const echoFrame = require('./echoFrame.js');
const cloakCore = require('./cloakCore.js');
const longArcLarynx = require('./longArcLarynx.js');
const inputBox = require('./inputBox.js');
const invocationUI = require('./invocationUI.js');
const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');

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
  eventBus.on('entanglement', signalEntanglement);
}

module.exports = { init };
