(function () {
  /*
    Modellannahmen (MVP):
    - Kreditzins monatlich als nominaler Satz: (Zins p.a.) / 12.
    - Miet-/Wert-/Rendite-Wachstum monatlich: (1+r_pa)^(1/12)-1.
    - Tilgung ist keine Kostenposition fuer NettoEndwert.
    - Vergleichsmetrik: NettoEndwert = Endvermoegen - nicht-vermoegensbildende Kosten.
  */

  const REQUIRED_FIELDS = [
    "purchasePrice",
    "equity",
    "closingCostPct",
    "interestPaPct",
    "financeMode",
    "rentMonthly",
    "years"
  ];

  const OPTIONAL_FIELDS = [
    "maintenanceYearly",
    "hoaMonthly",
    "rentGrowthPaPct",
    "propertyGrowthPaPct",
    "opportunityPaPct",
    "renovationOneOff",
    "sellingCostPct"
  ];

  const EUR_FIELDS = [
    "purchasePrice",
    "equity",
    "rentMonthly",
    "monthlyPayment",
    "maintenanceYearly",
    "hoaMonthly",
    "renovationOneOff"
  ];

  const PCT_FIELDS = [
    "closingCostPct",
    "interestPaPct",
    "rentGrowthPaPct",
    "propertyGrowthPaPct",
    "opportunityPaPct",
    "sellingCostPct"
  ];

  const LABEL_MAP = {
    purchasePrice: "Kaufpreis (EUR)",
    equity: "Eigenkapital (EUR)",
    closingCostPct: "Kaufnebenkosten (%)",
    interestPaPct: "Zinssatz p.a. (%)",
    financeMode: "Finanzierungsziel",
    monthlyPayment: "Max. Monatsrate (EUR)",
    payoffYears: "Schuldenfrei in (Jahre)",
    rentMonthly: "Kaltmiete pro Monat (EUR)",
    years: "Vergleichszeitraum (Jahre)",
    maintenanceYearly: "Instandhaltung (EUR/Jahr)",
    hoaMonthly: "Hausgeld (EUR/Monat)",
    rentGrowthPaPct: "Mietsteigerung p.a. (%)",
    propertyGrowthPaPct: "Immobilienwertentwicklung p.a. (%)",
    opportunityPaPct: "Opportunitaetsrendite p.a. (%)",
    renovationOneOff: "Einmalige Renovierung beim Kauf (EUR)",
    sellingCostPct: "Verkaufskosten am Ende (%)"
  };

  function parseNumber(value) {
    if (value === null || value === undefined) return null;
    const raw = String(value).trim();
    if (raw === "") return null;
    const parsed = Number(raw.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }

  function round2(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  function monthRateFromYearPct(yearPct) {
    return Math.pow(1 + yearPct / 100, 1 / 12) - 1;
  }

  function derivePaymentInfo(loanPrincipal, monthlyInterestRate, financeMode, monthlyPayment, payoffYears) {
    if (loanPrincipal <= 0) {
      return { rate: 0, payoffMonths: 0 };
    }

    if (financeMode === "payoff") {
      const n = payoffYears * 12;
      if (monthlyInterestRate === 0) {
        return { rate: round2(loanPrincipal / n), payoffMonths: n };
      }
      const rawRate = loanPrincipal * monthlyInterestRate / (1 - Math.pow(1 + monthlyInterestRate, -n));
      return { rate: round2(rawRate), payoffMonths: n };
    }

    const rate = monthlyPayment;
    if (rate <= 0) return { rate, payoffMonths: Infinity };

    if (monthlyInterestRate === 0) {
      return { rate, payoffMonths: Math.ceil(loanPrincipal / rate) };
    }

    if (rate <= loanPrincipal * monthlyInterestRate) {
      return { rate, payoffMonths: Infinity };
    }

    const payoffMonths = Math.ceil(
      -Math.log(1 - ((loanPrincipal * monthlyInterestRate) / rate)) / Math.log(1 + monthlyInterestRate)
    );
    return { rate, payoffMonths };
  }

  function parseAndNormalizeState(formState) {
    const missingRequired = [];
    const rangeIssues = [];
    const fieldErrors = {};
    const parsed = {};

    [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS, "monthlyPayment", "payoffYears"].forEach((key) => {
      parsed[key] = parseNumber(formState[key]);
    });

    const financeMode = String(formState.financeMode || "").trim();
    if (!financeMode) {
      missingRequired.push("financeMode");
      fieldErrors.financeMode = "Pflichtfeld";
    }

    ["purchasePrice", "equity", "closingCostPct", "interestPaPct", "rentMonthly", "years"].forEach((key) => {
      if (parsed[key] === null) {
        missingRequired.push(key);
        fieldErrors[key] = "Pflichtfeld";
      }
    });

    if (financeMode === "payment") {
      if (parsed.monthlyPayment === null) {
        missingRequired.push("monthlyPayment");
        fieldErrors.monthlyPayment = "Pflichtfeld";
      } else if (parsed.monthlyPayment < 1 || parsed.monthlyPayment > 20000) {
        rangeIssues.push("monthlyPayment");
        fieldErrors.monthlyPayment = "1 bis 20000";
      }
    } else if (financeMode === "payoff") {
      if (parsed.payoffYears === null) {
        missingRequired.push("payoffYears");
        fieldErrors.payoffYears = "Pflichtfeld";
      } else if (!Number.isInteger(parsed.payoffYears) || parsed.payoffYears < 1 || parsed.payoffYears > 50) {
        rangeIssues.push("payoffYears");
        fieldErrors.payoffYears = "1 bis 50";
      }
    }

    EUR_FIELDS.forEach((key) => {
      if (parsed[key] !== null && parsed[key] < 0) {
        if (!rangeIssues.includes(key)) rangeIssues.push(key);
        fieldErrors[key] = "Mindestens 0";
      }
    });

    PCT_FIELDS.forEach((key) => {
      if (parsed[key] !== null && (parsed[key] < 0 || parsed[key] > 20)) {
        if (!rangeIssues.includes(key)) rangeIssues.push(key);
        fieldErrors[key] = "0 bis 20";
      }
    });

    if (parsed.years !== null && (!Number.isInteger(parsed.years) || parsed.years < 1 || parsed.years > 50)) {
      if (!rangeIssues.includes("years")) rangeIssues.push("years");
      fieldErrors.years = "1 bis 50";
    }

    const normalized = {
      purchasePrice: parsed.purchasePrice,
      equity: parsed.equity,
      closingCostPct: parsed.closingCostPct,
      interestPaPct: parsed.interestPaPct,
      financeMode,
      monthlyPayment: financeMode === "payment" ? parsed.monthlyPayment : null,
      payoffYears: financeMode === "payoff" ? parsed.payoffYears : null,
      rentMonthly: parsed.rentMonthly,
      years: parsed.years,
      maintenanceYearly: parsed.maintenanceYearly ?? 0,
      hoaMonthly: parsed.hoaMonthly ?? 0,
      rentGrowthPaPct: parsed.rentGrowthPaPct ?? 0,
      propertyGrowthPaPct: parsed.propertyGrowthPaPct ?? 0,
      opportunityPaPct: parsed.opportunityPaPct ?? 0,
      renovationOneOff: parsed.renovationOneOff ?? 0,
      sellingCostPct: parsed.sellingCostPct ?? 0,
      optionalsProvidedRaw: OPTIONAL_FIELDS.filter((key) => String(formState[key] ?? "").trim() !== ""),
      isValid: missingRequired.length === 0 && rangeIssues.length === 0
    };

    normalized.months = normalized.years ? normalized.years * 12 : 0;
    normalized.closingCostEur = normalized.purchasePrice ? normalized.purchasePrice * (normalized.closingCostPct / 100) : 0;
    normalized.loanPrincipal = normalized.purchasePrice
      ? normalized.purchasePrice + normalized.closingCostEur + normalized.renovationOneOff - normalized.equity
      : 0;

    normalized.monthlyInterestRate = (normalized.interestPaPct / 100) / 12;
    normalized.rentGrowthMonthly = monthRateFromYearPct(normalized.rentGrowthPaPct);
    normalized.propertyGrowthMonthly = monthRateFromYearPct(normalized.propertyGrowthPaPct);
    normalized.opportunityMonthly = monthRateFromYearPct(normalized.opportunityPaPct);
    normalized.maintenanceMonthly = normalized.maintenanceYearly / 12;

    const paymentInfo = derivePaymentInfo(
      normalized.loanPrincipal,
      normalized.monthlyInterestRate,
      normalized.financeMode,
      normalized.monthlyPayment ?? 0,
      normalized.payoffYears ?? 0
    );

    normalized.monthlyRate = normalized.loanPrincipal > 0 ? paymentInfo.rate : 0;
    normalized.payoffMonths = paymentInfo.payoffMonths;

    return { state: normalized, fieldErrors, missingRequired, rangeIssues };
  }

  function simulateMortgageMonthly(state) {
    const months = state.months;
    let rest = state.loanPrincipal > 0 ? state.loanPrincipal : 0;
    let zinsenGesamt = 0;
    let instandhaltungGesamt = 0;
    let hausgeldGesamt = 0;
    const kaufenCashflows = [];

    for (let i = 0; i < months; i += 1) {
      const rate_t = rest > 0 ? state.monthlyRate : 0;
      const zins = rest > 0 ? rest * state.monthlyInterestRate : 0;
      const tilgung = rest > 0 ? Math.max(0, rate_t - zins) : 0;
      rest = rest > 0 ? Math.max(0, rest - tilgung) : 0;
      zinsenGesamt += zins;
      instandhaltungGesamt += state.maintenanceMonthly;
      hausgeldGesamt += state.hoaMonthly;
      kaufenCashflows.push(rate_t + state.maintenanceMonthly + state.hoaMonthly);
    }

    let marktwert = state.purchasePrice;
    for (let i = 0; i < months; i += 1) marktwert *= (1 + state.propertyGrowthMonthly);

    return {
      rest: round2(rest),
      rate: round2(state.monthlyRate),
      zinsenGesamt: round2(zinsenGesamt),
      instandhaltungGesamt: round2(instandhaltungGesamt),
      hausgeldGesamt: round2(hausgeldGesamt),
      marktwert: round2(marktwert),
      verkaufserloes: round2(marktwert * (1 - state.sellingCostPct / 100)),
      kaufenCashflows
    };
  }

  function simulateRentMonthly(state, buy) {
    const months = state.months;
    let miete = state.rentMonthly;
    let mieteGesamt = 0;
    const mietenCashflows = [];

    for (let i = 0; i < months; i += 1) {
      mieteGesamt += miete;
      mietenCashflows.push(miete);
      miete *= (1 + state.rentGrowthMonthly);
    }

    if (state.opportunityPaPct <= 0) {
      return { mieteGesamt: round2(mieteGesamt), investmentEndeRent: 0, investmentEndeBuy: 0, totalInvestDiffRent: 0, totalInvestDiffBuy: 0, mietenCashflows };
    }

    let investmentRent = state.equity + state.closingCostEur + state.renovationOneOff;
    let investmentBuy = 0;
    let totalInvestDiffRent = 0;
    let totalInvestDiffBuy = 0;

    for (let i = 0; i < months; i += 1) {
      const rentCashflow = mietenCashflows[i];
      const buyCashflow = buy.kaufenCashflows[i] ?? 0;
      const investDiffRent = buyCashflow > rentCashflow ? buyCashflow - rentCashflow : 0;
      const investDiffBuy = rentCashflow > buyCashflow ? rentCashflow - buyCashflow : 0;
      investmentRent = investmentRent * (1 + state.opportunityMonthly) + investDiffRent;
      investmentBuy = investmentBuy * (1 + state.opportunityMonthly) + investDiffBuy;
      totalInvestDiffRent += investDiffRent;
      totalInvestDiffBuy += investDiffBuy;
    }

    return {
      mieteGesamt: round2(mieteGesamt),
      investmentEndeRent: round2(investmentRent),
      investmentEndeBuy: round2(investmentBuy),
      totalInvestDiffRent: round2(totalInvestDiffRent),
      totalInvestDiffBuy: round2(totalInvestDiffBuy),
      mietenCashflows
    };
  }

  function computeComparison(buy, rent, state) {
    const investmentEnabled = state.opportunityPaPct > 0;
    const endvermoegenBuy = (buy.verkaufserloes - buy.rest) + (investmentEnabled ? rent.investmentEndeBuy : 0);
    const nichtVermoegensKostenBuy = state.closingCostEur + state.renovationOneOff + buy.instandhaltungGesamt + buy.hausgeldGesamt + buy.zinsenGesamt;
    const nettoBuy = endvermoegenBuy - nichtVermoegensKostenBuy;

    const endvermoegenRent = investmentEnabled ? rent.investmentEndeRent : 0;
    const nettoRent = endvermoegenRent - rent.mieteGesamt;

    return {
      nettoBuy: round2(nettoBuy),
      nettoRent: round2(nettoRent),
      diff: round2(Math.abs(nettoBuy - nettoRent)),
      winner: nettoBuy > nettoRent ? "Kaufen" : (nettoRent > nettoBuy ? "Mieten" : "Gleichstand"),
      breakdown: {
        endvermoegenBuy: round2(endvermoegenBuy),
        endvermoegenRent: round2(endvermoegenRent),
        investmentEndeBuy: round2(investmentEnabled ? rent.investmentEndeBuy : 0),
        investmentEndeRent: round2(investmentEnabled ? rent.investmentEndeRent : 0),
        nichtVermoegensKostenBuy: round2(nichtVermoegensKostenBuy),
        nichtVermoegensKostenRent: round2(rent.mieteGesamt)
      }
    };
  }

  function computeCashflowSummary(buy, rent, state) {
    const months = state.months || 1;
    const totalPaidBuy = buy.kaufenCashflows.reduce((acc, val) => acc + val, 0) + state.closingCostEur + state.renovationOneOff;
    const totalPaidRent = rent.mieteGesamt;
    return {
      totalPaidBuy: round2(totalPaidBuy),
      avgPaidBuy: round2(totalPaidBuy / months),
      totalPaidRent: round2(totalPaidRent),
      avgPaidRent: round2(totalPaidRent / months)
    };
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
  }

  function readFormState(form) {
    const data = new FormData(form);
    const result = {};
    [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS, "monthlyPayment", "payoffYears"].forEach((field) => {
      result[field] = data.get(field);
    });
    return result;
  }

  function renderList(element, lines) {
    element.innerHTML = "";
    lines.forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      element.appendChild(li);
    });
  }

  function makeErrorList(keys) {
    const labels = keys.slice(0, 3).map((key) => LABEL_MAP[key] || key);
    return keys.length > 3 ? `${labels.join(", ")}, ...` : labels.join(", ");
  }

  function applyFinanceModeState(form, mode) {
    const monthlyField = document.getElementById("field-monthlyPayment");
    const payoffField = document.getElementById("field-payoffYears");
    const monthlyInput = form.elements.monthlyPayment;
    const payoffInput = form.elements.payoffYears;

    const paymentMode = mode === "payment";
    monthlyInput.disabled = !paymentMode;
    payoffInput.disabled = paymentMode;
    monthlyField.classList.toggle("is-disabled", !paymentMode);
    payoffField.classList.toggle("is-disabled", paymentMode);
  }

  function renderApp(form, nodes, uiState) {
    const { state, fieldErrors, missingRequired, rangeIssues } = parseAndNormalizeState(readFormState(form));
    const hasAnyTouched = Object.values(uiState.touched).some(Boolean);

    Object.keys(nodes.fieldErrors).forEach((field) => {
      nodes.fieldErrors[field].textContent = (uiState.touched[field] && fieldErrors[field]) ? fieldErrors[field] : "";
    });

    if (!state.isValid) {
      nodes.placeholder.hidden = false;
      nodes.content.hidden = true;
      if (!hasAnyTouched) {
        nodes.errors.hidden = true;
      } else if (missingRequired.length > 0) {
        nodes.errors.hidden = false;
        nodes.errorMain.textContent = "Bitte fuelle alle Pflichtfelder aus.";
        nodes.errorList.textContent = makeErrorList(missingRequired);
      } else {
        nodes.errors.hidden = false;
        nodes.errorMain.textContent = "Bitte Wertebereiche pruefen (z.B. 0-20% / 1-50 Jahre).";
        nodes.errorList.textContent = makeErrorList(rangeIssues);
      }
      return;
    }

    nodes.errors.hidden = true;
    nodes.placeholder.hidden = true;
    nodes.content.hidden = false;

    const buy = simulateMortgageMonthly(state);
    const rent = simulateRentMonthly(state, buy);
    const comparison = computeComparison(buy, rent, state);
    const cash = computeCashflowSummary(buy, rent, state);

    const nearThreshold = Math.max(2500, Math.abs(comparison.nettoBuy) * 0.01);
    if (Math.abs(comparison.nettoBuy - comparison.nettoRent) <= nearThreshold) {
      nodes.headline.textContent = "Unter deinen Annahmen liegen Kaufen und Mieten nah beieinander.";
    } else if (comparison.winner === "Kaufen") {
      nodes.headline.textContent = "Unter deinen Annahmen ist Kaufen vorteilhafter.";
    } else {
      nodes.headline.textContent = "Unter deinen Annahmen ist Mieten vorteilhafter.";
    }

    if (state.financeMode === "payoff") {
      nodes.financeHint.textContent = `Erforderliche Monatsrate fuer schuldenfrei in ${state.payoffYears} Jahren: ${formatCurrency(state.monthlyRate)}`;
    } else if (state.payoffMonths === Infinity) {
      nodes.financeHint.textContent = "Mit dieser Monatsrate wird das Darlehen voraussichtlich nicht vollstaendig getilgt (Zinsanteil zu hoch).";
    } else {
      const yearsToPayoff = round2(state.payoffMonths / 12);
      nodes.financeHint.textContent = `Geschaetzte Dauer bis schuldenfrei: ${yearsToPayoff} Jahre`;
    }

    if (buy.rest > 0) {
      nodes.timespanHint.textContent = "Im Vergleichszeitraum bleibt voraussichtlich eine Restschuld. Diese fliesst in die Auswertung ein.";
    } else {
      nodes.timespanHint.textContent = "Nach Tilgung fallen keine Kreditraten mehr an. Das beeinflusst den Cashflow danach.";
    }

    nodes.buyTotalLabel.textContent = `Gesamtzahlung ueber ${state.years} Jahre`;
    nodes.buyTotalValue.textContent = formatCurrency(cash.totalPaidBuy);
    nodes.buyAvgValue.textContent = `Durchschnitt pro Monat: ${formatCurrency(cash.avgPaidBuy)}`;
    nodes.rentTotalLabel.textContent = `Gesamtzahlung ueber ${state.years} Jahre`;
    nodes.rentTotalValue.textContent = formatCurrency(cash.totalPaidRent);
    nodes.rentAvgValue.textContent = `Durchschnitt pro Monat: ${formatCurrency(cash.avgPaidRent)}`;

    nodes.summaryBuy.classList.toggle("is-winner", comparison.winner === "Kaufen");
    nodes.summaryRent.classList.toggle("is-winner", comparison.winner === "Mieten");

    const buyLines = [
      `Restschuld am Ende: ${formatCurrency(buy.rest)}`,
      `Zinsanteil gesamt: ${formatCurrency(buy.zinsenGesamt)}`,
      `Nicht-vermoegensbildende Kosten: ${formatCurrency(comparison.breakdown.nichtVermoegensKostenBuy)}`,
      `Immobilienwert am Ende: ${formatCurrency(buy.marktwert)}`,
      `Verkaufserloes am Ende: ${formatCurrency(buy.verkaufserloes)}`,
      `NettoEndwert: ${formatCurrency(comparison.nettoBuy)}`
    ];
    if (state.opportunityPaPct > 0) buyLines.push(`Investment-Endwert (Kauf-Szenario): ${formatCurrency(rent.investmentEndeBuy)}`);

    const rentLines = [
      `Kumulierte Miete: ${formatCurrency(rent.mieteGesamt)}`,
      `Nicht-vermoegensbildende Kosten: ${formatCurrency(comparison.breakdown.nichtVermoegensKostenRent)}`,
      `NettoEndwert: ${formatCurrency(comparison.nettoRent)}`
    ];
    if (state.opportunityPaPct > 0) rentLines.splice(1, 0, `Investment-Endwert (Miet-Szenario): ${formatCurrency(rent.investmentEndeRent)}`);

    const assumptions = [
      `Kaufpreis: ${formatCurrency(state.purchasePrice)}`,
      `Eigenkapital: ${formatCurrency(state.equity)}`,
      `Kaufnebenkosten: ${state.closingCostPct.toFixed(2)} %`,
      `Zinssatz p.a.: ${state.interestPaPct.toFixed(2)} %`,
      `Finanzierungsziel: ${state.financeMode === "payment" ? "Monatsrate festlegen" : `Schuldenfrei in ${state.payoffYears} Jahren`}`,
      `Kaltmiete pro Monat: ${formatCurrency(state.rentMonthly)}`,
      `Vergleichszeitraum: ${state.years} Jahre`
    ];
    if (state.financeMode === "payment") assumptions.push(`Max. Monatsrate: ${formatCurrency(state.monthlyRate)}`);
    if (state.financeMode === "payoff") assumptions.push(`Erforderliche Monatsrate: ${formatCurrency(state.monthlyRate)}`);

    const optionalLabels = {
      maintenanceYearly: "Instandhaltung (EUR/Jahr)",
      hoaMonthly: "Hausgeld (EUR/Monat)",
      rentGrowthPaPct: "Mietsteigerung p.a.",
      propertyGrowthPaPct: "Immobilienwertentwicklung p.a.",
      opportunityPaPct: "Opportunitaetsrendite p.a.",
      renovationOneOff: "Einmalige Renovierung beim Kauf",
      sellingCostPct: "Verkaufskosten am Ende"
    };

    state.optionalsProvidedRaw.forEach((key) => {
      const value = state[key];
      const formatted = key.includes("Pct") ? `${value.toFixed(2)} %` : formatCurrency(value);
      assumptions.push(`${optionalLabels[key]}: ${formatted}`);
    });

    renderList(nodes.buyList, buyLines);
    renderList(nodes.rentList, rentLines);
    renderList(nodes.assumptions, assumptions);
  }

  function closeAllInfoPanels(nodes) {
    nodes.infoPanels.forEach((panel) => { panel.hidden = true; });
  }

  function attachApp() {
    const form = document.getElementById("rentbuy-form");
    if (!form) return;

    const nodes = {
      placeholder: document.getElementById("rentbuy-placeholder"),
      content: document.getElementById("rentbuy-result-content"),
      headline: document.getElementById("rentbuy-headline"),
      financeHint: document.getElementById("rentbuy-finance-hint"),
      timespanHint: document.getElementById("rentbuy-timespan-hint"),
      buyList: document.getElementById("rentbuy-buy-list"),
      rentList: document.getElementById("rentbuy-rent-list"),
      assumptions: document.getElementById("rentbuy-assumptions"),
      errors: document.getElementById("rentbuy-errors"),
      errorMain: document.getElementById("rentbuy-errors-main"),
      errorList: document.getElementById("rentbuy-errors-list"),
      fieldErrors: Object.fromEntries([...REQUIRED_FIELDS, "monthlyPayment", "payoffYears"].map((field) => [field, document.querySelector(`[data-error-for="${field}"]`)])),
      summaryBuy: document.getElementById("summary-buy"),
      summaryRent: document.getElementById("summary-rent"),
      buyTotalLabel: document.getElementById("buy-total-label"),
      buyTotalValue: document.getElementById("buy-total-value"),
      buyAvgValue: document.getElementById("buy-avg-value"),
      rentTotalLabel: document.getElementById("rent-total-label"),
      rentTotalValue: document.getElementById("rent-total-value"),
      rentAvgValue: document.getElementById("rent-avg-value"),
      infoPanels: Array.from(document.querySelectorAll(".rentbuy-info-panel"))
    };

    const uiState = { touched: Object.fromEntries([...REQUIRED_FIELDS, "monthlyPayment", "payoffYears"].map((field) => [field, false])) };

    [...REQUIRED_FIELDS, "monthlyPayment", "payoffYears"].forEach((field) => {
      const el = form.elements[field];
      if (!el) return;
      const markTouched = () => {
        uiState.touched[field] = true;
        renderApp(form, nodes, uiState);
      };
      if (el.length && field === "financeMode") {
        Array.from(el).forEach((radio) => {
          radio.addEventListener("change", () => {
            uiState.touched[field] = true;
            applyFinanceModeState(form, radio.value);
            renderApp(form, nodes, uiState);
          });
        });
      } else {
        el.addEventListener("blur", markTouched);
        el.addEventListener("input", () => {
          if (uiState.touched[field]) renderApp(form, nodes, uiState);
        });
      }
    });

    form.addEventListener("input", () => renderApp(form, nodes, uiState));

    document.querySelectorAll(".rentbuy-info-link").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const target = document.getElementById(`info-${button.dataset.infoTarget}`);
        if (!target) return;
        const wasOpen = !target.hidden;
        closeAllInfoPanels(nodes);
        target.hidden = wasOpen;
      });
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".rentbuy-info-panel") && !event.target.closest(".rentbuy-info-link")) closeAllInfoPanels(nodes);
    });

    document.getElementById("rentbuy-example-values").addEventListener("click", () => {
      const defaults = { closingCostPct: "10", interestPaPct: "3.5", years: "20" };
      Object.entries(defaults).forEach(([field, value]) => {
        if (String(form.elements[field].value).trim() === "") form.elements[field].value = value;
      });
      renderApp(form, nodes, uiState);
    });

    document.getElementById("rentbuy-reset").addEventListener("click", () => {
      form.reset();
      applyFinanceModeState(form, "");
      Object.keys(uiState.touched).forEach((k) => { uiState.touched[k] = false; });
      Object.values(nodes.fieldErrors).forEach((node) => { if (node) node.textContent = ""; });
      closeAllInfoPanels(nodes);
      renderApp(form, nodes, uiState);
    });

    applyFinanceModeState(form, "");
    renderApp(form, nodes, uiState);
  }

  function runSelfTests() {
    const base = {
      purchasePrice: 300000,
      equity: 60000,
      closingCostPct: 10,
      interestPaPct: 3,
      financeMode: "payment",
      monthlyPayment: 1500,
      rentMonthly: 1200,
      years: 20
    };

    const s1 = parseAndNormalizeState(base).state;
    const b1 = simulateMortgageMonthly(s1);
    const r1 = simulateRentMonthly(s1, b1);
    const c1 = computeComparison(b1, r1, s1);

    const s2 = parseAndNormalizeState({ ...base, equity: 500000 }).state;
    const b2 = simulateMortgageMonthly(s2);

    const s3 = parseAndNormalizeState({ ...base, opportunityPaPct: 0 }).state;
    const b3 = simulateMortgageMonthly(s3);
    const r3 = simulateRentMonthly(s3, b3);

    const s4 = parseAndNormalizeState({ ...base, interestPaPct: 20, monthlyPayment: 10 }).state;
    const b4 = simulateMortgageMonthly(s4);

    const s5 = parseAndNormalizeState({ ...base, opportunityPaPct: 4, rentMonthly: 3000 }).state;
    const b5 = simulateMortgageMonthly(s5);
    const r5 = simulateRentMonthly(s5, b5);

    const s6a = parseAndNormalizeState(base).state;
    const s6b = parseAndNormalizeState({ ...base, maintenanceYearly: "", hoaMonthly: "", rentGrowthPaPct: "" }).state;
    const c6a = computeComparison(simulateMortgageMonthly(s6a), simulateRentMonthly(s6a, simulateMortgageMonthly(s6a)), s6a);
    const c6b = computeComparison(simulateMortgageMonthly(s6b), simulateRentMonthly(s6b, simulateMortgageMonthly(s6b)), s6b);

    const s7 = parseAndNormalizeState({ ...base, equity: 300000, monthlyPayment: 5000, maintenanceYearly: 1200, hoaMonthly: 80, years: 10 }).state;
    const b7 = simulateMortgageMonthly(s7);
    const floor7 = s7.maintenanceMonthly + s7.hoaMonthly;

    const s8 = parseAndNormalizeState({ ...base, opportunityPaPct: 4, rentMonthly: 4000 }).state;
    const b8 = simulateMortgageMonthly(s8);
    const r8 = simulateRentMonthly(s8, b8);
    const c8 = computeComparison(b8, r8, s8);

    const cash9 = computeCashflowSummary(b1, r1, s1);

    const s11 = parseAndNormalizeState({ ...base, equity: 600000, maintenanceYearly: 2400, hoaMonthly: 180, years: 5 }).state;
    const b11 = simulateMortgageMonthly(s11);
    const cash11 = computeCashflowSummary(b11, simulateRentMonthly(s11, b11), s11);

    const s12 = parseAndNormalizeState({ ...base, financeMode: "payoff", payoffYears: 20, monthlyPayment: null }).state;
    const b12 = simulateMortgageMonthly(s12);

    const s13 = parseAndNormalizeState({ ...base, financeMode: "payment", monthlyPayment: 200 }).state;
    const b13 = simulateMortgageMonthly(s13);

    const s14 = parseAndNormalizeState({ ...base, financeMode: "payoff", payoffYears: 30, years: 10 }).state;
    const b14 = simulateMortgageMonthly(s14);

    return [
      { id: "T1", pass: Number.isFinite(b1.rest) && Number.isFinite(c1.nettoBuy) },
      { id: "T2", pass: s2.loanPrincipal <= 0 && b2.rest === 0 && b2.rate === 0 },
      { id: "T3", pass: r3.investmentEndeRent === 0 && r3.totalInvestDiffRent === 0 && r3.totalInvestDiffBuy === 0 },
      { id: "T4", pass: b4.rest <= round2(s4.loanPrincipal) },
      { id: "T5", pass: r5.totalInvestDiffBuy > 0 && r5.investmentEndeBuy > r5.totalInvestDiffBuy },
      { id: "T6", pass: c6a.nettoBuy === c6b.nettoBuy && c6a.nettoRent === c6b.nettoRent },
      { id: "T7", pass: b7.kaufenCashflows.some((v) => Math.abs(v - floor7) < 1e-6) },
      { id: "T8", pass: r8.investmentEndeBuy > 0 && c8.breakdown.endvermoegenBuy >= round2(b8.verkaufserloes - b8.rest + r8.investmentEndeBuy) - 0.02 },
      { id: "T9", pass: Math.abs(cash9.totalPaidRent - r1.mieteGesamt) <= 0.02 },
      { id: "T10", pass: Math.abs((cash9.avgPaidRent * s1.months) - cash9.totalPaidRent) <= 0.2 },
      { id: "T11", pass: s11.loanPrincipal <= 0 && cash11.totalPaidBuy >= round2(s11.months * (s11.maintenanceMonthly + s11.hoaMonthly)) },
      { id: "T12", pass: s12.monthlyRate > (s12.loanPrincipal * s12.monthlyInterestRate) && b12.rest <= 50 },
      { id: "T13", pass: s13.payoffMonths === Infinity && b13.rest >= round2(s13.loanPrincipal - 1) },
      { id: "T14", pass: s14.years < s14.payoffYears && b14.rest > 0 }
    ];
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      parseAndNormalizeState,
      simulateMortgageMonthly,
      simulateRentMonthly,
      computeComparison,
      computeCashflowSummary,
      runSelfTests
    };
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", attachApp);
  }
})();
