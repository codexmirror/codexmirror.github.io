const { buildPhrase } = require('../core/fragments.js');

const dream = {
  compose(context) {
    const role = context.profile.roles[0];
    const phraseInfo = buildPhrase('dream', role, context.kairos, context.loop);
    context.mutationLevel = phraseInfo.level;
    const prefix = role ? `${role}, ` : '';
    return `${prefix}dreaming of ${phraseInfo.text}`;
  },
  render(text) {
    return `${text}…`;
  }
};

module.exports = { dream };
