(function () {
  const CONFIG = {
    requiredFields: ["lage", "bplan", "typ", "nutzung"],
    tieBreakerOrder: ["lage", "bplan", "typ", "nutzung", "erschliessung", "bestand"],
    interpretations: [
      { min: 1, max: 29, text: "Eher unrealistisch ohne besondere Ausnahme." },
      { min: 30, max: 59, text: "Unklar bis möglich – hängt stark von Details ab." },
      { min: 60, max: 100, text: "Eher plausibel – Details trotzdem prüfen." }
    ],
    caps: [
      {
        key: "cap_erschliessung",
        max: 35,
        applies: (s) => s.erschliessung === "nicht",
        reason: "Ohne gesicherte Zufahrt/Abwasser ist Bauen/Wohnen meist unrealistisch."
      },
      {
        key: "cap_aussen_wohnen",
        max: 25,
        applies: (s) => s.lage === "aussen" && isWohnenOderTiny(s.nutzung),
        reason: "Außenbereich ist für dauerhaftes Wohnen meist stark eingeschränkt."
      },
      {
        key: "cap_wald_wohnen",
        max: 15,
        applies: (s) => s.typ === "wald" && isWohnenOderTiny(s.nutzung),
        reason: "Waldflächen sind für Wohnen in der Regel nicht vorgesehen."
      }
    ],
    nextStepTemplates: {
      lageUnklar: "Beim Bauamt Innen-/Außenbereich bestätigen lassen.",
      bplanUnklar: "Bebauungsplan anfordern und Nutzung prüfen.",
      bestandUnklar: "Bestand rechtlich prüfen.",
      erschlTeilweise: "Erschließung schriftlich klären.",
      cap: "Cap-Hinweis ernst nehmen und Ausnahmen mit Bauamt konkret klären.",
      negativ: "Kritische Punkte priorisieren und belastbare Nachweise einholen."
    },
    pitfallsTemplates: {
      tiny: "Tiny House gilt rechtlich meist als normales Wohnen.",
      aussen: "Außenbereich ist für Wohnen oft stark eingeschränkt.",
      freizeit: "Freizeitnutzung ≠ dauerhaftes Wohnen.",
      general: "Maklertexte ersetzen keine Auskunft vom Bauamt."
    }
  };

  const TEMPLATES = {
    positives: {
      lage_innen: "Innenbereich ist oft planungsrechtlich günstiger.",
      bplan_ja: "Bebauungsplan schafft oft klarere Nutzungsmöglichkeiten.",
      typ_bauluecke: "Baulücken sind häufig eher für Bebauung gedacht.",
      typ_freizeit_wochenende: "Freizeitgrundstück passt eher zu Wochenendnutzung.",
      typ_landwpriv: "Privilegierte Landwirtschaft kann im Außenbereich eher möglich sein.",
      bestand_genehmigt: "Genehmigter Bestand reduziert oft rechtliche Unsicherheit.",
      erschl_voll: "Voll erschlossen senkt praktische Hürden deutlich."
    },
    negatives: {
      lage_unklar: "Unklare Lage macht Genehmigungsrisiken schwer einschätzbar.",
      bplan_nein: "Ohne Bebauungsplan sind Nutzungen oft schwerer durchsetzbar.",
      bplan_unklar: "Unklarer Bebauungsplan erhöht das Planungsrisiko.",
      typ_freizeit_wohnen: "Freizeitgrundstück ist für Dauerwohnen häufig ungeeignet.",
      nutzung_gewerblich: "Gewerbliche Nutzung braucht oft zusätzliche Vorgaben und Nachweise.",
      erschl_teilweise: "Teilweise Erschließung kann Bau und Nutzung bremsen."
    }
  };

  function isWohnenOderTiny(nutzung) {
    return nutzung === "wohnen" || nutzung === "tiny";
  }

  function getFormState(form) {
    const fd = new FormData(form);
    return {
      lage: fd.get("lage") || "",
      bplan: fd.get("bplan") || "",
      typ: fd.get("typ") || "",
      nutzung: fd.get("nutzung") || "",
      bestand: fd.get("bestand") || "",
      erschliessung: fd.get("erschliessung") || ""
    };
  }

  function requiredComplete(state) {
    return CONFIG.requiredFields.every((field) => Boolean(state[field]));
  }

  function clipWords(text, maxWords) {
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "…";
  }

  function applyModifiers(state) {
    let score = 50;
    const reasons = [];

    if (state.lage === "innen") {
      score += 20;
      reasons.push(makeReason("lage", 20, TEMPLATES.positives.lage_innen, "positive"));
    } else if (state.lage === "unklar") {
      score -= 5;
      reasons.push(makeReason("lage", -5, TEMPLATES.negatives.lage_unklar, "unclear"));
    }

    if (state.bplan === "ja") {
      score += 20;
      reasons.push(makeReason("bplan", 20, TEMPLATES.positives.bplan_ja, "positive"));
    } else if (state.bplan === "nein") {
      score -= 10;
      reasons.push(makeReason("bplan", -10, TEMPLATES.negatives.bplan_nein, "negative"));
    } else if (state.bplan === "unklar") {
      score -= 5;
      reasons.push(makeReason("bplan", -5, TEMPLATES.negatives.bplan_unklar, "unclear"));
    }

    if (state.typ === "bauluecke") {
      score += 20;
      reasons.push(makeReason("typ", 20, TEMPLATES.positives.typ_bauluecke, "positive"));
    }
    if (state.typ === "freizeit" && state.nutzung === "wochenende") {
      score += 10;
      reasons.push(makeReason("typ", 10, TEMPLATES.positives.typ_freizeit_wochenende, "positive"));
    }
    if (state.typ === "freizeit" && isWohnenOderTiny(state.nutzung)) {
      score -= 20;
      reasons.push(makeReason("typ", -20, TEMPLATES.negatives.typ_freizeit_wohnen, "negative"));
    }
    if (state.typ === "landwirtschaft" && state.nutzung === "landwpriv") {
      score += 10;
      reasons.push(makeReason("typ", 10, TEMPLATES.positives.typ_landwpriv, "positive"));
    }

    if (state.nutzung === "gewerblich") {
      const change = state.lage === "innen" && state.bplan === "ja" ? 0 : -5;
      score += change;
      if (change !== 0) {
        reasons.push(makeReason("nutzung", -5, TEMPLATES.negatives.nutzung_gewerblich, "negative"));
      }
    }

    if (state.bestand === "genehmigt") {
      score += 10;
      reasons.push(makeReason("bestand", 10, TEMPLATES.positives.bestand_genehmigt, "positive"));
    } else if (state.bestand === "unklar") {
      reasons.push(makeReason("bestand", 0, "Bestand ist unklar und sollte geprüft werden.", "unclear"));
    }

    if (state.erschliessung === "voll") {
      score += 10;
      reasons.push(makeReason("erschliessung", 10, TEMPLATES.positives.erschl_voll, "positive"));
    } else if (state.erschliessung === "teilweise") {
      score -= 5;
      reasons.push(makeReason("erschliessung", -5, TEMPLATES.negatives.erschl_teilweise, "unclear"));
    }

    return { score, reasons };
  }

  function makeReason(field, impact, text, category) {
    return { field, impact, text, category };
  }

  function applyCaps(score, state) {
    let current = score;
    const activeCaps = [];
    CONFIG.caps.forEach((cap) => {
      if (cap.applies(state)) {
        activeCaps.push(cap);
        current = Math.min(current, cap.max);
      }
    });
    return { score: current, activeCaps };
  }

  function clampScore(score) {
    return Math.min(100, Math.max(1, score));
  }

  function confidence(state) {
    let unclear = 0;
    if (state.lage === "unklar") unclear += 1;
    if (state.bplan === "unklar") unclear += 1;
    if (state.bestand === "unklar") unclear += 1;
    if (state.erschliessung === "teilweise") unclear += 1;

    if (unclear === 0) return "hoch";
    if (unclear === 1) return "mittel";
    return "niedrig";
  }

  function sortReasons(reasons) {
    const orderMap = Object.fromEntries(CONFIG.tieBreakerOrder.map((item, index) => [item, index]));
    return reasons.sort((a, b) => {
      const absDiff = Math.abs(b.impact) - Math.abs(a.impact);
      if (absDiff !== 0) return absDiff;
      return orderMap[a.field] - orderMap[b.field];
    });
  }

  function buildWhy(state, activeCaps, reasons) {
    const list = [];

    activeCaps.forEach((cap) => list.push(cap.reason));

    const negatives = sortReasons(reasons.filter((r) => r.impact < 0 && r.category !== "unclear")).map((r) => r.text);
    const positives = sortReasons(reasons.filter((r) => r.impact > 0)).map((r) => r.text);
    const unclear = sortReasons(reasons.filter((r) => r.category === "unclear")).map((r) => r.text);

    [negatives, positives, unclear].forEach((bucket) => {
      bucket.forEach((text) => {
        if (list.length < 4 && !list.includes(text)) list.push(text);
      });
    });

    return list.slice(0, 4).map((item) => clipWords(item, 14));
  }

  function buildNextSteps(state, activeCaps, reasons) {
    const steps = [];
    if (state.lage === "unklar") steps.push(CONFIG.nextStepTemplates.lageUnklar);
    if (state.bplan === "unklar") steps.push(CONFIG.nextStepTemplates.bplanUnklar);
    if (state.bestand === "unklar") steps.push(CONFIG.nextStepTemplates.bestandUnklar);
    if (state.erschliessung === "teilweise" || state.erschliessung === "nicht") steps.push(CONFIG.nextStepTemplates.erschlTeilweise);
    if (activeCaps.length > 0) steps.push(CONFIG.nextStepTemplates.cap);
    if (reasons.some((r) => r.impact <= -10)) steps.push(CONFIG.nextStepTemplates.negativ);
    return Array.from(new Set(steps)).slice(0, 3).map((item) => clipWords(item, 14));
  }

  function buildPitfalls(state) {
    const pitfalls = [];
    if (state.nutzung === "tiny") pitfalls.push(CONFIG.pitfallsTemplates.tiny);
    if (state.lage === "aussen" || (state.typ === "wald" && isWohnenOderTiny(state.nutzung))) pitfalls.push(CONFIG.pitfallsTemplates.aussen);
    if (state.typ === "freizeit") pitfalls.push(CONFIG.pitfallsTemplates.freizeit);
    pitfalls.push(CONFIG.pitfallsTemplates.general);
    return Array.from(new Set(pitfalls)).slice(0, 3).map((item) => clipWords(item, 14));
  }

  function ampel(score) {
    if (score <= 29) return "🔴";
    if (score <= 59) return "🟡";
    return "🟢";
  }

  function interpretation(score) {
    return CONFIG.interpretations.find((bucket) => score >= bucket.min && score <= bucket.max).text;
  }

  function evaluate(state) {
    if (!requiredComplete(state)) {
      return {
        neutral: true,
        score: 50,
        ampel: "🟡",
        interpretation: "Bitte Pflichtfelder auswählen, um eine Einschätzung zu erhalten.",
        why: [],
        steps: [],
        pitfalls: [],
        confidence: ""
      };
    }

    const modified = applyModifiers(state);
    const capped = applyCaps(modified.score, state);
    const finalScore = clampScore(capped.score);

    return {
      neutral: false,
      score: finalScore,
      ampel: ampel(finalScore),
      interpretation: interpretation(finalScore),
      why: buildWhy(state, capped.activeCaps, modified.reasons),
      steps: buildNextSteps(state, capped.activeCaps, modified.reasons),
      pitfalls: buildPitfalls(state),
      confidence: confidence(state),
      activeCaps: capped.activeCaps
    };
  }

  function renderList(target, values) {
    target.innerHTML = "";
    values.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      target.appendChild(li);
    });
  }

  function attachApp() {
    const form = document.getElementById("check-form");
    if (!form) return;

    const scoreEl = document.getElementById("result-score");
    const ampelEl = document.getElementById("result-ampel");
    const interpEl = document.getElementById("result-interpretation");
    const confidenceEl = document.getElementById("result-confidence");
    const whyList = document.getElementById("why-list");
    const stepsList = document.getElementById("steps-list");
    const pitfallsList = document.getElementById("pitfalls-list");
    const validation = document.getElementById("inline-validation");
    const resetBtn = document.getElementById("reset-button");

    const update = () => {
      const state = getFormState(form);
      const result = evaluate(state);

      scoreEl.textContent = String(result.score);
      ampelEl.textContent = result.ampel;
      interpEl.textContent = result.interpretation;
      confidenceEl.textContent = result.confidence ? `Confidence: ${result.confidence}` : "";
      renderList(whyList, result.why);
      renderList(stepsList, result.steps);
      renderList(pitfallsList, result.pitfalls);

      validation.textContent = result.neutral ? "Bitte alle Pflichtfelder auswählen." : "";
    };

    form.addEventListener("change", update);
    resetBtn.addEventListener("click", () => {
      form.reset();
      update();
    });

    update();
  }

  function runSelfTests() {
    const scenarios = [
      {
        id: "S1",
        state: { lage: "innen", bplan: "ja", typ: "bauluecke", nutzung: "wohnen", bestand: "", erschliessung: "" },
        check: (r) => r.ampel === "🟢" && (!r.activeCaps || r.activeCaps.length === 0)
      },
      {
        id: "S2",
        state: { lage: "aussen", bplan: "ja", typ: "sonstiges", nutzung: "tiny", bestand: "", erschliessung: "" },
        check: (r) => r.score <= 25 && r.ampel === "🔴"
      },
      {
        id: "S3",
        state: { lage: "innen", bplan: "ja", typ: "wald", nutzung: "wohnen", bestand: "", erschliessung: "" },
        check: (r) => r.score <= 15 && r.ampel === "🔴"
      },
      {
        id: "S4",
        state: { lage: "innen", bplan: "ja", typ: "bauluecke", nutzung: "wohnen", bestand: "", erschliessung: "nicht" },
        check: (r) => r.score <= 35 && r.ampel !== "🟢"
      },
      {
        id: "S5",
        state: { lage: "innen", bplan: "ja", typ: "freizeit", nutzung: "wochenende", bestand: "", erschliessung: "" },
        check: (r) => r.score >= 30
      },
      {
        id: "S6",
        state: { lage: "innen", bplan: "ja", typ: "freizeit", nutzung: "wohnen", bestand: "", erschliessung: "" },
        check: (r) => r.score <= 70
      },
      {
        id: "S7",
        state: { lage: "aussen", bplan: "nein", typ: "landwirtschaft", nutzung: "landwpriv", bestand: "", erschliessung: "" },
        check: (r) => r.score >= 40 && r.score <= 70
      },
      {
        id: "S8",
        state: { lage: "", bplan: "ja", typ: "bauluecke", nutzung: "wohnen", bestand: "", erschliessung: "" },
        check: (r) => r.neutral === true && r.score === 50 && r.why.length === 0 && r.steps.length === 0 && r.pitfalls.length === 0
      }
    ];

    return scenarios.map((s) => ({ id: s.id, pass: s.check(evaluate(s.state)), result: evaluate(s.state) }));
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { evaluate, runSelfTests, clipWords };
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", attachApp);
  }
})();
