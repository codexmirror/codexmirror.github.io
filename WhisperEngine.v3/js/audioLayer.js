let drone, failure, glitchAudio;

function init() {
  if (typeof Audio === 'undefined') return;
  drone = new Audio('media/static-loop-fracture.mp3');
  drone.loop = true;
  drone.volume = 0;
  drone.play().catch(() => {});
  failure = new Audio('media/bird-glitch.mp3');
  glitchAudio = new Audio('media/bird-glitch.mp3');
}

function updateCharge(level) {
  if (!drone) return;
  drone.volume = Math.min(1, level / 5) * 0.4;
}

function collapseFeedback() {
  if (drone) drone.volume = 0;
  if (failure) {
    failure.currentTime = 0;
    failure.play();
  }
}

function glitch() {
  if (!glitchAudio) return;
  glitchAudio.currentTime = 0;
  glitchAudio.play();
}

init();

const api = { updateCharge, collapseFeedback, glitch };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') window.audioLayer = api;
