export function renderWhisper(text) {
  const container = document.getElementById('whisperStream');
  if (!container) return;
  const span = document.createElement('span');
  span.className = 'whisper-line';
  span.textContent = text;
  container.appendChild(span);
}
