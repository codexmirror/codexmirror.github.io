import { switchPersona, getPersonaName } from './personaSwitch.js';
import { composePhrase } from './phraseComposer.js';
import { renderWhisper } from './domInterface.js';
import { loadProfile, saveProfile } from './userMemory.js';

let profile = loadProfile();

export function glyphInvocation(glyph) {
  profile.namedGlyphs[glyph] = (profile.namedGlyphs[glyph] || 0) + 1;
  if (profile.namedGlyphs[glyph] > 3) {
    switchPersona('Threshold');
  }
  saveProfile(profile);
  const text = composePhrase(getPersonaName(), { noun: glyph });
  renderWhisper(text);
}
