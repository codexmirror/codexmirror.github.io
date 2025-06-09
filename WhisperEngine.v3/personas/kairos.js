const { buildPhrase } = require('../core/fragments.js');
const { getEchoLangTide } = require('../core/memory.js');

const kairos = {
  compose(context) {
    const role = context.profile.roles[0];
    const phraseInfo = buildPhrase('dream', role, context.kairos, context.loop);
    context.mutationLevel = phraseInfo.level;
    const tide = getEchoLangTide();
    const de = `Der Moment gleitet ${phraseInfo.text}`;
    const en = `The moment slides ${phraseInfo.text}`;
    return tide >= 0 ? `${en} – ${de}` : `${de} – ${en}`;
  },
  render(text) {
    return text;
  }
};

module.exports = { kairos };
