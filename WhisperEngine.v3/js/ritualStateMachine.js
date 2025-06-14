class RitualStateMachine {
  constructor(chargeMod) {
    this.RC = chargeMod || (typeof require === 'function'
      ? require('./ritualCharge.js')
      : window.ritualCharge);

    // Hol dir den eventBus – sonst ist Emitten wie Rufen in den Abgrund
    this.eventBus = (typeof require === 'function'
      ? require('../utils/eventBus.js')
      : window.eventBus);

    this.reset();
  }

  emit(name, payload = {}) {
    if (this.eventBus && typeof this.eventBus.emit === 'function') {
      this.eventBus.emit(name, payload);
    } else {
      console.warn(`[ritualStateMachine] Failed to emit "${name}" – no eventBus`);
    }
  }

  addGlyph(g) {
    this.sequence.push(g);
    if (this.sequence.length > 5) this.sequence.shift();

    if (this.RC && this.RC.incrementCharge) {
      this.RC.incrementCharge(g);
    }

    if (this.sequence.length === 5) {
      this.state = 'complete';
      this.emit('ritual:complete', { sequence: this.getSequence() });
    } else {
      this.state = 'charging';
      this.emit('ritual:charge', { level: this.getCharge(), sequence: this.getSequence() });
    }

    return this.state;
  }

  reset() {
    this.sequence = [];
    if (this.RC && this.RC.resetCharge) this.RC.resetCharge();
    this.state = 'idle';
    this.emit('ritual:reset');
  }

  getState() {
    return this.state;
  }

  getSequence() {
    return this.sequence.slice();
  }

  getCharge() {
    return this.RC && this.RC.getCurrentCharge
      ? this.RC.getCurrentCharge()
      : this.sequence.length;
  }
}

// Singleton Export
const api = new RitualStateMachine();
if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
if (typeof window !== 'undefined') {
  window.ritualStateMachine = api;
}