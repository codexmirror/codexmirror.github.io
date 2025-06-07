const { applyCloak } = require('../utils/cloak.js');
const { buildPhrase } = require('../core/fragments.js');

const parasite = {
  compose(context) {
    const role = context.profile.roles[0];
    const phraseInfo = buildPhrase('parasite', role, context.kairos, context.loop);
    context.mutationLevel = phraseInfo.level;
    const reversed = phraseInfo.text.split('').reverse().join('');
    return reversed;
  },
  render(text) {
    // heavily cloak the output
    return applyCloak(text, 2);
  }
};

module.exports = { parasite };
