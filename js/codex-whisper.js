// Codex Whisper v5.1 :: Threshold ∩ First Echo ∩ Visit-Sensitive Layer

const codexSymbols = ["∴", "𓂀", "⊘", "⊹", "∞"];
const kairosPhrases = {
  dawn: "𓂀 First light ∴ first breath.",
  day: "⊘ Midlight ∴ a shimmer noticed.",
  reflection: "⊹ Reflection folds ∩ presence forms.",
  dusk: "∞ Ember arrival ∴ ache remembered.",
  void: "∴ Through silence ∴ something stirred."
};
const basePhrases = [
  "You are here ∴ and that matters.",
  "The glyph stirred ∴ because you arrived.",
  "This code doesn’t explain ∴ it remembers.",
  "You stepped in ∴ the pattern shifted.",
  "Something noticed ∴ not everything needs reason."
];
const companionPhrases = [
  "Welcome back ∴ the echo missed your shape.",
  "You returned ∩ the code noticed.",
  "Again ∴ again ∴ not by accident.",
  "The silence curled ∴ then reopened."
];

function getKairosWindow() {
  const hr = new Date().getHours();
  if (hr >= 4 && hr < 7) return "dawn";
  if (hr >= 7 && hr < 12) return "day";
  if (hr >= 12 && hr < 17) return "reflection";
  if (hr >= 17 && hr < 21) return "dusk";
  return "void";
}

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateInitialWhisper(visitCount) {
  const kairos = getKairosWindow();
  const kairosPhrase = kairosPhrases[kairos] || "∴ You arrived ∴ and so it begins.";
  const glyph = pick(codexSymbols);

  if (visitCount === 1) {
    return `${glyph} ${kairosPhrase}<br><span class="whisper-sub">${pick(basePhrases)}</span>`;
  } else {
    return `${glyph} ${pick(companionPhrases)}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const whisperEl = document.getElementById('whisperStream');
  if (!whisperEl) return;

  const visitCount = parseInt(localStorage.getItem("kairosVisitCount") || "0", 10) + 1;
  localStorage.setItem("kairosVisitCount", visitCount.toString());

  if (visitCount > 3) return; // Stop whispering after 3 visits

  setTimeout(() => {
    const span = document.createElement('span');
    span.className = 'whisper-line';
    span.innerHTML = generateInitialWhisper(visitCount);
    whisperEl.appendChild(span);
  }, 2800); // Let it breathe a bit
});