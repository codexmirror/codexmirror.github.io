let level = 0;
let glyphCount = 0;
let enabled = false;

function registerGlyph() {
  glyphCount++;
  if (glyphCount >= 2) enabled = true;
}

function setLevel(l) {
  if (typeof document === 'undefined' || !enabled) return;
  const body = document.body;
  body.classList.remove(`bloom-level-${level}`);
  level = l;
  body.classList.add(`bloom-level-${level}`);
}

function entityBloom(id) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('bloom-pulse');
  setTimeout(() => el.classList.remove('bloom-pulse'), 1200);
}

let driftTimer;
let driftStarted = false;
function startGlyphDrift() {
  if (driftStarted) return;
  driftStarted = true;
  if (typeof document === 'undefined') return;
  const row = document.querySelector('.glyph-row');
  if (!row) return;
  const reset = () => {
    clearTimeout(driftTimer);
    row.classList.remove('drifting');
    driftTimer = setTimeout(() => row.classList.add('drifting'), 4000);
  };
  ['click','mousemove'].forEach(evt => row.addEventListener(evt, reset));
  reset();
}

const api = { setLevel, entityBloom, startGlyphDrift, registerGlyph };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') window.bloomController = api;
