const RC = (typeof require === 'function' ? require('./ritualCharge.js') : window.ritualCharge);
const whisperLog = (typeof require === 'function' ? require('./whisperLog.js') : window.whisperLog);
const summonEffects = (typeof require === 'function' ? require('./summonEffects.js') : window.summonEffects);
const bloomController = (typeof require === 'function' ? require('./bloomController.js') : window.bloomController);
const audioLayer = (typeof require === 'function' ? require('./audioLayer.js') : window.audioLayer);
const { eventBus } = (typeof require === 'function' ? require('../WhisperEngine.v3/utils/eventBus.js') : window);
const config = (typeof require === 'function' ? require('./config.js') : window.config || {});

const engine = (typeof require=="function"?require("../WhisperEngine.v3/index.js") : (window && window.WhisperEngine));
function emit(name, payload) { if (eventBus) eventBus.emit(name, payload); }
function on(name, fn) { if (eventBus) eventBus.on(name, fn); }
const memory = (typeof require=="function"?require("../WhisperEngine.v3/core/memory.js"):window.WhisperEngineMemory || {});
const { mutatePhrase } = (typeof require=="function"?require("./mutatePhrase.js"):window);
const { entityRespondFragment } = (typeof require=="function"?require("./entityResponses.js"):window);
const { playChime } = (typeof require=="function"?require("../WhisperEngine.v3/utils/tonalGlyphs.js"):window.tonalGlyphs || {});
const mirrorSyntax = (typeof require=="function"?require("../WhisperEngine.v3/utils/mirrorSyntax.js"):window.mirrorSyntax || {});
const jamController = (typeof require=="function"?require("../WhisperEngine.v3/utils/jamController.js"):window.jamController || {});
const clownHandler = (typeof require=="function"?require("../interface/clownHandler.js"):window.clownHandler || {});
const confessionMode = (typeof require=="function"?require("../WhisperEngine.v3/core/confessionMode.js"):window.confessionMode || {});
const ritualFragments = (typeof require=="function"?require("./ritualFragments.js"):window.ritualFragments || {});

const kaiSound = new Audio(config.KAI_SOUND_SRC || 'media/kai.glitch.mp3');

let invokeTimes = [];

const invocations = {
  1: `:. Rune I ∴ Mirror Wound<br>Shards recall. Silence guides.`,

  2: `:: Rune II ∴ Singing Iron<br>Speech bends thresholds.`,

  3: `:. Rune III ∴ Smoke Between<br>Vanishing ritual. Unfinished song.`,

  4: `.: Rune IV ∴ Frozen Blade<br>Clarity carves. Mercy withheld.`,

  5: `:. Rune V ∴ Spiral Seed<br>Recursion blooms. Pattern becomes.`
};

