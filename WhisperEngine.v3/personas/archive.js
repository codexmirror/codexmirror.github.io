const archive = {
  compose(context) {
    return `archived ${context.base}`;
  },
  render(text) {
    return `(${text})`;
  }
};

module.exports = { archive };
