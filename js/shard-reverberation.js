(function(){
  if (typeof window === 'undefined') return;
  const data = localStorage.getItem('whisperProfile');
  if (!data) return;
  let profile;
  try { profile = JSON.parse(data); } catch(e){ return; }
  const persona = (profile.roles && profile.roles[0]) || '';
  document.querySelectorAll('[data-reverb]').forEach(el => {
    if (persona === 'parasite') el.classList.add('reverb-invert');
    if ((profile.recursionDepth || 0) > 2) el.classList.add('reverb-echo');
  });
})();
