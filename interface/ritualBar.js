const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');
const loops = require('../WhisperEngine.v3/core/loops');
const { composeWhisper } = require('../WhisperEngine.v3/core/responseLoop.js');
let bar;

function highlight(name) {
  if (!bar) return console.log(`[ritualBar] ${name} triggered`);
  const item = bar.querySelector(`[data-loop="${name}"]`);
  if (!item) return;
  item.classList.add('active');
  setTimeout(() => item.classList.remove('active'), 600);
}

function init() {
  bar = typeof document !== 'undefined' ? document.getElementById('ritualBar') : null;
  ['invocation', 'absence', 'naming', 'threshold', 'quiet'].forEach(name => {
    eventBus.on(`loop:${name}`, () => highlight(name));
  });

  if (bar) {
    bar.addEventListener('click', evt => {
      const el = evt.target.closest('li[data-loop]');
      if (!el) return;
      const name = el.getAttribute('data-loop');
      const loop = loops[name];
      if (loop && typeof loop.trigger === 'function') {
        loop.trigger({});
        composeWhisper(name);
      }
    });
  }
}

module.exports = { init };
