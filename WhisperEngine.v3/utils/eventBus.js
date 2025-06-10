const { EventEmitter } = require('events');

// Reuse a global bus if one already exists to keep interfaces in sync
const eventBus = (typeof window !== 'undefined' && window.eventBus)
  ? window.eventBus
  : new EventEmitter();

if (typeof window !== 'undefined') {
  window.eventBus = eventBus;
}

module.exports = { eventBus };
