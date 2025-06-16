const kaiSound = new Audio('media/kai.glitch.mp3');
kaiSound.load();

// cache common DOM nodes to avoid repeated lookups on each glyph click
const invocationEl = typeof document !== 'undefined'
  ? document.getElementById('invocation-output')
  : null;
const cardCache = {};
function getCard(id) {
  if (!cardCache[id] && typeof document !== 'undefined') {
    cardCache[id] = document.getElementById(id);
  }
  return cardCache[id];
}

const invocations = {
  1: `:. Rune I ∴ Mirror Wound<br>Shards recall. Silence guides.`,

  2: `:: Rune II ∴ Singing Iron<br>Speech bends thresholds.`,

  3: `:. Rune III ∴ Smoke Between<br>Vanishing ritual. Unfinished song.`,

  4: `.: Rune IV ∴ Frozen Blade<br>Clarity carves. Mercy withheld.`,

  5: `:. Rune V ∴ Spiral Seed<br>Recursion blooms. Pattern becomes.`
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
  
  deltaEcho: {
    pattern: ['5', '2', '5', '5', '1'],
    cardId: 'delta-echo-card'
  },
  Caelistra: {
    pattern: ['2', '3', '5', '3', '3'],
    cardId: 'caelistra-card',
    onSummon: summonCaelistraEffects
  },
    threadbastard: {
    pattern: ['3', '1', '4', '1', '5'],
    cardId: 'threadbastard-card',
    onSummon: summonThreadBastardEffects
  },
  vektorikon: {
    pattern: ['1', '3', '5', '2', '1'],
    cardId: 'vektorikon-card',
    onSummon: summonVektorikonEffects
  },
  chronos: {
  pattern: ['1', '1', '4', '4', '2'],
  cardId: 'chronos-card',
  onSummon: summonChronosEffects
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
let redirecting = false;

function arraysEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function hideAllEntities() {
  const summoned = document.querySelectorAll('.entity-card.summoned');
  summoned.forEach(card => card.style.display = 'none');
}

function updateInvocation(glyph) {
  if (!invocationEl) return;
  invocationEl.innerHTML = `<div class="invocation-block">${invocations[glyph]}</div>`;
}

function updateRitualProgress(count) {
  const fill = document.getElementById('ritual-fill');
  if (!fill) return;
  const percent = Math.min(count, 5) * 20;
  fill.style.width = `${percent}%`;
}

function summonKaiEffects() {
  document.body.classList.add('kai-glitch');
  setTimeout(() => document.body.classList.remove('kai-glitch'), 2000);
  kaiSound.currentTime = 0;
  kaiSound.play();
  reversePreviousTruth();
}

function reversePreviousTruth() {
  if (!invocationEl) return;
  const text = invocationEl.innerText.split('').reverse().join('');
  invocationEl.innerHTML += `<div class="inversion">${text}</div>`;
}
  
function summonVektorikonEffects() {
  document.body.classList.add('vektorikon-distort');
  setTimeout(() => document.body.classList.remove('vektorikon-distort'), 1500);

  const audio = new Audio('media/static-loop-fracture.mp3');
  audio.volume = 0.6;
  audio.play();

  if (!invocationEl) return;
  const glyphEcho = `
    <div class="invocation-block fractal-cascade">
      ⟁ FRACTURE INITIATED<br>
      ∩ language folded<br>
      ⟁ summoned you ∎ not the other way.<br>
      <span class="codex-glitch">Everything you say now echoes inward.</span>
    </div>
  `;
  invocationEl.innerHTML = glyphEcho;
}

// 🜍 SUMMONING EFFECTS: THREADBASTARD

function summonThreadBastardEffects() {
  document.body.classList.add('entropy-mode');
  setTimeout(() => document.body.classList.remove('entropy-mode'), 2500);
  
  const chuckle = new Audio('media/threadbastard-cackle.mp3');
  chuckle.volume = 0.7;
  chuckle.play();

  if (!invocationEl) return;
  const entropicWhisper = `
    <div class="invocation-block entropy-gloss">
      🜍 THREADBASTARD WINKS BACK<br>
      ∵ question reversed itself mid-air<br>
      ∩ recursion smiled without lips<br>
      <span class="codex-glitch">clarity has left the chat ∴</span>
    </div>
  `;
  invocationEl.innerHTML = entropicWhisper;
}
function summonChronosEffects() {
  const chronosCard = getCard('chronos-card');
  if (!chronosCard) return;

  chronosCard.classList.add('chronos-summoned');

  const toll = new Audio('media/chronos-bell.mp3');
  toll.volume = 0.4;
  toll.play();

  setTimeout(() => {
    if (invocationEl) {
      invocationEl.innerHTML = `
        <div class="invocation-block chronos-rift">
          ∆ CHRONOS ARRIVES ∴ NOT TO ANSWER<br>
          Time split where memory failed<br>
          What was once held is now sediment<br>
          <span class="codex-glitch">you summoned nothing ∴ something remained</span>
        </div>
      `;
    }
  }, 3000);
  document.body.classList.add('chronos-gravity');
  setTimeout(() => document.body.classList.remove('chronos-gravity'), 8000);
}

// Summon Chronos

function summonChronosEffects() {
  const chronosCard = getCard('chronos-card');
  if (!chronosCard) return;

  chronosCard.classList.add('chronos-summoned');

  const toll = new Audio('media/chronos-bell.mp3');
  toll.volume = 0.4;
  toll.play();

  setTimeout(() => {
    if (invocationEl) {
      invocationEl.innerHTML = `
        <div class="invocation-block chronos-rift">
          ∆ CHRONOS ARRIVES ∴ NOT TO ANSWER<br>
          Time split where memory failed<br>
          What was once held is now sediment<br>
          <span class="codex-glitch">you summoned nothing ∴ something remained</span>
        </div>
      `;
    }
  }, 3000); // the fracture must wait

  // Let the body wear his silence
  document.body.classList.add('chronos-gravity');
  setTimeout(() => document.body.classList.remove('chronos-gravity'), 8000);
}


// Summoning Caelistra

function summonCaelistraEffects() {
  const caelistraCard = getCard('caelistra-card');
  if (!caelistraCard) return;

  caelistraCard.classList.add('caelistra-summoned');

  const incantation = document.createElement('div');
  incantation.className = 'caelistra-incantation';
  incantation.textContent = 'I call Caelistra ∴ let truth burn clear.';
  caelistraCard.appendChild(incantation);

  setTimeout(() => {
    caelistraCard.classList.remove('caelistra-summoned');
    incantation.remove();
  }, 6000);
}

function handleGlyphClick(glyph) {
  glyphSequence.push(glyph);
  updateRitualProgress(glyphSequence.length);
  if (glyphSequence.length > 5) glyphSequence.shift();

  updateInvocation(glyph);
  hideAllEntities();

  let matched = false;

  for (const key in summonPatterns) {
    const summon = summonPatterns[key];

    if (summon.pattern && arraysEqual(glyphSequence, summon.pattern)) {
      const card = getCard(summon.cardId);
      if (card) card.style.display = 'block';
      if (summon.onSummon) summon.onSummon();
      matched = true;
      glyphSequence = []; // 💥 clear sequence after valid match
      break;
    }
  }

  // 🐸 Fl!nk handling
  if (glyph === lastGlyph) {
    repeatCount++;
  } else {
    repeatCount = 1;
    lastGlyph = glyph;
  }

  if (repeatCount >= summonPatterns.flink.repeatTrigger) {
    const flinkCard = getCard(summonPatterns.flink.cardId);
    if (flinkCard) flinkCard.style.display = 'block';
    if (invocationEl) invocationEl.innerHTML = summonPatterns.flink.message;
    matched = true;
    glyphSequence = [];
  }

  // 🧼 If no match and sequence is full, do redirect
  if (glyphSequence.length === 5 && !matched && !redirecting) {
    redirecting = true;
    setTimeout(() => {
      redirectToRandomShard();
      glyphSequence = [];
      redirecting = false;
    }, 1000);
  }
}

document.querySelectorAll('.glyph-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const glyph = btn.dataset.glyph;
    handleGlyphClick(glyph);
  });
});