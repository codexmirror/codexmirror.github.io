function triggerExtendedBloom(entityId) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(entityId);
  if (!el) return;
  el.classList.add('extended-bloom');
  setTimeout(() => el.classList.remove('extended-bloom'), 4000);
}

function initiateAmbientOverlay(state) {
  if (typeof document === 'undefined') return;
  const body = document.body;
  body.classList.add(`ambient-${state}`);
  setTimeout(() => body.classList.remove(`ambient-${state}`), 4000);
}

const api = { triggerExtendedBloom, initiateAmbientOverlay };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') window.summonEffects = api;
