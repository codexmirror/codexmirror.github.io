import { fragments } from '../config/fragments.js';
import { templates } from '../config/templates.js';

export function composePhrase(state, extra = {}) {
  const template = templates[Math.floor(Math.random() * templates.length)];
  const data = {
    verb: pick(fragments.verbs),
    symbol: pick(fragments.symbols),
    intensifier: pick(fragments.intensifiers),
    temporal: pick(fragments.temporal),
    noun: extra.noun || '',
    ...extra
  };
  return template.replace(/\{(\w+)\}/g, (_, key) => data[key] || '');
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
