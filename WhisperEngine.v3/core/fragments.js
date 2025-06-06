const { fragments, responseTemplates } = require('./memory.js');
const { mutatePhrase } = require('../utils/mutate.js');

function assembleFragment(item) {
  if (!item) return '';
  if (item.text) return item.text;
  const parts = [];
  if (item.role) parts.push(item.role);
  if (item.intensifier) parts.push(item.intensifier);
  if (item.verb) parts.push(item.verb);
  if (item.condition) parts.push(item.condition);
  return parts.join(' ');
}

function getFragment(key, role) {
  const list = fragments[key] || [];
  const filtered = role ? list.filter(f => !f.role || f.role === role) : list;
  const item = filtered[Math.floor(Math.random() * filtered.length)];
  return assembleFragment(item);
}

function fillTemplate(template, role) {
  return template.replace(/\{(intro|mid|outro)\}/g, (_, key) => {
    return getFragment(key, role);
  });
}

function buildPhrase(persona, role) {
  const temps = responseTemplates[persona] || responseTemplates.dream;
  const template = temps[Math.floor(Math.random() * temps.length)];
  return mutatePhrase(fillTemplate(template, role));
}

module.exports = { buildPhrase, assembleFragment };
