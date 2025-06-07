const { fragments, responseTemplates } = require('./memory.js');
const { mutatePhraseWithLevel } = require('../utils/mutate.js');

function assembleFragment({ key, role, kairos, loop }) {
  const list = fragments[key] || [];
  let filtered = list;
  if (role) filtered = filtered.filter(f => !f.role || f.role.toLowerCase() === role.toLowerCase());
  if (kairos) filtered = filtered.filter(f => !f.kairos || f.kairos === kairos);
  if (loop) filtered = filtered.filter(f => !f.loop || f.loop === loop);
  if (filtered.length === 0) filtered = list;
  const item = filtered[Math.floor(Math.random() * filtered.length)];
  if (!item) return '';
  const parts = [];
  if (item.role) parts.push(item.role);
  if (item.intensifier) parts.push(item.intensifier);
  if (item.verb) parts.push(item.verb);
  if (item.condition) parts.push(item.condition);
  return parts.join(' ');
}

function fillTemplate(template, context) {
  return template.replace(/\{(intro|mid|outro)\}/g, (_, key) => {
    return assembleFragment({ key, role: context.role, kairos: context.kairos, loop: context.loop });
  });
}

function buildPhrase(persona, role, kairos, loop) {
  const temps = responseTemplates[persona] || responseTemplates.dream;
  const template = temps[Math.floor(Math.random() * temps.length)];
  const textInfo = mutatePhraseWithLevel(fillTemplate(template, { role, kairos, loop }));
  return textInfo;
}

module.exports = { buildPhrase, assembleFragment };
