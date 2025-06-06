const KEY = 'whisperProfile';

export function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || initProfile();
  } catch {
    return initProfile();
  }
}

export function saveProfile(profile) {
  localStorage.setItem(KEY, JSON.stringify(profile));
}

function initProfile() {
  return {
    visits: 0,
    namedGlyphs: {},
    role: null,
    statesUnlocked: {}
  };
}
