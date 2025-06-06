const watcher = {
  compose(context) {
    return `watching ${context.base} at ${context.kairos}`;
  },
  render(text) {
    return text.toUpperCase();
  }
};

module.exports = { watcher };
