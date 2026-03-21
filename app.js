(function () {
  const CONFIG = {
    requiredFields: ["lage", "bplan", "typ", "nutzung"],
    tieBreakerOrder: [
      "lage",
      "lage_detail",
      "bplan",
      "typ",
      "nutzung",
      "erschliessung",
      "bestand",
      "schutzgebiet",
      "wasserschutz",
      "hochwasser"
    ],
    interpretations: [
  { min: 1, max: 15, text: "Sehr schwierig: In dieser Konstellation wird dein Vorhaben meist nicht genehmigt – kläre zuerst die größten Ausschlussfaktoren." },
  { min: 16, max: 29, text: "Eher unwahrscheinlich – nur mit klaren Ausnahmen oder einer anderen Planung denkbar." },
  { min: 30, max: 45, text: "Teilweise denkbar, aber nur mit deutlichen Hürden und genauer Klärung." },
  { min: 46, max: 59, text: "Grenzfall: Es kann funktionieren, wenn die offenen Kernpunkte sauber geklärt werden." },
  { min: 60, max: 75, text: "Eher gute Tendenz – wenn die wichtigen Nachweise und Rahmenbedingungen passen." },
  { min: 76, max: 100, text: "Gute Ausgangslage – trotzdem solltest du die entscheidenden Punkte noch schriftlich prüfen." }
],
    caps: [
  {
  id: "cap_erschliessung_nicht",
  severity: "hard",
  max: 35,
  applies: (s) => s.erschliessung === "nicht",
  reason: "Ohne gesicherte Erschließung ist vor allem Neubau oder intensivere Nutzung meist nur schwer realistisch; maßgeblich bleibt der konkrete Einzelfall."
},
  {
  id: "cap_randlage",
  severity: "medium",
  max: 45,
  applies: (s) => s.lage_detail === "randlage",
  reason: "Randlage ist planungsrechtlich oft heikel weil die planungsrechtliche Einordnung dort besonders sorgfältig geprüft werden muss."
},
  {
  id: "cap_schutzgebiet_streng",
  severity: "hard",
  max: 25,
  applies: (s) => s.schutzgebiet === "streng",
  reason: "Strenges Schutzgebiet lässt Vorhaben oft nur stark eingeschränkt zu."
},
  {
  id: "cap_schutzgebiet_lsg",
  severity: "medium",
  max: 55,
  applies: (s) => s.schutzgebiet === "lsg",
  reason: "Landschaftsschutzgebiet begrenzt die Nutzung je nach Auflagen deutlich."
},
  {
  id: "cap_wasserschutz_zone12",
  severity: "hard",
  max: 35,
  applies: (s) => s.wasserschutz === "zone12",
  reason: "Wasserschutz (Zone I/II) kann je nach Schutzgebietsverordnung sehr enge Grenzen setzen."
},
  {
  id: "cap_wasserschutz_zone3",
  severity: "medium",
  max: 55,
  applies: (s) => s.wasserschutz === "zone3",
  reason: "Wasserschutz (Zone III) kann je nach Schutzgebietsverordnung zusätzliche Einschränkungen auslösen."
},
  {
  id: "cap_hochwasser_hq100",
  severity: "hard",
  max: 35,
  applies: (s) => s.hochwasser === "hq100",
  reason: "HQ100-Lage ist oft nur unter engen Voraussetzungen oder gar nicht bebaubar; die konkrete Gebietsfestsetzung ist entscheidend."
},
  {
  id: "cap_wald_wohnen",
  severity: "medium",
  max: 20,
  applies: (s) => s.typ === "wald" && isWohnen(s.nutzung),
  reason: "Waldflächen sind für Wohnen regelmäßig sehr problematisch; maßgeblich bleiben Einordnung, Erschließung und weitere Fachvorgaben."
}
],
    nextStepTemplates: {
  stopFactorIntro: "Diese Punkte solltest du zuerst klären, weil sie das Vorhaben schnell stoppen können.",
  lageUnklar: "Kläre zuerst, ob dein Grundstück im Innen- oder Außenbereich liegt – am besten über Bauamt oder amtliches Geoportal.",
  bplanUnklar: "Lass dir von der Gemeinde zeigen, ob ein Bebauungsplan gilt und was dort erlaubt ist.",
  bestandUnklar: "Kläre zuerst, ob der vorhandene Bestand überhaupt genehmigt ist.",
  erschlKlaeren: "Prüfe schriftlich, ob Zufahrt, Abwasser, Wasser und Strom gesichert sind.",
  aussenWohnen: "Lass zuerst schriftlich prüfen, ob Wohnen im Außenbereich in deinem Fall überhaupt denkbar ist.",
  aussenWochenende: "Lass zuerst schriftlich prüfen, ob Wochenendnutzung an diesem Standort zulässig sein kann.",
  waldWohnen: "Kläre mit Gemeinde oder Forstbehörde, ob die gewünschte Nutzung dort überhaupt in Betracht kommt.",
  bplanNein: "Ohne Bebauungsplan solltest du zuerst klären, nach welchen Regeln dein Grundstück beurteilt wird.",
  landwpriv: "Prüfe, ob die behauptete Privilegierung wirklich mit Unterlagen belegt werden kann.",
  freizeitWohnen: "Kläre schriftlich, ob das Grundstück nur für Freizeitnutzung gedacht ist oder ob Dauerwohnen überhaupt denkbar ist.",
  naturschutzKlaeren: "Prüfe zuerst den genauen Schutzstatus und welche Auflagen daraus folgen.",
  wasserschutzKlaeren: "Prüfe zuerst die Schutzzone und welche konkreten Einschränkungen dort gelten.",
  hochwasserKlaeren: "Prüfe zuerst, ob nur ein Risikohinweis vorliegt oder ein offiziell festgesetztes Hochwassergebiet.",
  geoportalPruefen: "Prüfe Schutzgebiete, Wasserschutz und Hochwasser zusätzlich im amtlichen Geoportal.",
  starkNegativ: "Sortiere die kritischsten Punkte zuerst, bevor du weiter planst oder kaufst.",
  fallback: "Wenn du unsicher bleibst, hol dir eine schriftliche Ersteinschätzung vom Bauamt."
},
    pitfallsTemplates: {
  anmeldung: "Nur weil du dich anmeldest, heißt das nicht, dass du dort auch wohnen darfst.",
  aussen: "Außenbereich heißt nicht automatisch unmöglich – aber Wohnen oder Neubau ist dort oft deutlich schwieriger.",
  freizeit: "Freizeitnutzung und dauerhaftes Wohnen sind rechtlich nicht dasselbe.",
  bestand: "Ein vorhandenes Gebäude bedeutet nicht automatisch, dass auch deine gewünschte Nutzung erlaubt ist.",
  naturschutz: "Ein strenges Schutzgebiet kann das Vorhaben stark einschränken oder ganz ausschließen.",
  wasserschutz: "In Wasserschutzgebieten können Neubau, Umbau oder Nutzungsänderung deutlich eingeschränkt sein.",
  hochwasser: "Hochwasserlagen können zu Bauverboten, Auflagen oder hohen Folgekosten führen.",
  general: "Aussagen aus Exposé oder Verkaufsgespräch ersetzen keine schriftliche Einordnung der Behörde.",
  fallback: "Mündliche Aussagen helfen weiter – wirklich belastbar ist am Ende nur die schriftliche Klärung."
},
    fieldErrors: {
      lage: "Bitte eine Lage auswählen.",
      bplan: "Bitte einen Bebauungsplan-Status auswählen.",
      typ: "Bitte einen Grundstückstyp auswählen.",
      nutzung: "Bitte eine geplante Nutzung auswählen."
    },
    consistencyRules: [
      {
        id: "lage_to_lage_detail",
        controller: "lage",
        dependent: "lage_detail",
        allValues: ["innen34", "aussen35", "randlage", "satzung", "unklar"],
        allowedByController: {
          innen: ["innen34", "satzung", "unklar"],
          aussen: ["aussen35", "randlage", "unklar"],
          unklar: ["innen34", "aussen35", "randlage", "satzung", "unklar"]
        },
        message: "Lage-Detail wurde zurückgesetzt, weil es nicht zur gewählten Lage passt."
      },
      {
        id: "typ_to_nutzung_landwpriv",
        controller: "typ",
        dependent: "nutzung",
        allValues: ["wohnen", "wochenende", "landwpriv", "gewerblich"],
        allowedByController: {
          landwirtschaft: ["wohnen", "wochenende", "landwpriv", "gewerblich"],
          bauluecke: ["wohnen", "wochenende", "gewerblich"],
          freizeit: ["wohnen", "wochenende", "gewerblich"],
          wald: ["wohnen", "wochenende", "gewerblich"],
          sonstiges: ["wohnen", "wochenende", "gewerblich"]
        },
        message: "„Landwirtschaftlich privilegiert“ wurde zurückgesetzt, weil der Grundstückstyp nicht zu dieser Nutzung passt."
      }
    ]
  };

  const TEMPLATES = {
    positives: {
      lage_innen: "Innenbereich ist oft planungsrechtlich günstiger.",
      bplan_ja: "Ein Bebauungsplan kann die planungsrechtliche Zulässigkeit klarer einordnen, ersetzt aber keine Prüfung weiterer Anforderungen.",
      typ_bauluecke: "Baulücken können die Ausgangslage verbessern, wenn sich das Vorhaben einfügt und die Erschließung gesichert ist.",
      typ_freizeit_wochenende: "Freizeitgrundstück passt eher zu Wochenendnutzung.",
      typ_landwpriv: "Privilegierte Landwirtschaft kann im Außenbereich eher möglich sein, wenn ein echter betrieblicher Bezug nachweisbar ist.",
      bestand_genehmigt: "Genehmigter Bestand kann die Ausgangslage stützen.",
      erschl_voll: "Voll erschlossen senkt praktische Hürden deutlich."
    },
    negatives: {
      lage_unklar: "Unklare Lage macht Genehmigungsrisiken schwer einschätzbar.",
      bplan_nein: "Ohne Bebauungsplan fehlen oft klare Leitplanken für die Nutzung.",
      bplan_unklar: "Unklarer Bebauungsplan erhöht das Planungsrisiko.",
      typ_freizeit_wohnen: "Freizeitgrundstück ist für Dauerwohnen häufig ungeeignet.",
      nutzung_gewerblich: "Gewerbliche Nutzung braucht oft zusätzliche Vorgaben und Nachweise.",
      erschl_teilweise: "Wenn Zufahrt oder Anschlüsse unklar sind, wird das Vorhaben schnell unsicher.",
landwpriv_unplausibel: "Ohne echten landwirtschaftlichen Bezug ist diese Nutzung meist schwer begründbar.",
innen34_einfuegen: "Im Innenbereich muss sich das Vorhaben zur Umgebung passend einfügen; der Grundstückstyp allein entscheidet das aber nicht.",
sonderfall_lsg: "Ein Landschaftsschutzgebiet kann zusätzliche Auflagen und Einschränkungen auslösen.",
sonderfall_zone3: "Wasserschutz in Zone III kann die Nutzung deutlich einschränken.",
sonderfall_hochwasser_hq100: "Eine HQ100-Lage kann das Vorhaben stark einschränken oder sogar verhindern."
    }
  };

  function isWohnen(nutzung) {
    return nutzung === "wohnen";
  }

  function isInsideIsh(state) {
    return state.lage === "innen" || state.lage_detail === "innen34" || state.lage_detail === "satzung";
  }

  function isOutsideIsh(state) {
    return state.lage === "aussen" || state.lage_detail === "aussen35" || state.lage_detail === "randlage";
  }

  function isAussenbereich(state) {
    return state.lage === "aussen";
  }

  function clipWords(text, maxWords) {
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text;
    const fillerWords = new Set(["und", "oder", "für"]);
    const trimmedWords = words.slice(0, maxWords);
    const lastWordRaw = trimmedWords[trimmedWords.length - 1] || "";
    const lastWord = lastWordRaw.toLowerCase().replace(/[,:;.!?]+$/, "");
    if (fillerWords.has(lastWord) && trimmedWords.length > 1) trimmedWords.pop();
    const shortened = trimmedWords.join(" ").replace(/[,:;.!?]+$/, "");
    return shortened + "…";
  }

  function normalizeText(text) {
    return String(text || "").toLowerCase().replace(/[.,:;!?]/g, "").replace(/\s+/g, " ").trim();
  }

  function dedupeTexts(values) {
    const seen = new Set();
    return values.filter((value) => {
      const normalized = normalizeText(value);
      if (!normalized || seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
  }

  function makeReason(field, impact, text, category) {
    return { field, impact, text, category };
  }

  function requiredComplete(state) {
    return CONFIG.requiredFields.every((field) => Boolean(state[field]));
  }

  function normalizeOptionalState(state) {
    if (!state.optionalActive) {
      return {
        ...state,
        bestand: "",
        erschliessung: "",
        lage_detail: "",
        schutzgebiet: "",
        wasserschutz: "",
        hochwasser: ""
      };
    }
    return state;
  }

  function computeOptionalActive(state) {
    return Boolean(state.bestand || state.erschliessung || state.lage_detail || state.schutzgebiet || state.wasserschutz || state.hochwasser);
  }

  function allowedValuesForRule(rule, state) {
    if (!rule || !rule.dependent) return [];
    const allValues = Array.isArray(rule.allValues) ? rule.allValues : [];
    const controllerValue = state[rule.controller];
    if (!controllerValue) return allValues;
    const configured = rule.allowedByController && rule.allowedByController[controllerValue];
    return Array.isArray(configured) && configured.length ? configured : allValues;
  }

  function sanitizeConsistencyState(rawState) {
    const state = { ...rawState };
    const conflicts = [];

    CONFIG.consistencyRules.forEach((rule) => {
      const dependentValue = state[rule.dependent];
      if (!dependentValue) return;
      const allowed = new Set(allowedValuesForRule(rule, state));
      if (!allowed.has(dependentValue)) {
        state[rule.dependent] = "";
        conflicts.push({
          ruleId: rule.id,
          dependent: rule.dependent,
          clearedValue: dependentValue,
          message: rule.message
        });
      }
    });

    state.optionalActive = computeOptionalActive(state);
    return { state, conflicts };
  }

  function applyConsistencyToForm(form, state) {
    const conflicts = [];

    CONFIG.consistencyRules.forEach((rule) => {
      const allowed = new Set(allowedValuesForRule(rule, state));
      const radios = form.querySelectorAll(`input[type="radio"][name="${rule.dependent}"]`);
      radios.forEach((radio) => {
        const enabled = allowed.has(radio.value);
        radio.disabled = !enabled;
        const tile = radio.closest(".tile");
        if (tile) tile.classList.toggle("is-disabled", !enabled);

        if (!enabled && radio.checked) {
          radio.checked = false;
          conflicts.push({
            ruleId: rule.id,
            dependent: rule.dependent,
            clearedValue: radio.value,
            message: rule.message
          });
        }
      });
    });

    return conflicts;
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
      const delta = isOutsideIsh(state) ? 8 : 12;
      score += delta;
      reasons.push(makeReason("bplan", delta, TEMPLATES.positives.bplan_ja, "positive"));
    } else if (state.bplan === "nein") {
      const delta = isInsideIsh(state) ? -2 : isOutsideIsh(state) ? -10 : -6;
      score += delta;
      reasons.push(makeReason("bplan", delta, TEMPLATES.negatives.bplan_nein, "negative"));
    } else if (state.bplan === "unklar") {
      score -= 5;
      reasons.push(makeReason("bplan", -5, TEMPLATES.negatives.bplan_unklar, "unclear"));
    }

    if (state.typ === "bauluecke" && isInsideIsh(state)) {
  score += 12;
  reasons.push(makeReason("typ", 12, TEMPLATES.positives.typ_bauluecke, "positive"));
}
    if (state.typ === "freizeit" && state.nutzung === "wochenende") {
  score += 6;
  reasons.push(makeReason("typ", 6, TEMPLATES.positives.typ_freizeit_wochenende, "positive"));
}
    if (state.typ === "freizeit" && isWohnen(state.nutzung)) {
      score -= 20;
      reasons.push(makeReason("typ", -20, TEMPLATES.negatives.typ_freizeit_wohnen, "negative"));
    }
    if (state.typ === "landwirtschaft" && state.nutzung === "landwpriv") {
      score += 6;
      reasons.push(makeReason("typ", 6, TEMPLATES.positives.typ_landwpriv, "positive"));
    }
    if (state.nutzung === "landwpriv" && state.typ !== "landwirtschaft") {
      score -= 12;
      reasons.push(makeReason("nutzung", -12, TEMPLATES.negatives.landwpriv_unplausibel, "negative"));
    }

    if (state.lage_detail === "innen34" && isWohnen(state.nutzung) && state.typ !== "bauluecke") {
  score -= 2;
  reasons.push(makeReason("lage_detail", -2, TEMPLATES.negatives.innen34_einfuegen, "negative"));
}

    if (state.nutzung === "gewerblich") {
      const delta = state.lage === "innen" && state.bplan === "ja" ? 0 : -5;
      score += delta;
      if (delta !== 0) reasons.push(makeReason("nutzung", -5, TEMPLATES.negatives.nutzung_gewerblich, "negative"));
    }

    if (state.bestand === "genehmigt") {
      const delta = isOutsideIsh(state) ? 4 : 8;
      score += delta;
      reasons.push(makeReason("bestand", delta, TEMPLATES.positives.bestand_genehmigt, "positive"));
    } else if (state.bestand === "unklar") {
      reasons.push(makeReason("bestand", 0, "Bestand ist unklar und sollte geprüft werden.", "unclear"));
    }

    if (state.erschliessung === "voll") {
      score += 10;
      reasons.push(makeReason("erschliessung", 10, TEMPLATES.positives.erschl_voll, "positive"));
    } else if (state.erschliessung === "teilweise") {
  score -= 10;
  reasons.push(makeReason("erschliessung", -10, TEMPLATES.negatives.erschl_teilweise, "unclear"));
}

    if (state.lage_detail === "randlage") {
  score -= 12;
  reasons.push(makeReason("lage_detail", -12, "Randlage ist planungsrechtlich oft unsicher und muss im Einzelfall sauber eingeordnet werden.", "negative"));
} else if (state.lage_detail === "satzung") {
  score += 2;
  reasons.push(makeReason("lage_detail", 2, "Ein klarer Satzungsbezug kann die Einordnung stützen, ersetzt aber keine Prüfung der konkreten Satzungsart und Festsetzungen.", "positive"));
}

    if (state.schutzgebiet === "lsg") {
      score -= 10;
      reasons.push(makeReason("schutzgebiet", -10, TEMPLATES.negatives.sonderfall_lsg, "negative"));
    }

    if (state.wasserschutz === "zone3") {
      score -= 8;
      reasons.push(makeReason("wasserschutz", -8, TEMPLATES.negatives.sonderfall_zone3, "negative"));
    }

    if (state.hochwasser === "hq100") {
      score -= 15;
      reasons.push(makeReason("hochwasser", -15, TEMPLATES.negatives.sonderfall_hochwasser_hq100, "negative"));
    } else if (state.hochwasser === "risiko") {
      score -= 8;
      reasons.push(makeReason("hochwasser", -8, "Hochwasserrisiko bringt zusätzliche Auflagen mit sich.", "negative"));
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

  function applyGates(score, state) {
  let current = score;
  const gates = [];
  const privileged = state.nutzung === "landwpriv";

  if (isOutsideIsh(state) && state.nutzung === "wohnen" && !privileged) {
    gates.push({
      id: "gate_outside_wohnen",
      severity: "hard",
      max: 25,
      reason: "Außenbereich/Randlage: Wohnen ist planungsrechtlich stark eingeschränkt."
    });
    current = Math.min(current, 25);
  } else if (isOutsideIsh(state) && state.nutzung === "wochenende" && state.typ === "freizeit") {
    gates.push({
      id: "gate_outside_wochenende_freizeit",
      severity: "medium",
      max: 40,
      reason: "Wochenendnutzung auf Freizeitgrundstücken im Außenbereich ist gesondert einzuordnen und oft klärungsbedürftig."
    });
    current = Math.min(current, 40);
  } else if (isOutsideIsh(state) && state.nutzung === "wochenende") {
    gates.push({
      id: "gate_outside_wochenende",
      severity: "hard",
      max: 25,
      reason: "Wochenendnutzung im Außenbereich ist planungsrechtlich stark eingeschränkt."
    });
    current = Math.min(current, 25);
  }

  return { score: current, gates };
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
    if (state.lage_detail === "unklar") unclear += 1;

    ["schutzgebiet", "wasserschutz", "hochwasser"].forEach((field) => {
      if (state[field] !== "" && state[field] === "unbekannt" && (isOutsideIsh(state) || state.lage === "unklar")) {
        unclear += 1;
      }
    });

    if (unclear === 0) return "hoch";
    if (unclear === 1) return "mittel";
    return "niedrig";
  }

  function sortReasons(reasons) {
    const order = Object.fromEntries(CONFIG.tieBreakerOrder.map((k, i) => [k, i]));
    return reasons.sort((a, b) => {
      const byImpact = Math.abs(b.impact) - Math.abs(a.impact);
      if (byImpact !== 0) return byImpact;
      const aOrder = Number.isFinite(order[a.field]) ? order[a.field] : Number.MAX_SAFE_INTEGER;
      const bOrder = Number.isFinite(order[b.field]) ? order[b.field] : Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.text.localeCompare(b.text, "de");
    });
  }

  function buildWhy(activeCaps, reasons) {
    const list = [];
    const stopCaps = activeCaps.filter((cap) => cap && cap.severity === "hard");
const otherCaps = activeCaps.filter((cap) => !stopCaps.includes(cap));
    stopCaps.forEach((cap) => list.push({ type: "cap", text: `Dominanter Faktor: ${cap.reason}` }));
    otherCaps.forEach((cap) => list.push({ type: "cap", text: cap.reason }));

    const negatives = sortReasons(reasons.filter((r) => r.impact < 0 && r.category !== "unclear"));
    const positives = sortReasons(reasons.filter((r) => r.impact > 0));
    const unclear = sortReasons(reasons.filter((r) => r.category === "unclear"));

    [
      negatives.map((r) => ({ type: "negative", text: r.text })),
      positives.map((r) => ({ type: "positive", text: r.text })),
      unclear.map((r) => ({ type: "unclear", text: r.text }))
    ].forEach((bucket) => {
      bucket.forEach((item) => {
        const allCapsShown = list.length >= activeCaps.length;
        const underDisplayLimit = list.length < Math.max(4, activeCaps.length);
        if (allCapsShown && underDisplayLimit && !list.some((existing) => existing.text === item.text)) list.push(item);
      });
    });

    return list.slice(0, Math.max(4, activeCaps.length)).map((item) => ({ type: item.type, text: clipWords(item.text, 22) }));
  }

  function buildNextSteps(state, reasons) {
    const steps = [];

         const restrictedUse =
  state.nutzung === "wohnen" ||
  (state.nutzung === "wochenende" && state.typ !== "freizeit");

const privileged = state.nutzung === "landwpriv";

const hasStopFactor =
  state.schutzgebiet === "streng" ||
  state.wasserschutz === "zone12" ||
  state.hochwasser === "hq100" ||
  state.erschliessung === "nicht" ||
  (state.typ === "wald" && isWohnen(state.nutzung)) ||
  (isOutsideIsh(state) && restrictedUse && !privileged);

  if (hasStopFactor) steps.push(CONFIG.nextStepTemplates.stopFactorIntro);
    if (state.schutzgebiet === "streng") steps.push(CONFIG.nextStepTemplates.naturschutzKlaeren);
    if (state.wasserschutz === "zone12") steps.push(CONFIG.nextStepTemplates.wasserschutzKlaeren);
    if (state.hochwasser === "hq100") steps.push(CONFIG.nextStepTemplates.hochwasserKlaeren);

    if (state.typ === "wald" && isWohnen(state.nutzung)) steps.push(CONFIG.nextStepTemplates.waldWohnen);
    if (state.lage === "aussen" && isWohnen(state.nutzung)) steps.push(CONFIG.nextStepTemplates.aussenWohnen);
    if (isAussenbereich(state) && state.nutzung === "wochenende") steps.push(CONFIG.nextStepTemplates.aussenWochenende);
    if (state.typ === "freizeit" && isWohnen(state.nutzung)) steps.push(CONFIG.nextStepTemplates.freizeitWohnen);
    if (state.typ === "landwirtschaft" && state.nutzung === "landwpriv") steps.push(CONFIG.nextStepTemplates.landwpriv);
    if (state.bplan === "nein") steps.push(CONFIG.nextStepTemplates.bplanNein);
    if (state.erschliessung === "teilweise" || state.erschliessung === "nicht") steps.push(CONFIG.nextStepTemplates.erschlKlaeren);

    if (state.lage === "unklar") steps.push(CONFIG.nextStepTemplates.lageUnklar);
    if (state.bplan === "unklar") steps.push(CONFIG.nextStepTemplates.bplanUnklar);
    if (state.bestand === "unklar") steps.push(CONFIG.nextStepTemplates.bestandUnklar);
    if (state.schutzgebiet === "lsg") steps.push(CONFIG.nextStepTemplates.naturschutzKlaeren);
    if (state.wasserschutz === "zone3") steps.push(CONFIG.nextStepTemplates.wasserschutzKlaeren);
    if (state.hochwasser === "risiko") steps.push(CONFIG.nextStepTemplates.hochwasserKlaeren);

    const hasUnknownSpecial = [state.schutzgebiet, state.wasserschutz, state.hochwasser].some((v) => v === "unbekannt");
    if (state.optionalActive && hasUnknownSpecial) steps.push(CONFIG.nextStepTemplates.geoportalPruefen);

    if (reasons.some((r) => r.impact <= -10)) steps.push(CONFIG.nextStepTemplates.starkNegativ);

    const unique = dedupeTexts(steps);
    const hasAuthorityStep = unique.some((step) => /bauamt|gemeinde|schriftlich/i.test(step));
    if (unique.length < 3 && !hasAuthorityStep) unique.push(CONFIG.nextStepTemplates.fallback);

    const topThree = unique.slice(0, 3);
    return topThree.map((item) => clipWords(item, 22));
  }

  function buildPitfalls(state) {
    const fallSpecific = [];
    if (state.lage === "aussen" || (state.typ === "wald" && isWohnen(state.nutzung))) fallSpecific.push(CONFIG.pitfallsTemplates.aussen);
    if (state.typ === "freizeit") fallSpecific.push(CONFIG.pitfallsTemplates.freizeit);
    if (state.bestand === "genehmigt" || state.bestand === "unklar") fallSpecific.push(CONFIG.pitfallsTemplates.bestand);
    if (state.schutzgebiet === "streng") fallSpecific.push(CONFIG.pitfallsTemplates.naturschutz);
    if (state.wasserschutz === "zone12") fallSpecific.push(CONFIG.pitfallsTemplates.wasserschutz);
    if (state.hochwasser === "hq100") fallSpecific.push(CONFIG.pitfallsTemplates.hochwasser);

    const selectedSpecific = dedupeTexts(fallSpecific).slice(0, 2);
    const pitfalls = dedupeTexts([CONFIG.pitfallsTemplates.anmeldung, ...selectedSpecific, CONFIG.pitfallsTemplates.general]);
    const fallbackOrder = [CONFIG.pitfallsTemplates.fallback, CONFIG.pitfallsTemplates.bestand];

    fallbackOrder.forEach((item) => {
      if (pitfalls.length >= 3) return;
      const alreadyIncluded = pitfalls.some((existing) => normalizeText(existing) === normalizeText(item));
      if (!alreadyIncluded) pitfalls.push(item);
    });

    return pitfalls.slice(0, 3).map((item) => clipWords(item, 20));
  }

  function ampel(score) {
    if (score <= 29) return "🔴";
    if (score <= 59) return "🟡";
    return "🟢";
  }

  function adjustAmpel(light, state, activeCaps) {
  const privileged = state.nutzung === "landwpriv";
  const hasHardStopCap = activeCaps.some((cap) => cap && cap.severity === "hard");

  if (hasHardStopCap && light !== "🔴") return "🔴";

  if (isAussenbereich(state) && state.nutzung === "wohnen" && !privileged && light === "🟢") {
    return "🟡";
  }

  if (
    isAussenbereich(state) &&
    state.nutzung === "wochenende" &&
    state.typ === "freizeit" &&
    light === "🟢"
  ) {
    return "🟡";
  }

  return light;
}

  function ampelLabel(light) {
  if (light === "🔴") return "🔴 Sehr unwahrscheinlich";
  if (light === "🟡") return "🟡 Nur mit Klärung";
  return "🟢 Gute Ausgangslage";
}

  function resultHeadline(light, planningConfidence) {
  if (light === "🔴") return "Aktuell spricht in dieser Konstellation mehr gegen als für dein Vorhaben.";
  if (light === "🟡") return "Es kann möglich sein – aber nur, wenn die offenen Kernpunkte sauber geklärt werden.";
  if (planningConfidence === "niedrig") return "Die Ausgangslage wirkt eher gut – es sind aber noch wichtige Punkte offen.";
  return "Die Ausgangslage wirkt gut – trotzdem solltest du die entscheidenden Punkte noch prüfen.";
}

  function practicalBullets(score, light) {
  if (light === "🔴") {
    return [
      "Mehrere wichtige Punkte sprechen aktuell gegen dein Vorhaben.",
      "Ohne schriftliche Klärung ist das Risiko für Fehlplanung oder Fehlkauf hoch.",
      "Bevor du weiter planst, solltest du zuerst die größten Hürden prüfen."
    ];
  }
  if (light === "🟡") {
    const inUpperYellow = score >= 46;
    return [
      inUpperYellow
        ? "Die Ausgangslage kann funktionieren, wenn die offenen Punkte geklärt werden."
        : "Ob es klappt, hängt stark von einzelnen offenen Punkten ab.",
      "Entscheidend sind jetzt vor allem schriftliche Nachweise statt Vermutungen.",
      "Plane erst weiter, wenn die wichtigsten Fragen sauber geklärt sind."
    ];
  }
  return [
    "Die Ausgangslage wirkt grundsätzlich passend.",
    "Trotzdem können Details wie Lage, Erschließung oder Schutzthemen das Ergebnis noch verändern.",
    "Vor größeren Investitionen solltest du dir die entscheidenden Punkte schriftlich bestätigen lassen."
  ];
}

  function interpretation(score) {
    return CONFIG.interpretations.find((bucket) => score >= bucket.min && score <= bucket.max).text;
  }

  function evaluate(rawState) {
    const sanitized = sanitizeConsistencyState(rawState);
    const state = normalizeOptionalState(sanitized.state);

    if (!requiredComplete(state)) {
      return {
        neutral: true,
        score: 50,
        ampel: "🟡",
        ampelText: ampelLabel("🟡"),
        interpretation: "Bitte alle Pflichtfelder auswählen, um deine Einschätzung zu erhalten.",
        headline: "",
        practical: [],
        why: [],
        steps: [],
        pitfalls: [],
        confidence: ""
      };
    }

    const modified = applyModifiers(state);
    const gated = applyGates(modified.score, state);
    const capped = applyCaps(gated.score, state);
    const activeCaps = [...gated.gates, ...capped.activeCaps];
    const finalScore = clampScore(capped.score);
    const rawLight = ampel(finalScore);
    const light = adjustAmpel(rawLight, state, activeCaps);
    const planningConfidence = confidence(state);

    return {
      neutral: false,
      score: finalScore,
      ampel: light,
      ampelText: ampelLabel(light),
      interpretation: interpretation(finalScore),
      headline: resultHeadline(light, planningConfidence),
      practical: practicalBullets(finalScore, light),
      why: buildWhy(activeCaps, modified.reasons),
      steps: buildNextSteps(state, modified.reasons),
      pitfalls: buildPitfalls(state),
      confidence: planningConfidence,
      activeCaps
    };
  }

  function getCheckedValue(form, name) {
    const checked = form.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : "";
  }

  function getFormState(form) {
    const bestand = getCheckedValue(form, "bestand");
    const erschliessung = getCheckedValue(form, "erschliessung");
    const lage_detail = getCheckedValue(form, "lage_detail");
    const schutzgebiet = getCheckedValue(form, "schutzgebiet");
    const wasserschutz = getCheckedValue(form, "wasserschutz");
    const hochwasser = getCheckedValue(form, "hochwasser");
    return {
      lage: getCheckedValue(form, "lage"),
      bplan: getCheckedValue(form, "bplan"),
      typ: getCheckedValue(form, "typ"),
      nutzung: getCheckedValue(form, "nutzung"),
      bestand,
      erschliessung,
      lage_detail,
      schutzgebiet,
      wasserschutz,
      hochwasser,
      optionalActive: computeOptionalActive({ bestand, erschliessung, lage_detail, schutzgebiet, wasserschutz, hochwasser })
    };
  }

  function renderList(target, values) {
    if (!target) return;
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
      unclear: "ⓘ"
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
    const headlineEl = document.getElementById("result-headline");
    const practicalList = document.getElementById("practical-list");
    const confidenceEl = document.getElementById("result-confidence");
    const confidenceTitleEl = document.getElementById("result-confidence-title");
    const whyList = document.getElementById("why-list");
    const stepsList = document.getElementById("steps-list");
    const stepsListMore = document.getElementById("steps-list-more");
    const primaryStepSection = document.getElementById("primary-step-section");
    const moreStepsSection = document.getElementById("more-steps-section");
    const pitfallsList = document.getElementById("pitfalls-list");
    const detailsToggle = document.getElementById("details-toggle");
    const resultDetails = document.getElementById("result-details");
    const resetBtn = document.getElementById("reset-button");
    const optionalDetails = document.getElementById("optional-details");
    const consistencyFeedback = document.getElementById("consistency-feedback");
    const infoButtons = form.querySelectorAll(".info-toggle");
    const infoPanels = form.querySelectorAll(".field-info");

    const touched = new Set();
    let lastRenderedScore = 50;
    const toolCompletedSessionKey = "gc_tool_completed_sent";

    const setHidden = (el, isHidden) => {
      if (el) el.hidden = isHidden;
    };

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

    const renderConsistencyFeedback = (conflicts) => {
      if (!consistencyFeedback) return;
      if (!Array.isArray(conflicts) || conflicts.length === 0) {
        consistencyFeedback.hidden = true;
        consistencyFeedback.textContent = "";
        return;
      }
      const uniqueMessages = dedupeTexts(conflicts.map((c) => c.message));
      consistencyFeedback.hidden = false;
      consistencyFeedback.textContent = uniqueMessages.join(" ");
    };

    const update = () => {
      const rawState = getFormState(form);
      const uiConflicts = applyConsistencyToForm(form, rawState);
      const postUiState = getFormState(form);
      const sanitized = sanitizeConsistencyState(postUiState);
      const state = sanitized.state;
      const result = evaluate(state);
      renderErrors(state);
      renderConsistencyFeedback([...uiConflicts, ...sanitized.conflicts]);

      if (result.neutral) {
        if (resultCard) resultCard.classList.add("result--neutral");
        setHidden(resultPlaceholder, false);
        setHidden(resultContent, true);
         if (detailsToggle && resultDetails) {
          detailsToggle.setAttribute("aria-expanded", "false");
          detailsToggle.textContent = "Analyse anzeigen";
          resultDetails.hidden = true;
        }
        lastRenderedScore = 50;
        return;
      }
      if (resultCard) resultCard.classList.remove("result--neutral");
      setHidden(resultPlaceholder, true);
      setHidden(resultContent, false);

      const shouldAnimate = Math.abs(result.score - lastRenderedScore) >= 5;
      if (scoreEl) animateScore(scoreEl, lastRenderedScore, result.score, shouldAnimate);
      lastRenderedScore = result.score;

      if (ampelEl) ampelEl.textContent = result.ampelText;
      if (headlineEl) headlineEl.textContent = result.headline;
      if (interpEl) interpEl.textContent = result.interpretation;
      renderList(practicalList, result.practical);
      const confidenceTextMap = {
  hoch: "Deine Angaben ergeben ein recht klares Bild.",
  mittel: "Ein wichtiger Punkt ist noch offen.",
  niedrig: "Mehrere wichtige Punkte sind noch offen oder unklar."
};
      if (confidenceEl) {
        if (result.confidence) {
          const isPositiveAmpel = result.ampel === "🟢";
          if (confidenceTitleEl) {
  confidenceTitleEl.textContent = "Einschätzungssicherheit";
}
          const detailText = isPositiveAmpel
  ? confidenceTextMap[result.confidence] || "Bitte als erste Einschätzung verstehen."
  : {
      hoch: "Die Einschätzung ist für diese Konstellation recht klar.",
      mittel: "Die Einschätzung ist brauchbar – ein wichtiger Punkt ist noch offen.",
      niedrig: "Die Einschätzung ist vorläufig – mehrere wichtige Punkte sind noch unklar."
    }[result.confidence] || "Bitte als erste Einschätzung verstehen.";
          confidenceEl.textContent = `${result.confidence} – ${detailText}`;
        } else {
          confidenceEl.textContent = "";
        }
      }
      renderList(whyList, result.why.map(decorateWhyItem));
      const primaryStep = result.steps.length > 0 ? [result.steps[0]] : [];
      const moreSteps = result.steps.length > 1 ? result.steps.slice(1) : [];
      renderList(stepsList, primaryStep);
      renderList(stepsListMore, moreSteps);
      setHidden(primaryStepSection, primaryStep.length === 0);
      setHidden(moreStepsSection, moreSteps.length === 0);
      renderList(pitfallsList, result.pitfalls);

      if (
        requiredComplete(state) &&
        window.localStorage.getItem("gc_consent") === "granted" &&
        typeof window.gtag === "function" &&
        !window.sessionStorage.getItem(toolCompletedSessionKey)
      ) {
        window.gtag("event", "tool_completed", {
          value: result.score,
          score: result.score,
          ampel: result.ampelText,
          confidence: result.confidence
        });
        window.sessionStorage.setItem(toolCompletedSessionKey, "1");
      }
    };

    form.querySelectorAll("fieldset[data-required='true']").forEach((fieldset) => {
      const field = fieldset.dataset.field;
      fieldset.addEventListener("focusout", (event) => {
        if (event.currentTarget.contains(event.relatedTarget)) return;
        touched.add(field);
        update();
      });
    });

        // Update-Batching: verhindert mehrere Re-Renders pro Klick (fühlt sich "snappier" an)
    let updateRaf = 0;
    const scheduleUpdate = () => {
      if (updateRaf) return;
      updateRaf = window.requestAnimationFrame(() => {
        updateRaf = 0;
        update();
      });
    };

    // Bei Radios reicht "change" völlig (input/click würden nur doppelt feuern)
    const onFormChange = (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.type !== "radio") return;

      if (target.name) touched.add(target.name);
      scheduleUpdate();
    };

    form.addEventListener("change", onFormChange);

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
      button.addEventListener("click", handleInfoToggle);
    });

        if (detailsToggle && resultDetails) {
      const CLOSED_LABEL = "Analyse anzeigen";
      const OPEN_LABEL = "Analyse ausblenden";

      // Falls HTML-Label abweicht: initial glattziehen
      detailsToggle.textContent = CLOSED_LABEL;

      detailsToggle.addEventListener("click", () => {
        const expanded = detailsToggle.getAttribute("aria-expanded") === "true";
        const next = !expanded;

        detailsToggle.setAttribute("aria-expanded", String(next));
        detailsToggle.textContent = next ? OPEN_LABEL : CLOSED_LABEL;
        resultDetails.hidden = !next;
      });
    }

        if (optionalDetails) {
      optionalDetails.addEventListener("toggle", () => {
        // falls scheduleUpdate existiert (siehe Block 1)
        if (typeof scheduleUpdate === "function") scheduleUpdate();
        else update();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        form.reset();
        touched.clear();
        window.sessionStorage.removeItem(toolCompletedSessionKey);
        if (window.localStorage.getItem("gc_consent") === "granted" && typeof window.gtag === "function") {
          window.gtag("event", "tool_reset");
        }
        closeAllInfoPanels();
        if (optionalDetails) optionalDetails.open = false;
        if (detailsToggle && resultDetails) {
          detailsToggle.setAttribute("aria-expanded", "false");
          detailsToggle.textContent = "Analyse anzeigen";
          resultDetails.hidden = true;
        }
        CONFIG.requiredFields.forEach((field) => setFieldError(field, ""));
        update();
      });
    }

    closeAllInfoPanels();
    update();
  }

  function runSelfTests() {
    const baseline = { lage: "innen", bplan: "ja", typ: "bauluecke", nutzung: "wohnen", bestand: "", erschliessung: "", optionalActive: false };
    const baselineResult = evaluate(baseline);
    const emptyOptionalVariant = evaluate({
      ...baseline,
      lage_detail: "",
      schutzgebiet: "",
      wasserschutz: "",
      hochwasser: "",
      optionalActive: false
    });

    const scenarios = [
      {
        id: "T1",
        state: { lage: "aussen", bplan: "ja", typ: "sonstiges", nutzung: "wohnen", optionalActive: false },
        check: (r) => r.score <= 25
      },
      {
        id: "T2",
        state: {
          lage: "aussen",
          bplan: "ja",
          typ: "sonstiges",
          nutzung: "wohnen",
          bestand: "genehmigt",
          optionalActive: true
        },
        check: (r) => r.score <= 25
      },
      {
        id: "T3",
        state: { lage: "innen", bplan: "ja", typ: "bauluecke", nutzung: "wohnen", optionalActive: false },
        check: (r) => r.score > 60
      },
      {
        id: "T4",
        state: {
          lage: "innen",
          bplan: "ja",
          typ: "bauluecke",
          nutzung: "wohnen",
          lage_detail: "randlage",
          optionalActive: true
        },
        check: (r) => {
          const control = evaluate({
            lage: "innen",
            bplan: "ja",
            typ: "bauluecke",
            nutzung: "wohnen",
            lage_detail: "",
            optionalActive: false
          });
          return r.score === control.score && r.ampel === control.ampel;
        }
      },
      {
        id: "T5",
        state: {
          lage: "innen",
          bplan: "ja",
          typ: "bauluecke",
          nutzung: "wohnen",
          schutzgebiet: "streng",
          optionalActive: true
        },
        check: (r) => {
  const caps = Array.isArray(r.activeCaps) ? r.activeCaps : [];
  const hasStreng = caps.some((c) => c && c.id === "cap_schutzgebiet_streng");
  return r.score <= 25 && hasStreng;
}
      },
      {
  id: "T6",
  state: {
    lage: "innen",
    bplan: "ja",
    typ: "bauluecke",
    nutzung: "wohnen",
    schutzgebiet: "streng",
    wasserschutz: "zone12",
    hochwasser: "hq100",
    optionalActive: true
  },
  check: (r) => {
const caps = Array.isArray(r.activeCaps) ? r.activeCaps : [];
const hasStreng = caps.some((c) => c && c.id === "cap_schutzgebiet_streng");
const hasZone12 = caps.some((c) => c && c.id === "cap_wasserschutz_zone12");
const hasHq100 = caps.some((c) => c && c.id === "cap_hochwasser_hq100");

return (
  r.ampel === "🔴" &&
  r.score <= 25 &&
  hasStreng &&
  hasZone12 &&
  hasHq100 &&
  r.steps.length > 0
);
}
},
      {
        id: "T7",
        state: baseline,
        check: () =>
          baselineResult.score === emptyOptionalVariant.score &&
          baselineResult.ampel === emptyOptionalVariant.ampel &&
          JSON.stringify(baselineResult.why) === JSON.stringify(emptyOptionalVariant.why) &&
          JSON.stringify(baselineResult.steps) === JSON.stringify(emptyOptionalVariant.steps) &&
          JSON.stringify(baselineResult.pitfalls) === JSON.stringify(emptyOptionalVariant.pitfalls)
      },
      {
        id: "T8",
        state: { ...baseline, nutzung: "wohnen" },
        check: (r) => r.score === baselineResult.score && r.ampel === baselineResult.ampel
      },
      {
        id: "T9",
        state: {
          lage: "innen",
          bplan: "ja",
          typ: "bauluecke",
          nutzung: "wohnen",
          schutzgebiet: "streng",
          wasserschutz: "zone12",
          hochwasser: "hq100",
          optionalActive: true
        },
        check: (r) => {
  const caps = Array.isArray(r.activeCaps) ? r.activeCaps : [];
  const hasStreng = caps.some((c) => c && c.id === "cap_schutzgebiet_streng");
  const hasZone12 = caps.some((c) => c && c.id === "cap_wasserschutz_zone12");
  const hasHq100 = caps.some((c) => c && c.id === "cap_hochwasser_hq100");
  return hasStreng && hasZone12 && hasHq100;
}
      },
      {
        id: "T10",
        state: {
          lage: "aussen",
          bplan: "ja",
          typ: "sonstiges",
          nutzung: "wohnen",
          lage_detail: "aussen35",
          optionalActive: true
        },
        check: (r) =>
  r.score <= 25 &&
  r.ampel === "🔴" &&
  Array.isArray(r.activeCaps) &&
  r.activeCaps.some((cap) => cap && cap.id === "gate_outside_wohnen")
      },
      {
        id: "T11",
        state: baseline,
        check: (r) => !r.pitfalls.some((item) => /tiny house/i.test(item))
      },
            {
        id: "T12",
        state: {
          lage: "innen",
          bplan: "ja",
          typ: "bauluecke",
          nutzung: "wohnen",
          erschliessung: "nicht",
          optionalActive: true
        },
        check: (r) => r.steps[0] && /Diese Punkte solltest du zuerst klären/i.test(r.steps[0])
      },
      {
        id: "T13",
        state: {
          lage: "aussen",
          bplan: "ja",
          typ: "sonstiges",
          nutzung: "wohnen",
          lage_detail: "aussen35",
          optionalActive: true
        },
        check: (r) => r.steps[0] && /Diese Punkte solltest du zuerst klären/i.test(r.steps[0])
      },
      {
        id: "T14",
        state: {
          lage: "innen",
          bplan: "ja",
          typ: "bauluecke",
          nutzung: "wohnen",
          lage_detail: "aussen35",
          optionalActive: true
        },
        check: (r) => {
          const control = evaluate({
            lage: "innen",
            bplan: "ja",
            typ: "bauluecke",
            nutzung: "wohnen",
            lage_detail: "",
            optionalActive: false
          });
          return r.score === control.score && r.ampel === control.ampel;
        }
      },
      {
        id: "T15",
        state: {
          lage: "innen",
          bplan: "ja",
          typ: "bauluecke",
          nutzung: "landwpriv",
          optionalActive: false
        },
        check: (r) => {
          const control = evaluate({
            lage: "innen",
            bplan: "ja",
            typ: "bauluecke",
            nutzung: "",
            optionalActive: false
          });
          return r.neutral === control.neutral && r.interpretation === control.interpretation;
        }
      },
      {
  id: "T16",
  state: {
    lage: "aussen",
    bplan: "nein",
    typ: "wald",
    nutzung: "wohnen",
    optionalActive: false
  },
  check: (r) =>
    r.score <= 20 &&
    r.ampel === "🔴"
},
      {
        id: "T17",
        state: {
          lage: "aussen",
          bplan: "ja",
          typ: "freizeit",
          nutzung: "wochenende",
          optionalActive: false
        },
        check: (r) =>
          r.score <= 40 &&
          r.ampel === "🟡" &&
          Array.isArray(r.activeCaps) &&
          r.activeCaps.some((cap) => cap && cap.id === "gate_outside_wochenende_freizeit")
      },
      {
        id: "T18",
        state: {
          lage: "aussen",
          bplan: "ja",
          typ: "sonstiges",
          nutzung: "wochenende",
          optionalActive: false
        },
        check: (r) =>
          r.score <= 25 &&
          r.ampel === "🔴" &&
          Array.isArray(r.activeCaps) &&
          r.activeCaps.some((cap) => cap && cap.id === "gate_outside_wochenende")
      }
    ];

    return scenarios.map((s) => ({ id: s.id, pass: s.check(evaluate(s.state)), result: evaluate(s.state) }));
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { evaluate, runSelfTests, clipWords, sanitizeConsistencyState };
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", attachApp);
  }
})();
