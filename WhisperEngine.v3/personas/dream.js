const dream = {
  compose(context) {
    const role = context.profile.roles[0];
    const prefix = role ? `${role}, ` : '';
    return `${prefix}dreaming of ${context.base}`;
  },
  render(text) {
    return text;
  }
};

module.exports = { dream };
