export function getKairos() {
  const hour = new Date().getHours();
  if (hour < 6) return 'night';
  if (hour < 12) return 'dawn';
  if (hour < 18) return 'day';
  return 'dusk';
}
