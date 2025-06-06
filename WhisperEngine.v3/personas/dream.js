const dream = {
  compose(context) {
    return `dreaming of ${context.base}`;
  },
  render(text) {
    return text;
  }
};

module.exports = { dream };
