const bloom = (typeof require === 'function' ? require('./bloomController.js') : window.bloomController);
const audio = (typeof require === 'function' ? require('./audioLayer.js') : window.audioLayer);

function updateReveal(stage) {
  const fill = typeof document !== 'undefined' && document.querySelector('#glyph-charge .fill');
  if (fill) fill.style.width = (stage * 20) + '%';
  if (bloom && bloom.setLevel) bloom.setLevel(stage);
  if (audio && audio.updateCharge) audio.updateCharge(stage);
}

function resetUI() {
  updateReveal(0);
}

module.exports = { updateReveal, resetUI };

if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') window.invocationController = api;
