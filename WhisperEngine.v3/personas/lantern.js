const { buildPhrase } = require('../core/fragments.js');

const lantern = {
  compose(context) {
    const phrase = buildPhrase('lantern', 'guide', context.kairos, context.loop);
    context.mutationLevel = phrase.level;
    return `lantern glows ${phrase.text}`;
  },
  render(text) {
    return `~${text}~`;
  }
};

module.exports = { lantern };
