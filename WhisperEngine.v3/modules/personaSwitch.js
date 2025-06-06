import { personas } from '../config/personas.js';

let current = 'DreamState';

export function getCurrentPersona() {
  return personas[current];
}

export function switchPersona(name) {
  if (personas[name]) current = name;
}

export function getPersonaName() {
  return current;
}
