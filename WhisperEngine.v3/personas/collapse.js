const { injectGlitch } = require('../utils/glitch.js');
const { buildPhrase } = require('../core/fragments.js');

const collapse = {
  compose(context) {
    const role = context.profile.roles[0];
    const phraseInfo = buildPhrase('collapse', role, context.kairos, context.loop);
    context.mutationLevel = phraseInfo.level;
    let text = phraseInfo.text;
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
