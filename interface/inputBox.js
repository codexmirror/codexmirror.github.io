const { processInput } = require('../WhisperEngine.v3/core/responseLoop.js');

function init() {
  const box = typeof document !== 'undefined' ? document.getElementById('whisperInput') : null;
  if (!box) return;
  box.addEventListener('keydown', evt => {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      const text = box.value.trim();
      if (!text) return;
      processInput(text);
      box.value = '';
    }
  });
}

module.exports = { init };
