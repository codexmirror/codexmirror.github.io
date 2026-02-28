(function () {
  const MAX_MONTHS = 600;
  const LABELS = {
    kaufpreis: "Kaufpreis",
    eigenkapital: "Eigenkapital",
    kaufnebenkosten: "Kaufnebenkosten",
    zinssatz: "Zinssatz",
    kaltmiete: "Kaltmiete",
    jahre: "Jahre",
    rate: "Monatsrate",
    mietsteigerung: "Mietsteigerung",
    wertentwicklung: "Immobilienwertentwicklung"
  };

  function parseNumber(value) {
    if (value === "" || value === null || typeof value === "undefined") return null;
    const normalized = String(value).replace(",", ".").trim();
    if (!normalized) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value || 0);
  }

  function formatMonthsToYears(months) {
    const years = months / 12;
    return years.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  function monthlyFactorFromAnnual(annualPct) {
    return Math.pow(1 + annualPct / 100, 1 / 12) - 1;
  }

  function calcRentTotal(startRent, months, mietsteigerungPct) {
    if (mietsteigerungPct === null) return startRent * months;
    const monthlyIncrease = monthlyFactorFromAnnual(mietsteigerungPct);
    let rent = startRent;
    let total = 0;
    for (let index = 0; index < months; index += 1) {
      total += rent;
      rent *= 1 + monthlyIncrease;
    }
    return total;
  }

  function calcPropertyEndValue(kaufpreis, months, wertentwicklungPct) {
    if (wertentwicklungPct === null) return kaufpreis;
    const monthlyGrowth = monthlyFactorFromAnnual(wertentwicklungPct);
    return kaufpreis * Math.pow(1 + monthlyGrowth, months);
  }

  function calculateRateForYears(darlehen, monthlyRate, years) {
    const months = years * 12;
    if (darlehen === 0) return { valid: true, rate: 0, months };
    if (months <= 0) return { valid: false, errorCode: "range" };
    if (monthlyRate === 0) return { valid: true, rate: darlehen / months, months };
    const denominator = 1 - Math.pow(1 + monthlyRate, -months);
    if (denominator <= 0) return { valid: false, errorCode: "range" };
    return { valid: true, rate: (darlehen * monthlyRate) / denominator, months };
  }

  function calculateMonthsForRate(darlehen, monthlyRate, rate) {
    if (darlehen === 0) return { valid: true, months: 0, rate: Math.max(rate, 0) };
    let rest = darlehen;
    let months = 0;

    while (rest > 0 && months < MAX_MONTHS) {
      const zins = rest * monthlyRate;
      const tilgung = rate - zins;
      if (tilgung <= 0) return { valid: false, errorCode: "interest_not_covered" };
      rest -= tilgung;
      months += 1;
    }

    if (rest > 0) return { valid: false, errorCode: "too_long" };
    return { valid: true, months, rate };
  }

  function validateInputs(inputs) {
    const required = ["kaufpreis", "eigenkapital", "kaufnebenkosten", "zinssatz", "kaltmiete"];
    if (required.some((key) => inputs[key] === null)) return { ok: false, errorCode: "missing_required" };
    if (inputs.mode === "jahre" && inputs.jahre === null) return { ok: false, errorCode: "missing_required" };
    if (inputs.mode === "rate" && inputs.rate === null) return { ok: false, errorCode: "missing_required" };

    const invalidFieldKeys = [];
    if (inputs.kaufpreis < 0) invalidFieldKeys.push("kaufpreis");
    if (inputs.eigenkapital < 0) invalidFieldKeys.push("eigenkapital");
    if (inputs.kaufnebenkosten < 0 || inputs.kaufnebenkosten > 100) invalidFieldKeys.push("kaufnebenkosten");
    if (inputs.zinssatz < 0 || inputs.zinssatz > 100) invalidFieldKeys.push("zinssatz");
    if (inputs.kaltmiete < 0) invalidFieldKeys.push("kaltmiete");
    if (inputs.jahre !== null && (inputs.jahre <= 0 || inputs.jahre > 50)) invalidFieldKeys.push("jahre");
    if (inputs.rate !== null && inputs.rate < 0) invalidFieldKeys.push("rate");
    if (inputs.mietsteigerung !== null && (inputs.mietsteigerung < 0 || inputs.mietsteigerung > 50)) invalidFieldKeys.push("mietsteigerung");
    if (inputs.wertentwicklung !== null && (inputs.wertentwicklung < -20 || inputs.wertentwicklung > 50)) invalidFieldKeys.push("wertentwicklung");

    if (invalidFieldKeys.length) return { ok: false, errorCode: "range", invalidFieldKeys };
    return { ok: true };
  }

  function evaluate(inputs) {
    const validation = validateInputs(inputs);
    if (!validation.ok) return { valid: false, errorCode: validation.errorCode, invalidFieldKeys: validation.invalidFieldKeys || [] };

    const kaufnebenkostenEur = inputs.kaufpreis * (inputs.kaufnebenkosten / 100);
    const darlehen = Math.max(0, inputs.kaufpreis + kaufnebenkostenEur - inputs.eigenkapital);
    const monthlyRate = (inputs.zinssatz / 100) / 12;

    const financing =
      inputs.mode === "jahre"
        ? calculateRateForYears(darlehen, monthlyRate, inputs.jahre)
        : calculateMonthsForRate(darlehen, monthlyRate, inputs.rate);

    if (!financing.valid) return { valid: false, errorCode: financing.errorCode };

    const months = financing.months;
    const usedRate = financing.rate;
    const rentTotal = calcRentTotal(inputs.kaltmiete, months, inputs.mietsteigerung);
    const buyTotal = (usedRate * months) + kaufnebenkostenEur;
    const propertyEndValue = calcPropertyEndValue(inputs.kaufpreis, months, inputs.wertentwicklung);
    const diff = Math.abs(buyTotal - rentTotal);

    return {
      valid: true,
      mode: inputs.mode,
      months,
      rate: usedRate,
      kaufnebenkostenEur,
      rentTotal,
      buyTotal,
      buyAverage: months === 0 ? 0 : buyTotal / months,
      rentAverage: months === 0 ? 0 : rentTotal / months,
      propertyEndValue,
      winner: buyTotal <= rentTotal ? "buy" : "rent",
      diff
    };
  }

  function errorMessageFromCode(code, invalidFieldKeys) {
    if (code === "missing_required") return "Bitte fülle alle Pflichtfelder aus.";
    if (code === "range") {
      const labels = (invalidFieldKeys || []).map((key) => LABELS[key]).filter(Boolean);
      return labels.length ? `Bitte Wertebereiche prüfen (${labels.join(", ")}).` : "Bitte Wertebereiche prüfen.";
    }

    if (code === "interest_not_covered") return "Die Monatsrate deckt die Zinsen nicht.";
    if (code === "too_long") return "Mit dieser Monatsrate dauert die Abzahlung zu lange.";
    return "Bitte Wertebereiche prüfen.";
  }

  function attachApp() {
    const form = document.getElementById("rentbuy-form");
    if (!form) return;

    const elements = {
      kaufpreis: document.getElementById("kaufpreis"),
      eigenkapital: document.getElementById("eigenkapital"),
      kaufnebenkosten: document.getElementById("kaufnebenkosten"),
      zinssatz: document.getElementById("zinssatz"),
      kaltmiete: document.getElementById("kaltmiete"),
      jahre: document.getElementById("jahre"),
      rate: document.getElementById("rate"),
      mietsteigerung: document.getElementById("mietsteigerung"),
      wertentwicklung: document.getElementById("wertentwicklung")
    };

    const modeInputs = Array.from(form.querySelectorAll('input[name="modus"]'));
    const errorNode = document.getElementById("rentbuy-error");
    const placeholder = document.getElementById("result-placeholder");
    const panel = document.getElementById("result-panel");
    const autoRateText = document.getElementById("auto-rate-text");
    const autoYearsText = document.getElementById("auto-years-text");
    const infoButtons = form.querySelectorAll(".info-toggle");
    const infoPanels = form.querySelectorAll(".field-info");

    function closeAllInfoPanels() {
      infoPanels.forEach((panel) => {
        panel.hidden = true;
        panel.classList.remove("is-open");
      });

      infoButtons.forEach((button) => {
        button.setAttribute("aria-expanded", "false");
      });
    }

    function getInputs() {
      const modeNode = form.querySelector('input[name="modus"]:checked');
      return {
        mode: modeNode ? modeNode.value : "jahre",
        kaufpreis: parseNumber(elements.kaufpreis.value),
        eigenkapital: parseNumber(elements.eigenkapital.value),
        kaufnebenkosten: parseNumber(elements.kaufnebenkosten.value),
        zinssatz: parseNumber(elements.zinssatz.value),
        kaltmiete: parseNumber(elements.kaltmiete.value),
        jahre: parseNumber(elements.jahre.value),
        rate: parseNumber(elements.rate.value),
        mietsteigerung: parseNumber(elements.mietsteigerung.value),
        wertentwicklung: parseNumber(elements.wertentwicklung.value)
      };
    }

    function syncMode(mode) {
      const yearsActive = mode === "jahre";
      elements.jahre.disabled = !yearsActive;
      elements.rate.disabled = yearsActive;
    }

function render(result) {
  const buyCard = document.getElementById("buy-card");
  const rentCard = document.getElementById("rent-card");
  const headline = document.getElementById("result-headline");
  const period = document.getElementById("result-period");
  const details = document.getElementById("details-list");

  autoRateText.textContent = `Berechnete Monatsrate: ${formatCurrency(result.rate)}`;
  autoYearsText.textContent = `Berechnete Laufzeit: ${formatMonthsToYears(result.months)} Jahre`;

  placeholder.hidden = true;
  panel.hidden = false;
  errorNode.textContent = "";

  const winnerText = result.winner === "buy" ? "Kaufen" : "Mieten";
  headline.textContent = `Unter deinen Annahmen ist ${winnerText} um ${formatCurrency(result.diff)} günstiger.`;
  period.textContent = `Vergleichszeitraum: ${formatMonthsToYears(result.months)} Jahre`;

  document.getElementById("buy-total").textContent = formatCurrency(result.buyTotal);
  document.getElementById("buy-total-label").textContent = `Gesamtzahlung über ${formatMonthsToYears(result.months)} Jahre`;
  document.getElementById("buy-avg").textContent = formatCurrency(result.buyAverage);

  document.getElementById("rent-total").textContent = formatCurrency(result.rentTotal);
  document.getElementById("rent-total-label").textContent = `Gesamtzahlung über ${formatMonthsToYears(result.months)} Jahre`;
  document.getElementById("rent-avg").textContent = formatCurrency(result.rentAverage);

  buyCard.classList.toggle("is-winner", result.winner === "buy");
  rentCard.classList.toggle("is-winner", result.winner === "rent");
  panel.dataset.winner = result.winner;

  details.innerHTML = "";
  const detailItems = [
    result.mode === "jahre"
      ? `Berechnete Monatsrate: ${formatCurrency(result.rate)}`
      : `Berechnete Laufzeit: ${formatMonthsToYears(result.months)} Jahre`,
    `Kaufnebenkosten: ${formatCurrency(result.kaufnebenkostenEur)}`,
    `Gesamte Miete: ${formatCurrency(result.rentTotal)}`,
    `Endwert Immobilie: ${formatCurrency(result.propertyEndValue)}`
  ];

  detailItems.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    details.appendChild(li);
  });
}

    function renderError(message, inputState) {
      panel.hidden = true;
      placeholder.hidden = false;
      errorNode.textContent = message;
      delete panel.dataset.winner;

      const preview = evaluate({ ...inputState, mode: "jahre", rate: null });
      if (preview.valid) {
        autoRateText.textContent = `Berechnete Monatsrate: ${formatCurrency(preview.rate)}`;
      } else {
        autoRateText.textContent = "Berechnete Monatsrate: –";
      }

      const previewRate = inputState.rate === null ? 0 : inputState.rate;
      const yearPreview = evaluate({ ...inputState, mode: "rate", jahre: null, rate: previewRate });
      if (yearPreview.valid) {
        autoYearsText.textContent = `Berechnete Laufzeit: ${formatMonthsToYears(yearPreview.months)} Jahre`;
      } else {
        autoYearsText.textContent = "Berechnete Laufzeit: –";
      }
    }

    function update() {
      const inputState = getInputs();
      syncMode(inputState.mode);
      const result = evaluate(inputState);
      if (!result.valid) {
        renderError(errorMessageFromCode(result.errorCode, result.invalidFieldKeys), inputState);
        return;
      }
      render(result);
    }

    form.addEventListener("input", update);
    modeInputs.forEach((input) => input.addEventListener("change", update));

    infoButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const panelId = button.getAttribute("aria-controls");
        const panel = panelId ? document.getElementById(panelId) : null;
        const isOpen = button.getAttribute("aria-expanded") === "true";

        closeAllInfoPanels();

        if (!isOpen && panel) {
          panel.hidden = false;
          panel.classList.add("is-open");
          button.setAttribute("aria-expanded", "true");
        }
      });
    });

    const initialModeNode = form.querySelector('input[name="modus"]:checked');
    syncMode(initialModeNode ? initialModeNode.value : "jahre");
    closeAllInfoPanels();
    update();
  }

  function runSelfTests() {
    const base = {
      kaufpreis: 350000,
      eigenkapital: 70000,
      kaufnebenkosten: 10,
      zinssatz: 3.5,
      kaltmiete: 1400,
      mietsteigerung: null,
      wertentwicklung: null
    };

    const byYears = evaluate({ ...base, mode: "jahre", jahre: 25, rate: null });
    const byRate = evaluate({ ...base, mode: "rate", jahre: null, rate: 1800 });
    const invalidRate = evaluate({ ...base, mode: "rate", jahre: null, rate: 100 });
    const rentNoIncrease = evaluate({ ...base, mode: "jahre", jahre: 20, rate: null, mietsteigerung: null });
    const rentWithIncrease = evaluate({ ...base, mode: "jahre", jahre: 20, rate: null, mietsteigerung: 3 });
    const optionalBlank = evaluate({ ...base, mode: "jahre", jahre: 25, rate: null, mietsteigerung: null, wertentwicklung: null });
    const optionalEmptyStringEquivalent = evaluate({ ...base, mode: "jahre", jahre: 25, rate: null, mietsteigerung: null, wertentwicklung: null });
    const noLoan = evaluate({
      ...base,
      mode: "jahre",
      jahre: 20,
      rate: null,
      eigenkapital: 500000
    });

    return [
      { id: "T1", pass: byYears.valid && Number.isFinite(byYears.rate) && byYears.months === 300 },
      { id: "T2", pass: byRate.valid && byRate.months > 0 },
      { id: "T3", pass: !invalidRate.valid && invalidRate.errorCode === "interest_not_covered" },
      { id: "T4", pass: rentWithIncrease.valid && rentNoIncrease.valid && rentWithIncrease.rentTotal > rentNoIncrease.rentTotal },
      {
        id: "T5",
        pass:
          optionalBlank.valid &&
          optionalEmptyStringEquivalent.valid &&
          Math.abs(optionalBlank.buyTotal - optionalEmptyStringEquivalent.buyTotal) < 0.001 &&
          Math.abs(optionalBlank.rentTotal - optionalEmptyStringEquivalent.rentTotal) < 0.001
      },
      { id: "T6", pass: noLoan.valid && noLoan.buyTotal === noLoan.kaufnebenkostenEur && noLoan.months === 240 }
    ];
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      evaluate,
      runSelfTests,
      parseNumber,
      LABELS
    };
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", attachApp);
  }
})();
