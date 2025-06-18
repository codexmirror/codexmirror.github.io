(function() {
  function diagnose(sequence, patterns) {
    var best = { name: null, score: 0 };
    for (var key in patterns) {
      var pat = patterns[key].pattern;
      if (!pat) continue;
      var score = 0;
      for (var i = 0; i < sequence.length; i++) {
        if (sequence[i] === pat[i]) score++;
      }
      if (score > best.score) {
        best = { name: key, score: score };
      }
    }
    return best.score ? best : null;
  }

  function feedback(sequence, patterns, outputEl) {
    var result = diagnose(sequence, patterns);
    if (!result || !outputEl) return;
    outputEl.innerHTML =
      '<div class="invocation-block diagnosis">' +
      result.score + '/5 glyphs resonate with ' + result.name + '.<br>' +
      'The ritual flickers but no entity answers.' +
      '</div>';
  }

  var api = { feedback: feedback };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.ritualDiagnostics = api;
})();
