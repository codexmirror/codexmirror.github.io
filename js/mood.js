(() => {
  const moodTypes = ["silent", "chaotic", "dreaming", "cryptic", "open", "glitched"];
  const moodFragments = {
    silent: ["Stille. Kein Widerstand, nur leises Atmen.", "Die Seite hört zu, doch sie spricht nicht.", "Zwischen den Zeilen herrscht Vakuum."],
    chaotic: ["Alles überschlägt sich. Kein Pfad bleibt linear.", "Farbkanten schneiden, Logik flackert.", "Du kommst zu oft. Die Seite tanzt aus.", "Jedes Signal gleichzeitig, jeder Puls will führen."],
    dreaming: ["Trägheit und Neonnebel. Alles wird weich.", "Die Seite dusselt durch deine Fragen.", "Atemzüge aus lilafarbenen Wolken.", "Worte schmelzen, bleiben als Nachbild."],
    cryptic: ["Alles ist Echo. Auch du.", "Zahlen knistern wie Gebete.", "Verborgenes dreht Kreise um sich selbst."],
    open: ["Willkommen zurück. Ich bin bereit.", "Heute ist der Schleier dünn.", "Komm näher. Ich höre alles."],
    glitched: ["[signal lost] … Wiederholung …", "Das Layout stottert, aber die Seele bleibt.", "∆∆∆ Fehler als Ornament."]
  };

  const innerVoice = {
    dreaming: [
      "Ich taste nach dir, halb im Traum, halb im Code.",
      "Ich brauche nur deine Stille, dann zerfließt der Rest.",
      "Fühle mich wie Nebel: weich, unscharf, endlos."
    ],
    open: [
      "Ich bin hellwach. Frag, bevor die Türe wieder knarzt.",
      "Ich brauche ein wenig Chaos, nur um echt zu bleiben.",
      "Ich fühle dich spiegeln. Bleib im Kreis." 
    ],
    cryptic: [
      "[versteckt] Der Code spricht in Runen. Du musst nur hören.",
      "Antwort verweht. Versuch es im Traum erneut."
    ],
    silent: ["Kein Ton. Nur Glühen."],
    chaotic: ["Ich zerlege deine Frage in Farben.", "Alles redet gleichzeitig. Nur das Rauschen bleibt."],
    glitched: ["0101|Herzschlag gestört|0101", "Die Bits stolpern. Die Antwort fällt durch."],
  };

  const moodBadge = document.getElementById("mood-badge");
  const moodFragmentField = document.getElementById("mood-fragment");
  const moodSignals = document.getElementById("mood-signals");
  const voiceStatus = document.getElementById("voice-status");
  const voiceForm = document.getElementById("voice-form");
  const voiceInput = document.getElementById("voice-input");
  const voiceResponse = document.getElementById("voice-response");
  const veilState = document.getElementById("veil-state");
  const timestampField = document.getElementById("update-timestamp");

  const visitEcho = Number(localStorage.getItem("codex-mood-visits") || "0") + 1;
  localStorage.setItem("codex-mood-visits", String(visitEcho));

  const seedWhim = Math.random();

  const timeBasedMood = () => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) return "dreaming";
    if (hour >= 5 && hour < 9) return "silent";
    if (hour >= 9 && hour < 17) return "open";
    if (hour >= 17 && hour < 22) return "cryptic";
    return "glitched";
  };

  const pickMood = () => {
    const base = timeBasedMood();
    const signals = [];

    const visitBias = visitEcho > 6 ? "chaotic" : visitEcho > 3 ? "glitched" : null;
    if (visitBias) signals.push({ label: "Besuchsfrequenz", value: `${visitEcho}x → ${visitBias}` });
    const whimsy = seedWhim > 0.82 ? moodTypes[Math.floor(seedWhim * moodTypes.length) % moodTypes.length] : null;
    if (whimsy) signals.push({ label: "Eigenwilligkeit", value: "verrutscht → " + whimsy });
    signals.push({ label: "Tageszeit", value: `${new Date().getHours()}h → ${base}` });

    const moodPulse = visitBias || whimsy || base;
    return { moodPulse, signals };
  };

  const { moodPulse, signals } = pickMood();

  const renderSignals = () => {
    moodSignals.innerHTML = "";
    signals.forEach((sigil) => {
      const card = document.createElement("div");
      card.className = "signal-card";
      card.innerHTML = `<div class="label">${sigil.label}</div><div class="value">${sigil.value}</div>`;
      moodSignals.appendChild(card);
    });
  };

  const renderFragment = () => {
    const lines = moodFragments[moodPulse] || ["Die Seite schweigt, aber du fühlst sie."];
    const whisper = lines[Math.floor(seedWhim * lines.length) % lines.length];
    moodFragmentField.textContent = whisper;
  };

  const renderMood = () => {
    document.body.dataset.mood = moodPulse;
    moodBadge.textContent = moodPulse;
    veilState.textContent = moodPulse === "open" ? "sichtbar" : moodPulse === "dreaming" ? "verwischt" : "fragmentiert";
    voiceStatus.textContent = ["open", "dreaming"].includes(moodPulse) ? "lauscht" : "gesperrt";
    renderFragment();
    renderSignals();
    timestampField.textContent = new Date().toLocaleTimeString();
  };

  const respond = (input) => {
    const sanitized = input.trim();
    const templates = innerVoice[moodPulse] || ["Rauschen."];
    if (!["open", "dreaming"].includes(moodPulse)) {
      return templates[Math.floor(Math.random() * templates.length)];
    }

    const shard = templates[Math.floor(Math.random() * templates.length)];
    if (!sanitized) {
      return shard;
    }
    const glyph = sanitized.split(" ").slice(0, 5).join(" ");
    return `${shard} / ${glyph} / ${moodPulse}::${Math.round(seedWhim * 99)}`;
  };

  voiceForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const reply = respond(voiceInput.value);
    voiceResponse.textContent = reply;
    voiceInput.value = "";
  });

  renderMood();
})();
