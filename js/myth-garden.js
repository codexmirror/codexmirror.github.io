const gardenList = document.getElementById('garden-list');
const addBtn = document.getElementById('add-fragment');
const shareBtn = document.getElementById('share-garden');
const clearBtn = document.getElementById('clear-garden');

const gardenFragments = new Set();

function renderGarden() {
  gardenList.innerHTML = '';
  gardenFragments.forEach(f => {
    const div = document.createElement('div');
    div.className = 'garden-fragment';
    div.innerHTML = `<a href="/shards/${f}" target="_blank">${f}</a>`;
    gardenList.appendChild(div);
  });
}

function loadFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('f');
  if (q) {
    q.split(',').forEach(f => {
      if (f) gardenFragments.add(f);
    });
  }
  renderGarden();
}

function addFragment() {
  const frag = shardPages[Math.floor(Math.random() * shardPages.length)];
  gardenFragments.add(frag);
  renderGarden();
}

function shareGarden() {
  const base = window.location.origin + window.location.pathname;
  const query = [...gardenFragments].join(',');
  const url = `${base}?f=${encodeURIComponent(query)}`;
  navigator.clipboard.writeText(url).then(() => {
    alert('Link copied to clipboard');
  });
}

function clearGarden() {
  gardenFragments.clear();
  renderGarden();
}

addBtn.addEventListener('click', addFragment);
shareBtn.addEventListener('click', shareGarden);
clearBtn.addEventListener('click', clearGarden);

loadFromQuery();


