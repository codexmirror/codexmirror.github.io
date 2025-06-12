class RitualStateMachine {
  constructor(chargeMod) {
    this.RC = chargeMod || (typeof require === 'function'
      ? require('./ritualCharge.js')
      : window.ritualCharge);
    this.reset();
  }

  addGlyph(g) {
    this.sequence.push(g);
    if (this.sequence.length > 5) this.sequence.shift();
    this.RC.incrementCharge(g);
    if (this.sequence.length === 5) {
      this.state = 'complete';
    } else {
      this.state = 'charging';
    }
    return this.state;
  }

  reset() {
    this.sequence = [];
    if (this.RC && this.RC.resetCharge) this.RC.resetCharge();
    this.state = 'idle';
  }

  getState() { return this.state; }
  getSequence() { return this.sequence.slice(); }
  getCharge() { return this.RC ? this.RC.getCurrentCharge() : this.sequence.length; }
}

const api = new RitualStateMachine();
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') window.ritualStateMachine = api;
