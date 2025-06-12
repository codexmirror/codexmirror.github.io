let activeUntil = 0;
function trigger() {
  if (typeof document !== 'undefined') {
    document.body.classList.add('clown-loop');
    setTimeout(() => document.body.classList.remove('clown-loop'), 7000);
  }
  activeUntil = Date.now() + 7000;
}
function active() {
  return activeUntil > Date.now();
}

const api = { trigger, active };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') {
  window.clownHandler = api;
}
