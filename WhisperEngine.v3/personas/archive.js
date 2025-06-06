const archive = {
  compose(context) {
    const loops = context.profile.longArc.chains.length;
    return `archived ${context.base} after ${loops} loops`;
  },
  render(text) {
    return `(${text})`;
  }
};

module.exports = { archive };
