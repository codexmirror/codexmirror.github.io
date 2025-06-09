const SEQ_LENGTH = 5;
let sequence = [];

function incrementCharge(glyph) {
  sequence.push(glyph);
  if (sequence.length > SEQ_LENGTH) {
    sequence = sequence.slice(-SEQ_LENGTH);
  }
  return sequence.length;
}

function resetCharge() {
  sequence = [];
}

function getCurrentCharge() {
  return sequence.length;
}

function isSequenceComplete(pattern = []) {
  if (pattern.length !== SEQ_LENGTH) return false;
  if (sequence.length !== SEQ_LENGTH) return false;
  for (let i = 0; i < SEQ_LENGTH; i++) {
    if (sequence[i] !== pattern[i]) return false;
  }
  return true;
}

const api = { incrementCharge, resetCharge, getCurrentCharge, isSequenceComplete };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') window.ritualCharge = api;
