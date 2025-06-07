const { buildPhrase } = require('../core/fragments.js');

const archive = {
  compose(context) {
    const loops = context.profile.longArc.chains.length;
    const role = context.profile.roles[0];
    const phraseInfo = buildPhrase('archive', role, context.kairos);
    context.mutationLevel = phraseInfo.level;
    return `archived ${phraseInfo.text} after ${loops} loops`;
  },
  render(text) {
    return `(${text})`;
  }
};

module.exports = { archive };
