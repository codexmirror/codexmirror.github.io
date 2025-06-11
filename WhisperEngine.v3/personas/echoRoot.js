const { buildPhrase } = require('../core/fragments.js');

const echoRoot = {
  compose(context) {
    const phrase = buildPhrase('echoRoot', 'anchor', context.kairos, context.loop);
    context.mutationLevel = phrase.level;
    return `echo-root resonates ${phrase.text}`;
  },
  render(text) {
    return `>${text}<`;
  }
};

module.exports = { echoRoot };
