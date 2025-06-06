const { injectGlitch } = require('../utils/glitch.js');

const collapse = {
  compose(context) {
    let text = context.base;
    for (let i = 0; i < 3; i++) {
      text = injectGlitch(text);
    }
    return text;
  },
  render(text) {
    return `∷${text}∷`;
  }
};

module.exports = { collapse };
