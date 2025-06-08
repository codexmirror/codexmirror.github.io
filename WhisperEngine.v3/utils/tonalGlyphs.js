let tones = {};

function init() {
  if (typeof Audio === 'undefined') return;
  tones.init = new Audio('media/init-chime.mp3');
  tones.echo = new Audio('media/echo-murmur.mp3');
  tones.seal = new Audio('media/seal-chime.mp3');
  tones.bloom = new Audio('media/bloom-chime.mp3');
}

function playChime(kind) {
  const t = tones[kind];
  if (!t) return;
  t.currentTime = 0;
  t.play().catch(() => {});
}

init();

module.exports = { playChime };
if (typeof window !== 'undefined') window.tonalGlyphs = { playChime };
