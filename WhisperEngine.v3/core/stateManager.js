const personas = new Map();
let currentPersona = null;

function registerPersona(name, persona) {
  personas.set(name, persona);
}

const stateManager = {
  init(profile) {
    if (profile.visits > 5) {
      currentPersona = 'watcher';
    } else {
      currentPersona = 'dream';
    }
  },
  current() {
    return personas.get(currentPersona);
  },
  shift(name) {
    if (personas.has(name)) currentPersona = name;
  },
  name() {
    return currentPersona;
  }
};

module.exports = { stateManager, registerPersona };
