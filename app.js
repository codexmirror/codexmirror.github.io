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
        max: 35,
        applies: (s) => s.erschliessung === "nicht",
        reason: "Ohne gesicherte Zufahrt/Abwasser ist Bauen/Wohnen meist unrealistisch."
      },
      {
        max: 25,
        applies: (s) => s.lage === "aussen" && isWohnenOderTiny(s.nutzung),
        reason: "Außenbereich ist für dauerhaftes Wohnen meist stark eingeschränkt."
      },
      {
        max: 15,
        applies: (s) => s.typ === "wald" && isWohnenOderTiny(s.nutzung),
        reason: "Waldflächen sind für Wohnen in der Regel nicht vorgesehen."
      }
    ],
    nextStepTemplates: {
      lageUnklar: "Bauamt: Innen- oder Außenbereich schriftlich bestätigen lassen.",
      bplanUnklar: "Gemeinde: Bebauungsplan anfordern und geplante Nutzung prüfen lassen.",
      bestandUnklar: "Bestehende Gebäude und Genehmigungen rechtlich prüfen lassen.",
      erschlKlaeren: "Erschließung schriftlich klären: Zufahrt, Abwasser, Wasser, Strom.",
      aussenWohnen: "Bauamt: Ausnahmen für Wohnen im Außenbereich konkret abklären.",
      waldWohnen: "Gemeinde/Forst: Nutzungsrecht klären; Wohnen im Wald meist ausgeschlossen.",
      bplanNein: "Gemeinde: Zulässigkeit ohne Bebauungsplan verbindlich einordnen lassen.",
      landwpriv: "Privilegierung prüfen: Betrieb, Flächen und Bedarf belastbar nachweisen.",
      freizeitWohnen: "Zweckbestimmung schriftlich prüfen: Freizeitnutzung ist nicht dauerhaftes Wohnen.",
      starkNegativ: "Kritische Punkte priorisieren und Nachweise geordnet zusammenstellen.",
      fallback: "Bei Unsicherheit: Bauamt-Auskunft schriftlich einholen."
    },
    pitfallsTemplates: {
      tiny: "Tiny House gilt rechtlich meist als normales Wohnen.",
      aussen: "Außenbereich ist für Wohnen oft stark eingeschränkt.",
      freizeit: "Freizeitnutzung ≠ dauerhaftes Wohnen.",
      general: "Maklertexte ersetzen keine Auskunft vom Bauamt."
    },
    fieldErrors: {
      lage: "Bitte eine Lage auswählen.",
      bplan: "Bitte einen Bebauungsplan-Status auswählen.",
      typ: "Bitte einen Grundstückstyp auswählen.",
      nutzung: "Bitte eine geplante Nutzung auswählen."
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

  function clipWords(text, maxWords) {
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text;
    const shortened = words.slice(0, maxWords).join(" ").replace(/[,:;.!?]+$/, "");
    return shortened + "…";
  }

  function makeReason(field, impact, text, category) {
    return { field, impact, text, category };
  }

  function requiredComplete(state) {
    return CONFIG.requiredFields.every((field) => Boolean(state[field]));
  }

  function normalizeOptionalState(state) {
    if (!state.optionalActive) return { ...state, bestand: "", erschliessung: "" };
    return state;
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
      const delta = state.lage === "innen" && state.bplan === "ja" ? 0 : -5;
      score += delta;
      if (delta !== 0) reasons.push(makeReason("nutzung", -5, TEMPLATES.negatives.nutzung_gewerblich, "negative"));
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
    if (state.erschliessung === "teilweise" || state.erschliessung === "nicht") unclear += 1;
    if (unclear === 0) return "hoch";
    if (unclear === 1) return "mittel";
    return "niedrig";
  }

  function sortReasons(reasons) {
    const order = Object.fromEntries(CONFIG.tieBreakerOrder.map((k, i) => [k, i]));
    return reasons.sort((a, b) => {
      const byImpact = Math.abs(b.impact) - Math.abs(a.impact);
      if (byImpact !== 0) return byImpact;
      return order[a.field] - order[b.field];
    });
  }

  function buildWhy(activeCaps, reasons) {
    const list = [];
    activeCaps.forEach((cap) => list.push({ type: "cap", text: cap.reason }));

    const negatives = sortReasons(reasons.filter((r) => r.impact < 0 && r.category !== "unclear"));
    const positives = sortReasons(reasons.filter((r) => r.impact > 0));
    const unclear = sortReasons(reasons.filter((r) => r.category === "unclear"));

    [
      negatives.map((r) => ({ type: "negative", text: r.text })),
      positives.map((r) => ({ type: "positive", text: r.text })),
      unclear.map((r) => ({ type: "unclear", text: r.text }))
    ].forEach((bucket) => {
      bucket.forEach((item) => {
        if (list.length < 4 && !list.some((existing) => existing.text === item.text)) list.push(item);
      });
    });

    return list.slice(0, 4).map((item) => ({ type: item.type, text: clipWords(item.text, 14) }));
  }

  function buildNextSteps(state, activeCaps, reasons) {
    const steps = [];

    if (state.typ === "wald" && isWohnenOderTiny(state.nutzung)) steps.push(CONFIG.nextStepTemplates.waldWohnen);
    if (state.lage === "aussen" && isWohnenOderTiny(state.nutzung)) steps.push(CONFIG.nextStepTemplates.aussenWohnen);
    if (state.typ === "freizeit" && isWohnenOderTiny(state.nutzung)) steps.push(CONFIG.nextStepTemplates.freizeitWohnen);
    if (state.typ === "landwirtschaft" && state.nutzung === "landwpriv") steps.push(CONFIG.nextStepTemplates.landwpriv);
    if (state.bplan === "nein") steps.push(CONFIG.nextStepTemplates.bplanNein);
    if (state.erschliessung === "teilweise" || state.erschliessung === "nicht") steps.push(CONFIG.nextStepTemplates.erschlKlaeren);

    if (state.lage === "unklar") steps.push(CONFIG.nextStepTemplates.lageUnklar);
    if (state.bplan === "unklar") steps.push(CONFIG.nextStepTemplates.bplanUnklar);
    if (state.bestand === "unklar") steps.push(CONFIG.nextStepTemplates.bestandUnklar);

    if (reasons.some((r) => r.impact <= -10)) steps.push(CONFIG.nextStepTemplates.starkNegativ);

    const unique = Array.from(new Set(steps));
    const hasAuthorityStep = unique.some((step) => /bauamt|gemeinde/i.test(step));
    if (unique.length < 3 && !hasAuthorityStep) unique.push(CONFIG.nextStepTemplates.fallback);

    return unique.slice(0, 3).map((item) => clipWords(item, 14));
  }

  function buildPitfalls(state) {
    const pitfalls = [];
    if (state.nutzung === "tiny") pitfalls.push(CONFIG.pitfallsTemplates.tiny);
    if (state.lage === "aussen" || (state.typ === "wald" && isWohnenOderTiny(state.nutzung))) pitfalls.push(CONFIG.pitfallsTemplates.aussen);
    if (state.typ === "freizeit") pitfalls.push(CONFIG.pitfallsTemplates.freizeit);

    const unique = Array.from(new Set(pitfalls));
    if (unique.length < 3) unique.push(CONFIG.pitfallsTemplates.general);
    return unique.slice(0, 3).map((item) => clipWords(item, 14));
  }

  function ampel(score) {
    if (score <= 29) return "🔴";
    if (score <= 59) return "🟡";
    return "🟢";
  }

  function ampelLabel(light) {
    if (light === "🔴") return "🔴 Kritisch";
    if (light === "🟡") return "🟡 Vorsicht";
    return "🟢 Plausibel";
  }

  function interpretation(score) {
    return CONFIG.interpretations.find((bucket) => score >= bucket.min && score <= bucket.max).text;
  }

  function evaluate(rawState) {
    const state = normalizeOptionalState(rawState);

    if (!requiredComplete(state)) {
      return {
        neutral: true,
        score: 50,
        ampel: "🟡",
        ampelText: ampelLabel("🟡"),
        interpretation: "Bitte alle Pflichtfelder auswählen, um deine Einschätzung zu erhalten.",
        why: [],
        steps: [],
        pitfalls: [],
        confidence: ""
      };
    }

    const modified = applyModifiers(state);
    const capped = applyCaps(modified.score, state);
    const finalScore = clampScore(capped.score);
    const light = ampel(finalScore);

    return {
      neutral: false,
      score: finalScore,
      ampel: light,
      ampelText: ampelLabel(light),
      interpretation: interpretation(finalScore),
      why: buildWhy(capped.activeCaps, modified.reasons),
      steps: buildNextSteps(state, capped.activeCaps, modified.reasons),
      pitfalls: buildPitfalls(state),
      confidence: confidence(state),
      activeCaps: capped.activeCaps
    };
  }

  function getCheckedValue(form, name) {
    const checked = form.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : "";
  }

  function getFormState(form, optionalDetails) {
    const bestand = getCheckedValue(form, "bestand");
    const erschliessung = getCheckedValue(form, "erschliessung");
    return {
      lage: getCheckedValue(form, "lage"),
      bplan: getCheckedValue(form, "bplan"),
      typ: getCheckedValue(form, "typ"),
      nutzung: getCheckedValue(form, "nutzung"),
      bestand,
      erschliessung,
      optionalActive: Boolean(bestand || erschliessung)
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

  function decorateWhyItem(item) {
    const map = {
      cap: "⚠",
      negative: "⚠",
      positive: "✓",
      unclear: "ℹ"
    };
    const marker = map[item.type] || "⚠";
    return `${marker} ${item.text}`;
  }

  function animateScore(element, from, to, shouldAnimate) {
    if (!shouldAnimate) {
      element.textContent = String(to);
      return;
    }

    const start = performance.now();
    const duration = 300;

    function tick(now) {
      const elapsed = Math.min(1, (now - start) / duration);
      const value = Math.round(from + (to - from) * elapsed);
      element.textContent = String(value);
      if (elapsed < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function attachApp() {
    const form = document.getElementById("check-form");
    if (!form) return;

    const resultCard = document.querySelector(".result");
    const resultPlaceholder = document.getElementById("result-placeholder");
    const resultContent = document.getElementById("result-content");
    const scoreEl = document.getElementById("result-score");
    const ampelEl = document.getElementById("result-ampel");
    const interpEl = document.getElementById("result-interpretation");
    const confidenceEl = document.getElementById("result-confidence");
    const whyList = document.getElementById("why-list");
    const stepsList = document.getElementById("steps-list");
    const pitfallsList = document.getElementById("pitfalls-list");
    const resetBtn = document.getElementById("reset-button");
    const optionalDetails = document.getElementById("optional-details");
    const infoButtons = form.querySelectorAll(".info-toggle");
    const infoPanels = form.querySelectorAll(".field-info");

    const touched = new Set();
    let lastRenderedScore = 50;

    const setFieldError = (field, message) => {
      const el = document.getElementById(`error-${field}`);
      if (el) el.textContent = message;
    };

    const closeAllInfoPanels = () => {
      infoPanels.forEach((panel) => {
        panel.hidden = true;
        panel.classList.remove("is-open");
      });
      infoButtons.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
    };

    const renderErrors = (state) => {
      CONFIG.requiredFields.forEach((field) => {
        const showError = touched.has(field) && !state[field];
        setFieldError(field, showError ? CONFIG.fieldErrors[field] : "");
      });
    };

    const update = () => {
      const state = getFormState(form, optionalDetails);
      const result = evaluate(state);
      renderErrors(state);

      if (result.neutral) {
        if (resultCard) resultCard.classList.add("result--neutral");
        resultPlaceholder.hidden = false;
        resultContent.hidden = true;
        lastRenderedScore = 50;
        return;
      }

      if (resultCard) resultCard.classList.remove("result--neutral");
      resultPlaceholder.hidden = true;
      resultContent.hidden = false;

      const shouldAnimate = Math.abs(result.score - lastRenderedScore) >= 5;
      animateScore(scoreEl, lastRenderedScore, result.score, shouldAnimate);
      lastRenderedScore = result.score;

      ampelEl.textContent = result.ampelText;
      interpEl.textContent = result.interpretation;
      const confidenceTextMap = {
        hoch: "Angaben weitgehend klar.",
        mittel: "Ein Punkt sollte noch geklärt werden.",
        niedrig: "Mehrere Punkte sind unklar – Ergebnis konservativ."
      };
      confidenceEl.textContent = `Sicherheit: ${result.confidence} – ${confidenceTextMap[result.confidence]}`;
      renderList(whyList, result.why.map(decorateWhyItem));
      renderList(stepsList, result.steps);
      renderList(pitfallsList, result.pitfalls);
    };

    form.querySelectorAll("fieldset[data-required='true']").forEach((fieldset) => {
      const field = fieldset.dataset.field;
      fieldset.addEventListener("focusout", (event) => {
        if (event.currentTarget.contains(event.relatedTarget)) return;
        touched.add(field);
        update();
      });
    });

    const markTouched = (event) => {
      let input = null;
      if (event.target && event.target.matches && event.target.matches("input[type=radio]")) {
        input = event.target;
      } else if (event.target && event.target.closest) {
        const label = event.target.closest("label");
        if (label) input = label.querySelector("input[type=radio]");
      }
      if (input && input.name) touched.add(input.name);
      update();
    };

    form.addEventListener("change", markTouched);
    form.addEventListener("input", markTouched);
    form.addEventListener("click", markTouched);

    let lastInfoToggleTs = 0;

    const handleInfoToggle = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const button = event.currentTarget;
      const now = Date.now();
      if (now - lastInfoToggleTs < 120) return;
      lastInfoToggleTs = now;

      const panelId = button.getAttribute("aria-controls");
      const panel = document.getElementById(panelId);
      const isOpen = button.getAttribute("aria-expanded") === "true";
      closeAllInfoPanels();
      if (!isOpen && panel) {
        panel.hidden = false;
        panel.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
      }
    };

    infoButtons.forEach((button) => {
      button.addEventListener("pointerup", handleInfoToggle);
      button.addEventListener("click", handleInfoToggle);
    });

    optionalDetails.addEventListener("toggle", () => {
      update();
    });

    resetBtn.addEventListener("click", () => {
      form.reset();
      touched.clear();
      closeAllInfoPanels();
      optionalDetails.open = false;
      CONFIG.requiredFields.forEach((field) => setFieldError(field, ""));
      update();
    });

    closeAllInfoPanels();
    update();
  }

  function runSelfTests() {
    const scenarios = [
      {
        id: "S1",
        state: { lage: "innen", bplan: "ja", typ: "bauluecke", nutzung: "wohnen", bestand: "", erschliessung: "", optionalActive: false },
        check: (r) => r.ampel === "🟢" && (!r.activeCaps || r.activeCaps.length === 0)
      },
      {
        id: "S2",
        state: { lage: "aussen", bplan: "ja", typ: "sonstiges", nutzung: "tiny", bestand: "", erschliessung: "", optionalActive: false },
        check: (r) => r.score <= 25 && r.ampel === "🔴"
      },
      {
        id: "S3",
        state: { lage: "innen", bplan: "ja", typ: "wald", nutzung: "wohnen", bestand: "", erschliessung: "", optionalActive: false },
        check: (r) => r.score <= 15 && r.ampel === "🔴"
      },
      {
        id: "S4",
        state: { lage: "innen", bplan: "ja", typ: "bauluecke", nutzung: "wohnen", bestand: "", erschliessung: "nicht", optionalActive: true },
        check: (r) => r.score <= 35 && r.ampel !== "🟢"
      },
      {
        id: "S5",
        state: { lage: "innen", bplan: "ja", typ: "freizeit", nutzung: "wochenende", bestand: "", erschliessung: "", optionalActive: false },
        check: (r) => r.score >= 30
      },
      {
        id: "S6",
        state: { lage: "innen", bplan: "ja", typ: "freizeit", nutzung: "wohnen", bestand: "", erschliessung: "", optionalActive: false },
        check: (r) => r.score <= 70
      },
      {
        id: "S7",
        state: { lage: "aussen", bplan: "nein", typ: "landwirtschaft", nutzung: "landwpriv", bestand: "", erschliessung: "", optionalActive: false },
        check: (r) => r.score >= 40 && r.score <= 70
      },
      {
        id: "S8",
        state: { lage: "", bplan: "ja", typ: "bauluecke", nutzung: "wohnen", bestand: "", erschliessung: "", optionalActive: false },
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
