function trigger(context) {
  return `${context.symbol} ${context.action}`;
}

module.exports = { trigger };
