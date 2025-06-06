const { fragments, responseTemplates } = require('./memory.js');
const { mutatePhrase } = require('../utils/mutate.js');

function fillTemplate(template) {
  return template.replace(/\{(intro|mid|outro)\}/g, (_, key) => {
    const list = fragments[key];
    return list[Math.floor(Math.random() * list.length)];
  });
}

function buildPhrase(persona) {
  const temps = responseTemplates[persona] || responseTemplates.dream;
  const template = temps[Math.floor(Math.random() * temps.length)];
  return mutatePhrase(fillTemplate(template));
}

module.exports = { buildPhrase };
