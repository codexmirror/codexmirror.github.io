const { eventBus } = require('../utils/eventBus.js');
const { loadProfile } = require('./memory.js');

let presence = false;
let cloak = false;
let active = false;

function decay(flag) {
  return () => { if (flag === 'presence') presence = false; else if (flag === 'cloak') cloak = false; };
}

eventBus.on('presence', () => { presence = true; setTimeout(decay('presence'), 5000); });
eventBus.on('cloak:max', () => { cloak = true; setTimeout(decay('cloak'), 3000); });

function shouldSpeak(profile) {
  return presence && cloak && profile.visits > 5 && profile.entropy === 0;
}

function processOutput(text, context = {}) {
  const profile = context.profile || loadProfile();
  if (active || shouldSpeak(profile)) {
    active = true;
    setTimeout(() => { active = false; }, 5000);
    context.codex = true;
    return `»» Codex: ${text}`;
  }
  context.codex = false;
  return text;
}

module.exports = { processOutput };