const entityPatterns = {
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
  vektorikon: {
    pattern: ['1', '3', '5', '2', '1'],
    cardId: 'vektorikon-card',
    onSummon: summonVektorikonEffects
  },
   
  flink: {
    repeatTrigger: config.FLINK_REPEAT_TRIGGER || 5,
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

const antiPatterns = {
  undo: { pattern: ['1','1','1','1','1'] }
};

const specialPatterns = {
  ascent: { pattern: ['3','1','4','1','5'] }
};

let glyphSequence = [];
let lastGlyph = null;
let repeatCount = 0;

function logRitual(glyph) {
  const log = JSON.parse(localStorage.getItem('ritualLogs') || '[]');
  log.push({ glyph, time: Date.now() });
  if (log.length > (config.MAX_RITUAL_LOGS || 100)) log.shift();
  localStorage.setItem('ritualLogs', JSON.stringify(log));
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function hideAllEntities() {
  const summoned = document.querySelectorAll(".entity-card.summoned");
  summoned.forEach(card => {
    card.style.display = "none";
    card.classList.remove("reveal-stage-1","reveal-stage-2","reveal-stage-3","reveal-stage-4");
  });
}

function updateRevealStage(stage) {
  const cards = document.querySelectorAll(".entity-card.summoned.hidden");
  cards.forEach(c => {
    c.classList.remove("reveal-stage-1","reveal-stage-2","reveal-stage-3","reveal-stage-4");
    if(stage>0 && stage<5) c.classList.add("reveal-stage-"+stage);
  });
  const fill = document.querySelector("#glyph-charge .fill");
  if(fill) fill.style.width = (stage*20)+"%";
  emit('ritual:charge', { level: stage });
  if (bloomController) bloomController.setLevel(stage);
  if (audioLayer) audioLayer.updateCharge(stage);
  emit('ritual:pulse', { level: stage });
  if (ritualFragments.showFragment && [2,4,5].includes(stage)) {
    ritualFragments.showFragment(stage);
  }
}

function updateInvocation(glyph) {
  let cls = 'invocation-block';
  if (memory && memory.isGlyphRotted && memory.isGlyphRotted(glyph)) {
    cls += ' rotted';
  }
  const block = `<div class="${cls}">${invocations[glyph]}</div>`;
  document.getElementById('invocation-output').innerHTML = block;
}

function summonKaiEffects() {
  document.body.classList.add('kai-glitch');
  setTimeout(() => document.body.classList.remove('kai-glitch'), 2000);
  kaiSound.currentTime = 0;
  kaiSound.play();
  reversePreviousTruth();
  if (summonEffects) summonEffects.initiateAmbientOverlay("kairos");
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

function summonCaelistraEffects() {
  const caelistraCard = document.getElementById('caelistra-card');
  if (!caelistraCard) return;

  caelistraCard.classList.add('caelistra-summoned');

  const incantation = document.createElement('div');
  incantation.className = 'caelistra-incantation';
  incantation.textContent = 'I call Caelistra ∴ let truth burn clear.';
  caelistraCard.appendChild(incantation);
  if (summonEffects) summonEffects.initiateAmbientOverlay("caelistra");

  setTimeout(() => {
    caelistraCard.classList.remove('caelistra-summoned');
    incantation.remove();
  }, 6000);
}

function handleGlyphClick(glyph) {
  const now = Date.now();
  invokeTimes = invokeTimes.filter(t => now - t < (config.INVOCATION_LIMIT_WINDOW || 10000));
  if (memory.getRefusalUntil && memory.getRefusalUntil() > now) return;
  invokeTimes.push(now);
  if (invokeTimes.length > (config.MAX_INVOCATIONS || 10)) {
    memory.activateRefusal();
    emit('ritual:refusal');
    return;
  }
  if (jamController.register && jamController.register(glyph)) {
    document.body && document.body.classList.add('jam');
    setTimeout(() => document.body && document.body.classList.remove('jam'), 500);
    return;
  }
  RC.incrementCharge(glyph);
  if (RC.getCurrentCharge() === 1 && playChime) playChime('init');
  if (memory && memory.recordGlyphDrift) memory.recordGlyphDrift(lastGlyph, glyph);
  const drifted = memory && memory.getDriftVariant ? memory.getDriftVariant(glyph, lastGlyph) : glyph;
  glyphSequence.push(glyph);
  if (bloomController && bloomController.registerGlyph) bloomController.registerGlyph();
  if (glyphSequence.length > 5) glyphSequence.shift();
  logRitual(glyph);

  for (const key in antiPatterns) {
    const anti = antiPatterns[key];
    if (anti.pattern && arraysEqual(glyphSequence, anti.pattern)) {
      if (memory && memory.resetRecursion) memory.resetRecursion();
      if (memory && memory.recordLoop) memory.recordLoop('anti', true);
      RC.resetCharge();
      const count = memory.recordRitualSequence(glyphSequence.slice());
      emit('ritual:memory', { count });
      emit('ritual:complete');
      updateRevealStage(0);
      glyphSequence = [];
      emit('glyph:anti', { name: key });
      return;
    }
  }

  for (const key in specialPatterns) {
    const sp = specialPatterns[key];
    if (sp.pattern && arraysEqual(glyphSequence, sp.pattern)) {
      if (key === 'ascent') require('../WhisperEngine.v3/core/ascentMode.js').start();
      RC.resetCharge();
      if (audioLayer) audioLayer.updateCharge(0);
      const count = memory.recordRitualSequence(glyphSequence.slice());
      emit('ritual:memory', { count });
      emit('ritual:complete');
      updateRevealStage(0);
      glyphSequence = [];
      break;
    }
  }

  updateInvocation(drifted);
  hideAllEntities();
  if (engine && typeof engine.glyph === 'function') {
    const level = RC.getCurrentCharge();
    const t = glyphSequence.length === 1 && typeof engine.invite === 'function'
      ? engine.invite(level)
      : engine.glyph(glyph, level);
    const frag = document.createElement("div");
    frag.className = "whisper-fragment";
    frag.textContent = t;
    document.getElementById("invocation-output").appendChild(frag);
    if (playChime) playChime('echo');
  }
  if (Math.random() < 0.25 && whisperLog && whisperLog.spawnPhantom) {
    whisperLog.spawnPhantom('invocation-output', RC.getCurrentCharge());
  }
  updateRevealStage(RC.getCurrentCharge());

  let matched = false;

  for (const key in entityPatterns) {
    const summon = entityPatterns[key];

    if (summon.pattern && arraysEqual(glyphSequence, summon.pattern)) {
      matched = true;
      emit('entity:summon', { name: key });
      const card = document.getElementById(summon.cardId);
      if (card) card.style.display = 'block';
      if (summon.onSummon) summon.onSummon();
      whisperLog.logEntitySummon(key, glyphSequence.slice());
      let summonInfo = null;
      if (memory && memory.recordEntitySummon && memory.loadProfile) {
        summonInfo = memory.recordEntitySummon(key, glyphSequence.slice());
        if (summonInfo.timesSummoned > 1) {
          const p = card ? card.querySelector('p') : null;
          if (p && typeof mutatePhrase === 'function') p.textContent = mutatePhrase(p.textContent);
        }
      }
      const profile = memory && memory.loadProfile ? memory.loadProfile() : { roles: [], glyphHistory: [] };
      const lastLoopName = profile.glyphHistory.length ? profile.glyphHistory[profile.glyphHistory.length - 1].name : null;
      const response = entityRespondFragment(key.toUpperCase(), profile.roles, { lastLoop: lastLoopName });
      const output = document.getElementById('invocation-output');
      if (output) {
        const div = document.createElement('div');
        div.className = 'invocation-block entity-response';
        div.textContent = response;
        output.appendChild(div);
        if (playChime) playChime('echo');
      }
      if (summonEffects) summonEffects.triggerExtendedBloom(summon.cardId);
      if (bloomController) bloomController.entityBloom(summon.cardId);
      RC.resetCharge();
      if (audioLayer) audioLayer.updateCharge(0);
      const count = memory.recordRitualSequence(glyphSequence.slice());
      emit('ritual:memory', { count });
      emit('ritual:complete');
      updateRevealStage(0);
      glyphSequence = [];
      break;
    }
  }

  if (!matched) {
    for (const key in entityPatterns) {
      const summon = entityPatterns[key];
      const rev = summon.pattern.slice().reverse();
      if (arraysEqual(glyphSequence, rev)) {
        matched = true;
        emit('entity:mirrorfold', { name: key });
        const out = mirrorSyntax.invert(entityPatterns[key].pattern.join(' '));
        const div = document.createElement('div');
        div.className = 'invocation-block entity-response';
        div.textContent = out;
        document.getElementById('invocation-output').appendChild(div);
        RC.resetCharge();
        const count = memory.recordRitualSequence(glyphSequence.slice());
        emit('ritual:memory', { count });
        emit('ritual:complete');
        updateRevealStage(0);
        glyphSequence = [];
        break;
      }
    }
  }

  // 🧼 Unknown pattern collapse
  if (glyphSequence.length === 5 && !matched) {
    RC.resetCharge();
    if (audioLayer) {
      audioLayer.collapseFeedback();
      if (audioLayer.glitch) audioLayer.glitch();
    }
    if (engine && typeof engine.processInput === 'function') {
      const text = engine.processInput("collapse");
      const div = document.createElement("div");
      div.className = "collapse-fragment";
      div.textContent = text;
      document.getElementById("invocation-output").appendChild(div);
      if (playChime) playChime('echo');
    }
    if (whisperLog && whisperLog.spawnPhantom) whisperLog.spawnPhantom('invocation-output', 5);
    emit('loop:collapse', {});
    clownHandler.trigger();
    confessionMode.open('this glyph was light ∩ now it drips');
    const count = memory.recordRitualSequence(glyphSequence.slice());
    emit('ritual:memory', { count });
    emit('ritual:failure');
    emit('ritual:complete');
    updateRevealStage(0);
    glyphSequence = [];
  }

  // 🐸 Fl!nk handling
  if (glyph === lastGlyph) {
    repeatCount++;
  } else {
    repeatCount = 1;
    lastGlyph = glyph;
  }

  if (memory.isGlyphRotted && memory.isGlyphRotted(glyph)) {
    memory.pushDebtSigil(glyph);
  }

  if (repeatCount > 3) {
    memory.recordScarLoop([glyph]);
  }

  if (Math.random() < 0.01) {
    memory.triggerMirrorBloom();
  }

  if (repeatCount >= entityPatterns.flink.repeatTrigger) {
    document.getElementById(entityPatterns.flink.cardId).style.display = 'block';
    document.getElementById('invocation-output').innerHTML = entityPatterns.flink.message;
  }
}

document.querySelectorAll('.glyph-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const glyph = btn.dataset.glyph;
    handleGlyphClick(glyph);
  });
});

on('glyph:drag', evt => {
  if (evt && evt.glyph) handleGlyphClick(evt.glyph);
});
on('entity:summon', evt => {
  if (evt && evt.name === 'lantern') confessionMode.close();
});
on('persona:shift', name => {
  if (name === 'lantern') confessionMode.close();
});
