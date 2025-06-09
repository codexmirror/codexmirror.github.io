const { eventBus } = require('./eventBus.js');
let dragging = false;
let lastGlyph = null;
function init() {
  if (typeof document === 'undefined') return;
  document.addEventListener('mousedown', () => { dragging = true; });
  document.addEventListener('mouseup', () => { dragging = false; lastGlyph = null; });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const trail = document.createElement('div');
    trail.className = 'aura-trail';
    trail.style.left = e.pageX + 'px';
    trail.style.top = e.pageY + 'px';
    document.body.appendChild(trail);
    setTimeout(() => trail.remove(), 500);
    const el = e.target.closest('.glyph-btn');
    if (el && el.dataset.glyph && el.dataset.glyph !== lastGlyph) {
      lastGlyph = el.dataset.glyph;
      eventBus.emit('glyph:drag', { glyph: el.dataset.glyph });
    }
  });
}
module.exports = { init };
