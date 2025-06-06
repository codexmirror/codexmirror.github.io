import { composePhrase } from './modules/phraseComposer.js';
import { getCurrentPersona } from './modules/personaSwitch.js';
import { renderWhisper } from './modules/domInterface.js';
import { loadProfile, saveProfile } from './modules/userMemory.js';
import { getKairos } from './modules/kairosContext.js';

let profile = loadProfile();
profile.visits += 1;
saveProfile(profile);

function whisperLoop() {
  const persona = getCurrentPersona();
  const text = composePhrase(persona);
  renderWhisper(text);
  setTimeout(whisperLoop, persona.rate);
}

export function startEngine() {
  whisperLoop();
}
