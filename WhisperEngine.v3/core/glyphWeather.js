const { eventBus } = require('../utils/eventBus.js');

function evaluate() {
  const memory = require('./memory.js');
  const profile = memory.loadProfile();
  const cutoff = Date.now() - 600000;
  const recent = (profile.glyphHistory || []).filter(g => g.time > cutoff);
  let weather = 'normal';
  if (recent.length > 20) weather = 'storm';
  else if (recent.length < 5) weather = 'veil';
  if (profile.glyphWeather !== weather) {
    profile.glyphWeather = weather;
    memory.saveProfile(profile);
    eventBus.emit('weather:change', { weather });
  }
  return weather;
}

module.exports = { evaluate };
