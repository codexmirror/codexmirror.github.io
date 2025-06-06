const logContainer = document.getElementById('log-entries');

function renderLog() {
  const logs = JSON.parse(localStorage.getItem('ritualLogs') || '[]');
  logContainer.innerHTML = '';
  logs.slice(-50).reverse().forEach(entry => {
    const div = document.createElement('div');
    div.className = 'log-entry';
    const date = new Date(entry.time);
    div.textContent = `${date.toLocaleString()} ∴ ${entry.glyph}`;
    logContainer.appendChild(div);
  });
}

document.addEventListener('DOMContentLoaded', renderLog);
