const watcher = {
  compose(context) {
    return `watching ${context.base}`;
  },
  render(text) {
    return text.toUpperCase();
  }
};

module.exports = { watcher };
