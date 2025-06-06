function applyCloak(text, level = 0) {
  if (level <= 0) return text;
  if (level === 1) {
    return '…' + text;
  }
  // deeper levels distort heavily
  return text
    .split('')
    .map(ch => (Math.random() > 0.3 ? ch : '∷'))
    .join('');
}

module.exports = { applyCloak };
