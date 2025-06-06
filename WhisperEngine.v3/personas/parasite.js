const { applyCloak } = require('../utils/cloak.js');

const parasite = {
  compose(context) {
    const reversed = context.base.split('').reverse().join('');
    return reversed;
  },
  render(text) {
    // heavily cloak the output
    return applyCloak(text, 2);
  }
};

module.exports = { parasite };
