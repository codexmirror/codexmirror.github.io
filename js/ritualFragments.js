const fragments = {
  2: '/shards/ritual-fragments/whisper-spark.html',
  4: '/shards/ritual-fragments/whisper-flare.html',
  5: '/shards/ritual-fragments/whisper-thresh.html'
};

function showFragment(level) {
  if (typeof document === 'undefined') return;
  const src = fragments[level];
  if (!src) return;
  fetch(src).then(r => r.text()).then(html => {
    const div = document.createElement('div');
    div.className = 'ritual-whisper';
    div.innerHTML = html;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 4000);
  });
}

if (typeof module !== 'undefined' && module.exports) module.exports = { showFragment };
if (typeof window !== 'undefined') window.ritualFragments = { showFragment };
