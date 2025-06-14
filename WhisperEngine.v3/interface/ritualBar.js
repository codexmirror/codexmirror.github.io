const { eventBus } = require('../utils/eventBus.js');
const loops = require('../core/loops');
const { composeWhisper } = require('../core/responseLoop.js');

let bar;
let fill;

function getFill() {
  if (!fill && typeof document !== 'undefined') {
    fill = document.querySelector('#glyph-charge .fill');
  }
  return fill;
}

function pulse(level) {
  if (!bar) return;
  const aura = document.getElementById('personaAura');
  const overlay = document.createElement('span');
  overlay.className = 'ritual-pulse';
  overlay.style.background = aura ? window.getComputedStyle(aura).backgroundColor : 'rgba(200,200,255,0.2)';
  bar.appendChild(overlay);
  setTimeout(() => overlay.remove(), 500);
}

function reset() {
  const el = getFill();
  if (el) el.style.width = '0%';
}

function collapse() {
  if (!bar) return;
  bar.classList.add('collapse');
  setTimeout(() => bar.classList.remove('collapse'), 600);
}

function charge(level) {
  const el = getFill();
  if (el) el.style.width = `${level * 20}%`;
}

function memory({ count }) {
  if (!bar) return;
  if (count > 1) {
    bar.classList.add('memory-resonance');
    setTimeout(() => bar.classList.remove('memory-resonance'), 1200);
  }
}

function highlight(name) {
  if (!bar) return console.debug(`[ritualBar] ${name} triggered`);
  const item = bar.querySelector(`[data-loop="${name}"]`);
  if (!item) return;
  item.classList.add('active');
  setTimeout(() => item.classList.remove('active'), 600);
}

function init() {
  bar = typeof document !== 'undefined' ? document.getElementById('ritualBar') : null;
  if (!bar) {
    console.warn('[ritualBar] #ritualBar not found in DOM');
    return;
  }

  console.debug('[ritualBar] Initializing ritualBar UI');

  ['invocation', 'absence', 'naming', 'threshold', 'quiet'].forEach(name => {
    eventBus.on(`loop:${name}`, () => highlight(name));
  });

  eventBus.on('ritual:pulse', evt => pulse(evt.level));
  eventBus.on('ritual:complete', reset);
  eventBus.on('ritual:failure', collapse);
  eventBus.on('ritual:memory', memory);
  eventBus.on('ritual:charge', evt => charge(evt.level));

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

module.exports = { init };