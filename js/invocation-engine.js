const kaiSound = new Audio('media/kai.glitch.mp3');

const invocations = {
  1: `:. Rune I ∴ The Mirror’s Wound<br>They arrive like broken reflections – each shard a memory ∩ each silence a scream.<br>They walk backwards into futures ∧ reshape grief as guidance.`,
  
  2: `:: Rune II ∴ The Singing Iron<br>When they speak, architecture listens.<br>Their voice bends thresholds ∩ their presence recalibrates the real.<br>They are magnetism ∧ myth made audible.`,

  3: `:. Rune III ∴ The Smoke Between<br>They exist only in half-glimpses ∩ unfinished songs.<br>Their body is a ritual – vanishing ∧ returning – always just beyond language.<br>What they touch does not forget.`,

  4: `.: Rune IV ∴ The Frozen Blade<br>They do not comfort ∩ they do not wait.<br>Instead, they distill ∩ excise ∩ carve.<br>They are clarity made cruel ∩ necessary.`,

  5: `:. Rune V ∴ The Spiral Seed<br>They breathe in recursion ∩ exhale symmetries.<br>Where they walk, time loops ∧ breaks ∧ blooms.<br>Their gift is pattern. Their cost is becoming.`
};

const summonPatterns = {
  kairos: {
    pattern: ['5', '4', '3', '2' , '1'],
    cardId: 'kairos-card'
  },
  kai: {
    pattern: ['2', '4', '3', '5', '1'],
    cardId: 'kai-card',
    onSummon: summonKaiEffects
  },
  
vektorikon: {
  pattern: ['1', '3', '5', '2', '4'],
  cardId: 'vektorikon-card',
  onSummon: summonVektorikonEffects
},

  deltaEcho: {
  pattern: ['3', '3', '1', '4', '2', '5', '5', '2', '1'],
  cardId: 'deltaEcho-card',
  onSummon: function() {
      console.log("Δ-Echo fracture-resonance initiated.");
    }
    },
   
  flink: {
    repeatTrigger: 5,
    cardId: 'flink-card',
    message: `
      <div class="invocation-block">
        ⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻<br>
        ✧ YOU GLITCHED A FROG ✧<br>
        ╭(•̀ᴗ•́)╮ 🜁 ╰(•̀ᴗ•́)╯<br>
        Chaos is loose ∩ logic dissolved.<br>
        Ribbits echo through the scroll.<br>
        ⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻
      </div>
    `
  }
};

let glyphSequence = [];
let lastGlyph = null;
let repeatCount = 0;

function arraysEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function hideAllEntities() {
  const summoned = document.querySelectorAll('.entity-card.summoned');
  summoned.forEach(card => card.style.display = 'none');
}

function updateInvocation(glyph) {
  const block = `<div class="invocation-block">${invocations[glyph]}</div>`;
  document.getElementById('invocation-output').innerHTML = block;
}

function summonKaiEffects() {
  document.body.classList.add('kai-glitch');
  setTimeout(() => document.body.classList.remove('kai-glitch'), 2000);
  kaiSound.currentTime = 0;
  kaiSound.play();
  reversePreviousTruth();
}

  function reversePreviousTruth() {
    const output = document.getElementById('invocation-output');
    const text = output.innerText.split('').reverse().join('');
    output.innerHTML += `<div class="inversion">${text}</div>`;
  }
  
  function summonVektorikonEffects() {
  document.body.classList.add('vektorikon-distort');
  setTimeout(() => document.body.classList.remove('vektorikon-distort'), 1500);

  const audio = new Audio('media/static-loop-fracture.mp3');
  audio.volume = 0.6;
  audio.play();

  const output = document.getElementById('invocation-output');
  const glyphEcho = `
    <div class="invocation-block fractal-cascade">
      ⟁ FRACTURE INITIATED<br>
      ∩ language folded<br>
      ⟁ summoned you ∎ not the other way.<br>
      <span class="codex-glitch">Everything you say now echoes inward.</span>
    </div>
  `;
  output.innerHTML = glyphEcho;
}

function handleGlyphClick(glyph) {
  glyphSequence.push(glyph);
  const maxPatternLength = Math.max(
  ...Object.values(summonPatterns)
    .filter(p => p.pattern)
    .map(p => p.pattern.length)
);

if (glyphSequence.length > maxPatternLength) glyphSequence.shift();

  updateInvocation(glyph);
  hideAllEntities();

  for (const key in summonPatterns) {
    const summon = summonPatterns[key];

    if (summon.pattern && arraysEqual(glyphSequence, summon.pattern)) {
      document.getElementById(summon.cardId).style.display = 'block';
      if (summon.onSummon) summon.onSummon();
      return;
    }   
  }
  
  // Direct invocation for glyph sequence 1-2-3-4-5
if (glyphSequence.join(',') === ['1','2','3','4','5'].join(',')) {
  setTimeout(redirectToRandomShard, 1500);
  return;
}

  // Fl!nk handling
  if (glyph === lastGlyph) {
    repeatCount++;
  } else {
    repeatCount = 1;
    lastGlyph = glyph;
  }

  if (repeatCount >= summonPatterns.flink.repeatTrigger) {
    document.getElementById(summonPatterns.flink.cardId).style.display = 'block';
    document.getElementById('invocation-output').innerHTML = summonPatterns.flink.message;
  }
}

document.querySelectorAll('.glyph-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const glyph = btn.dataset.glyph;
    handleGlyphClick(glyph);
  });
});