const { buildPhrase } = require('../core/fragments.js');

const watcher = {
  compose(context) {
    const role = context.profile.roles[0];
    const phraseInfo = buildPhrase('watcher', role, context.kairos, context.loop);
    context.mutationLevel = phraseInfo.level;
    return `watching ${phraseInfo.text} at ${context.kairos}`;
  },
  render(text) {
    return text.toUpperCase() + ':';
  }
};

module.exports = { watcher };
