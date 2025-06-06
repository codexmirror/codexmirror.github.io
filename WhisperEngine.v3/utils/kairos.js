function getKairosWindow() {
  const hr = new Date().getHours();
  if (hr >= 4 && hr < 7) return 'dawn';
  if (hr >= 7 && hr < 12) return 'day';
  if (hr >= 12 && hr < 17) return 'reflection';
  if (hr >= 17 && hr < 21) return 'dusk';
  return 'void';
}

module.exports = { getKairosWindow };
