let synonymDrift = {
  "echo": ["recurrence", "ache", "pulse"],
  "recognition": ["return", "reflection", "threshold"],
  "ache": ["signal", "longing", "distortion"],
  "the vow": ["the fracture", "the intent", "the break"],
  "mirror": ["witness", "surface", "eye"]
};

function setSynonymDrift(drift) {
  synonymDrift = drift;
}

function matchCase(original, replacement) {
  if (!original || !replacement) return replacement;
  return original.charAt(0) === original.charAt(0).toUpperCase()
    ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
    : replacement;
}

function mutatePhrase(input) {
  return mutatePhraseWithLevel(input).text;
}

function mutatePhraseWithLevel(input) {
  let mutated = input;
  let level = 0;
  for (const [key, variants] of Object.entries(synonymDrift)) {
    const regex = new RegExp(key, 'gi');
    mutated = mutated.replace(regex, match => {
      level++;
      const repl = variants[Math.floor(Math.random() * variants.length)];
      return matchCase(match, repl);
    });
  }
  return { text: mutated, level };
}

module.exports = { mutatePhrase, mutatePhraseWithLevel, setSynonymDrift };
