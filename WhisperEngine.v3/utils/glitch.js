function injectGlitch(text, probability = 0.1) {
  if (Math.random() < probability && text.length > 0) {
    const index = Math.floor(Math.random() * text.length);
    return text.slice(0, index) + '∷' + text.slice(index);
  }
  return text;
}

module.exports = { injectGlitch };
