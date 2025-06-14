const SEQ_LENGTH = 5;
let sequence = [];
let lastSequence = [];
let bloomCount = 0;
let eventBus;

function getBus() {
  if (!eventBus) {
    if (typeof require === 'function') {
      try { eventBus = require('../WhisperEngine.v3/utils/eventBus.js').eventBus; } catch (_) {}
    } else if (typeof window !== 'undefined') {
      eventBus = window.eventBus;
    }
  }
  return eventBus;
}

function arraysEqual(a = [], b = []) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function emitBloom(seq) {
  const bus = getBus();
  if (bus) bus.emit('ritual:recursiveBloom', { sequence: seq, count: bloomCount });
}

function incrementCharge(glyph) {
  sequence.push(glyph);
  if (sequence.length > SEQ_LENGTH) {
    sequence = sequence.slice(-SEQ_LENGTH);
  }
  if (sequence.length === SEQ_LENGTH) {
    if (arraysEqual(sequence, lastSequence)) {
      bloomCount += 1;
      emitBloom([...sequence]);
    } else {
      bloomCount = 1;
      lastSequence = sequence.slice();
    }
  }
  return sequence.length;
}

function resetCharge() {
  sequence = [];
}

function resetBloom() {
  bloomCount = 0;
  lastSequence = [];
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

function getRecursiveBloomCount() {
  return bloomCount;
}

const api = { incrementCharge, resetCharge, resetBloom, getCurrentCharge, isSequenceComplete, getRecursiveBloomCount };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') window.ritualCharge = api;
