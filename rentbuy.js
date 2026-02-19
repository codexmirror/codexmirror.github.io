diff --git a/rentbuy.js b/rentbuy.js
index f8acfe056f8ab483e72bfbf83e0221468110a80e..7872544e7058fbc56be98a2ba9a8a666830cd744 100644
--- a/rentbuy.js
+++ b/rentbuy.js
@@ -1,184 +1,181 @@
 (function () {
   /*
     Modellannahmen (MVP):
     - Kreditzins monatlich als nominaler Satz: (Zins p.a.) / 12.
     - Annuität aus (Zins p.a. + Tilgung p.a.) * Darlehen / 12.
     - Miet-/Wert-/Rendite-Wachstum monatlich: (1+r_pa)^(1/12)-1.
     - Tilgung ist keine Kostenposition; nur Zinsen, laufende Kosten und Miete zählen als nicht-vermögensbildende Kosten.
     - Vergleichsmetrik: NettoEndwert = Endvermögen - nicht-vermögensbildende Kosten.
   */
 
-  const REQUIRED_FIELDS = [
-    "purchasePrice",
-    "equity",
-    "closingCostPct",
-    "interestPaPct",
-    "repaymentPaPct",
-    "rentMonthly",
-    "years"
-  ];
-
+  const REQUIRED_FIELDS = ["purchasePrice", "equity", "closingCostPct", "interestPaPct", "repaymentPaPct", "rentMonthly", "years"];
   const OPTIONAL_FIELDS = [
     "maintenanceYearly",
     "hoaMonthly",
     "rentGrowthPaPct",
     "propertyGrowthPaPct",
     "opportunityPaPct",
     "renovationOneOff",
     "sellingCostPct"
   ];
 
   const EUR_FIELDS = ["purchasePrice", "equity", "rentMonthly", "maintenanceYearly", "hoaMonthly", "renovationOneOff"];
   const PCT_FIELDS = [
     "closingCostPct",
     "interestPaPct",
     "repaymentPaPct",
     "rentGrowthPaPct",
     "propertyGrowthPaPct",
     "opportunityPaPct",
     "sellingCostPct"
   ];
 
-  const FIELD_LABELS = {
-    purchasePrice: "Kaufpreis",
-    equity: "Eigenkapital",
-    closingCostPct: "Kaufnebenkosten",
-    interestPaPct: "Zinssatz p.a.",
-    repaymentPaPct: "Tilgungssatz p.a.",
-    rentMonthly: "Kaltmiete pro Monat",
-    years: "Zeitraum (Jahre)"
+  const LABEL_MAP = {
+    purchasePrice: "Kaufpreis (EUR)",
+    equity: "Eigenkapital (EUR)",
+    closingCostPct: "Kaufnebenkosten (%)",
+    interestPaPct: "Zinssatz p.a. (%)",
+    repaymentPaPct: "Tilgungssatz p.a. (%)",
+    rentMonthly: "Kaltmiete pro Monat (EUR)",
+    years: "Zeitraum (Jahre)",
+    maintenanceYearly: "Instandhaltung (EUR/Jahr)",
+    hoaMonthly: "Hausgeld (EUR/Monat)",
+    rentGrowthPaPct: "Mietsteigerung p.a. (%)",
+    propertyGrowthPaPct: "Immobilienwertentwicklung p.a. (%)",
+    opportunityPaPct: "Opportunitätsrendite p.a. (%)",
+    renovationOneOff: "Einmalige Renovierung beim Kauf (EUR)",
+    sellingCostPct: "Verkaufskosten am Ende (%)"
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
 
   function parseAndNormalizeState(formState) {
-    const errors = [];
     const fieldErrors = {};
+    const missingFields = [];
+    const rangeErrorFields = [];
     const parsed = {};
 
     [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS].forEach((key) => {
       parsed[key] = parseNumber(formState[key]);
     });
 
     REQUIRED_FIELDS.forEach((key) => {
       if (parsed[key] === null) {
-        const message = `Bitte ${FIELD_LABELS[key]} eingeben.`;
-        errors.push(message);
-        fieldErrors[key] = message;
+        fieldErrors[key] = "Pflichtfeld";
+        missingFields.push(key);
       }
     });
 
     EUR_FIELDS.forEach((key) => {
       if (parsed[key] !== null && parsed[key] < 0) {
-        const message = key in FIELD_LABELS ? `${FIELD_LABELS[key]}: Bitte Wert ab 0 eingeben.` : "Bitte Wert ab 0 eingeben.";
-        errors.push(message);
-        fieldErrors[key] = message;
+        fieldErrors[key] = "Wert ab 0";
+        rangeErrorFields.push(key);
       }
     });
 
     PCT_FIELDS.forEach((key) => {
       if (parsed[key] !== null && (parsed[key] < 0 || parsed[key] > 20)) {
-        const message = "Bitte Zahl zwischen 0 und 20 eingeben.";
-        errors.push(message);
-        fieldErrors[key] = message;
+        fieldErrors[key] = "Wert 0 bis 20";
+        rangeErrorFields.push(key);
       }
     });
 
     if (parsed.years !== null && (!Number.isInteger(parsed.years) || parsed.years < 1 || parsed.years > 50)) {
-      const message = "Zeitraum: 1–50 Jahre.";
-      errors.push(message);
-      fieldErrors.years = message;
+      fieldErrors.years = "Wert 1 bis 50";
+      rangeErrorFields.push("years");
     }
 
     const normalized = {
       purchasePrice: parsed.purchasePrice,
       equity: parsed.equity,
       closingCostPct: parsed.closingCostPct,
       interestPaPct: parsed.interestPaPct,
       repaymentPaPct: parsed.repaymentPaPct,
       rentMonthly: parsed.rentMonthly,
       years: parsed.years,
       maintenanceYearly: parsed.maintenanceYearly ?? 0,
       hoaMonthly: parsed.hoaMonthly ?? 0,
       rentGrowthPaPct: parsed.rentGrowthPaPct ?? 0,
       propertyGrowthPaPct: parsed.propertyGrowthPaPct ?? 0,
       opportunityPaPct: parsed.opportunityPaPct ?? 0,
       renovationOneOff: parsed.renovationOneOff ?? 0,
       sellingCostPct: parsed.sellingCostPct ?? 0,
-      optionalsProvided: OPTIONAL_FIELDS.filter((key) => parsed[key] !== null && parsed[key] > 0),
-      optionalsProvidedRaw: OPTIONAL_FIELDS.filter((key) => String(formState[key] ?? "").trim() !== ""),
-      isValid: errors.length === 0
+      optionalsProvidedRaw: OPTIONAL_FIELDS.filter((key) => String(formState[key] ?? "").trim() !== "")
     };
 
     normalized.months = normalized.years ? normalized.years * 12 : 0;
     normalized.closingCostEur = normalized.purchasePrice ? normalized.purchasePrice * (normalized.closingCostPct / 100) : 0;
     normalized.loanPrincipal = normalized.purchasePrice
       ? normalized.purchasePrice + normalized.closingCostEur + normalized.renovationOneOff - normalized.equity
       : 0;
 
     normalized.monthlyInterestRate = (normalized.interestPaPct / 100) / 12;
     normalized.monthlyRate = normalized.loanPrincipal > 0
       ? ((normalized.interestPaPct / 100) + (normalized.repaymentPaPct / 100)) * normalized.loanPrincipal / 12
       : 0;
 
     normalized.rentGrowthMonthly = monthRateFromYearPct(normalized.rentGrowthPaPct);
     normalized.propertyGrowthMonthly = monthRateFromYearPct(normalized.propertyGrowthPaPct);
     normalized.opportunityMonthly = monthRateFromYearPct(normalized.opportunityPaPct);
     normalized.maintenanceMonthly = normalized.maintenanceYearly / 12;
+    normalized.isValid = missingFields.length === 0 && rangeErrorFields.length === 0;
 
-    return { state: normalized, errors, fieldErrors };
+    return {
+      state: normalized,
+      fieldErrors,
+      missingFields,
+      rangeErrorFields
+    };
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
-      const tilgung = rest > 0
-        ? (rate_t < zins ? 0 : Math.max(0, rate_t - zins))
-        : 0;
+      const tilgung = rest > 0 ? (rate_t < zins ? 0 : Math.max(0, rate_t - zins)) : 0;
       rest = rest > 0 ? Math.max(0, rest - tilgung) : 0;
       zinsenGesamt += zins;
       instandhaltungGesamt += state.maintenanceMonthly;
       hausgeldGesamt += state.hoaMonthly;
       kaufenCashflows.push(rate_t + state.maintenanceMonthly + state.hoaMonthly);
     }
 
     let marktwert = state.purchasePrice;
     for (let i = 0; i < months; i += 1) {
       marktwert *= (1 + state.propertyGrowthMonthly);
     }
 
     const verkaufserloes = marktwert * (1 - state.sellingCostPct / 100);
 
     return {
       rest: round2(rest),
       rate: round2(state.monthlyRate),
       zinsenGesamt: round2(zinsenGesamt),
       instandhaltungGesamt: round2(instandhaltungGesamt),
       hausgeldGesamt: round2(hausgeldGesamt),
       marktwert: round2(marktwert),
       verkaufserloes: round2(verkaufserloes),
       kaufenCashflows
     };
   }
@@ -222,226 +219,304 @@
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
     const nichtVermoegensKostenRent = rent.mieteGesamt;
     const nettoRent = endvermoegenRent - nichtVermoegensKostenRent;
 
     const diff = Math.abs(nettoBuy - nettoRent);
-    const winner = nettoBuy >= nettoRent ? "Kaufen" : "Mieten";
 
     return {
       nettoBuy: round2(nettoBuy),
       nettoRent: round2(nettoRent),
       diff: round2(diff),
-      winner,
       breakdown: {
         endvermoegenBuy: round2(endvermoegenBuy),
         endvermoegenRent: round2(endvermoegenRent),
         investmentEndeBuy: round2(investmentEnabled ? rent.investmentEndeBuy : 0),
+        investmentEndeRent: round2(investmentEnabled ? rent.investmentEndeRent : 0),
         nichtVermoegensKostenBuy: round2(nichtVermoegensKostenBuy),
         nichtVermoegensKostenRent: round2(nichtVermoegensKostenRent)
       }
     };
   }
 
+  function computeCashflowSummary(buy, rent, state) {
+    const months = Math.max(1, state.months || 0);
+    const totalPaidBuy = round2(buy.kaufenCashflows.reduce((sum, value) => sum + value, 0) + state.closingCostEur + state.renovationOneOff);
+    const totalPaidRent = round2(rent.mieteGesamt);
+    return {
+      totalPaidBuy,
+      avgPaidBuy: round2(totalPaidBuy / months),
+      totalPaidRent,
+      avgPaidRent: round2(totalPaidRent / months)
+    };
+  }
+
   function formatCurrency(value) {
     return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
   }
 
   function readFormState(form) {
     const data = new FormData(form);
     const result = {};
     [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS].forEach((field) => {
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
 
+  function buildErrorList(keys) {
+    const labels = keys.map((key) => LABEL_MAP[key] || key);
+    return labels.slice(0, 3).concat(labels.length > 3 ? ["..."] : []);
+  }
+
+  function renderErrorBox(nodes, missingFields, rangeErrorFields, shouldShow) {
+    if (!shouldShow || (!missingFields.length && !rangeErrorFields.length)) {
+      nodes.errors.hidden = true;
+      nodes.errors.innerHTML = "";
+      return;
+    }
+
+    const isMissing = missingFields.length > 0;
+    const title = isMissing
+      ? "Bitte fülle alle Pflichtfelder aus."
+      : "Bitte Wertebereiche prüfen (z.B. 0-20% / 1-50 Jahre).";
+
+    const list = buildErrorList(isMissing ? missingFields : rangeErrorFields);
+    const listHtml = list.length ? `<ul>${list.map((item) => `<li>${item}</li>`).join("")}</ul>` : "";
+    nodes.errors.innerHTML = `<p>${title}</p>${listHtml}`;
+    nodes.errors.hidden = false;
+  }
+
+  function getWinnerText(comparison) {
+    if (comparison.diff <= 1000) {
+      return { winner: "none", text: "Unter deinen Annahmen liegen Kaufen und Mieten nah beieinander." };
+    }
+    if (comparison.nettoBuy > comparison.nettoRent) {
+      return { winner: "buy", text: "Unter deinen Annahmen ist Kaufen vorteilhafter." };
+    }
+    return { winner: "rent", text: "Unter deinen Annahmen ist Mieten vorteilhafter." };
+  }
+
   function renderApp(form, nodes, uiState) {
-    const { state, fieldErrors } = parseAndNormalizeState(readFormState(form));
-    const hasRequired = REQUIRED_FIELDS.every((field) => parseNumber(form.elements[field].value) !== null);
+    const { state, fieldErrors, missingFields, rangeErrorFields } = parseAndNormalizeState(readFormState(form));
     const hasAnyRequiredTouched = REQUIRED_FIELDS.some((field) => uiState.touched[field]);
-    const showRequiredErrors = hasAnyRequiredTouched && (!hasRequired || !state.isValid);
+    const showRequiredErrors = hasAnyRequiredTouched && (!state.isValid || missingFields.length > 0);
 
     Object.keys(nodes.fieldErrors).forEach((field) => {
       const shouldShow = Boolean(fieldErrors[field]) && (uiState.touched[field] || showRequiredErrors);
-      nodes.fieldErrors[field].textContent = shouldShow ? fieldErrors[field] : "";
+      nodes.fieldErrors[field].textContent = shouldShow ? "Bitte prüfen." : "";
     });
 
-    const hasVisibleErrors = Object.keys(nodes.fieldErrors).some((field) => nodes.fieldErrors[field].textContent);
-    nodes.errors.textContent = hasVisibleErrors ? "Bitte markierte Felder prüfen." : "";
+    renderErrorBox(nodes, missingFields, rangeErrorFields, hasAnyRequiredTouched);
 
-    if (!hasRequired || !state.isValid) {
+    if (!state.isValid) {
       nodes.placeholder.hidden = false;
       nodes.content.hidden = true;
       return;
     }
 
     const buy = simulateMortgageMonthly(state);
     const rent = simulateRentMonthly(state, buy);
     const comparison = computeComparison(buy, rent, state);
+    const summary = computeCashflowSummary(buy, rent, state);
+    const winnerState = getWinnerText(comparison);
 
-    nodes.errors.textContent = "";
     nodes.placeholder.hidden = true;
     nodes.content.hidden = false;
-    nodes.headline.textContent = `Unter deinen Annahmen ist ${comparison.winner} günstiger um ${formatCurrency(comparison.diff)}.`;
+    nodes.headline.textContent = winnerState.text;
+
+    nodes.buyTotalLabel.textContent = `Gesamtzahlung über ${state.years} Jahre`;
+    nodes.buyTotalValue.textContent = formatCurrency(summary.totalPaidBuy);
+    nodes.buyAvgValue.textContent = `Durchschnitt pro Monat: ${formatCurrency(summary.avgPaidBuy)}`;
+    nodes.rentTotalLabel.textContent = `Gesamtzahlung über ${state.years} Jahre`;
+    nodes.rentTotalValue.textContent = formatCurrency(summary.totalPaidRent);
+    nodes.rentAvgValue.textContent = `Durchschnitt pro Monat: ${formatCurrency(summary.avgPaidRent)}`;
+
+    nodes.buySummaryCard.classList.toggle("is-winner", winnerState.winner === "buy");
+    nodes.rentSummaryCard.classList.toggle("is-winner", winnerState.winner === "rent");
 
     const buyLines = [
-      `Endvermögen: ${formatCurrency(comparison.breakdown.endvermoegenBuy)}`,
-      `Restschuld: ${formatCurrency(buy.rest)}`,
+      `Restschuld am Ende: ${formatCurrency(buy.rest)}`,
       `Zinsanteil gesamt: ${formatCurrency(buy.zinsenGesamt)}`,
       `Nicht-vermögensbildende Kosten: ${formatCurrency(comparison.breakdown.nichtVermoegensKostenBuy)}`,
+      `Immobilienwert am Ende: ${formatCurrency(buy.marktwert)}`,
+      `Verkaufserlös: ${formatCurrency(buy.verkaufserloes)}`,
       `NettoEndwert: ${formatCurrency(comparison.nettoBuy)}`
     ];
 
+    if (state.opportunityPaPct > 0) {
+      buyLines.push(`Investment-Endwert (Differenzanlagen): ${formatCurrency(comparison.breakdown.investmentEndeBuy)}`);
+    }
+
     const rentLines = [
-      `Kumulierte Miete: ${formatCurrency(rent.mieteGesamt)}`,
-      `Investment-Endwert: ${formatCurrency(rent.investmentEndeRent)}`,
+      `Nicht-vermögensbildende Kosten: ${formatCurrency(comparison.breakdown.nichtVermoegensKostenRent)}`,
       `NettoEndwert: ${formatCurrency(comparison.nettoRent)}`
     ];
 
+    if (state.opportunityPaPct > 0) {
+      rentLines.unshift(`Investment-Endwert: ${formatCurrency(comparison.breakdown.investmentEndeRent)}`);
+    }
+
     const assumptions = [
-      `Kaufpreis: ${formatCurrency(state.purchasePrice)}`,
-      `Eigenkapital: ${formatCurrency(state.equity)}`,
-      `Kaufnebenkosten: ${state.closingCostPct.toFixed(2)} %`,
-      `Zinssatz p.a.: ${state.interestPaPct.toFixed(2)} %`,
-      `Tilgungssatz p.a.: ${state.repaymentPaPct.toFixed(2)} %`,
-      `Kaltmiete pro Monat: ${formatCurrency(state.rentMonthly)}`,
-      `Zeitraum: ${state.years} Jahre`
+      `Kaufpreis (EUR): ${formatCurrency(state.purchasePrice)}`,
+      `Eigenkapital (EUR): ${formatCurrency(state.equity)}`,
+      `Kaufnebenkosten (%): ${state.closingCostPct.toFixed(2)} %`,
+      `Zinssatz p.a. (%): ${state.interestPaPct.toFixed(2)} %`,
+      `Tilgungssatz p.a. (%): ${state.repaymentPaPct.toFixed(2)} %`,
+      `Kaltmiete pro Monat (EUR): ${formatCurrency(state.rentMonthly)}`,
+      `Zeitraum (Jahre): ${state.years}`
     ];
 
-    const optionalLabels = {
-      maintenanceYearly: "Instandhaltung (EUR/Jahr)",
-      hoaMonthly: "Hausgeld (EUR/Monat)",
-      rentGrowthPaPct: "Mietsteigerung p.a.",
-      propertyGrowthPaPct: "Immobilienwertentwicklung p.a.",
-      opportunityPaPct: "Opportunitätsrendite p.a.",
-      renovationOneOff: "Einmalige Renovierung beim Kauf",
-      sellingCostPct: "Verkaufskosten am Ende"
-    };
-
     state.optionalsProvidedRaw.forEach((key) => {
       const value = state[key];
       const formatted = key.includes("Pct") ? `${value.toFixed(2)} %` : formatCurrency(value);
-      assumptions.push(`${optionalLabels[key]}: ${formatted}`);
+      assumptions.push(`${LABEL_MAP[key]}: ${formatted}`);
     });
 
     renderList(nodes.buyList, buyLines);
     renderList(nodes.rentList, rentLines);
     renderList(nodes.assumptions, assumptions);
   }
 
-  function toggleInfoPanel(button, panel) {
-    const expanded = button.getAttribute("aria-expanded") === "true";
-    button.setAttribute("aria-expanded", String(!expanded));
-    panel.hidden = expanded;
-    panel.classList.toggle("is-open", !expanded);
+  function closeAllInfoPanels(buttons) {
+    buttons.forEach((button) => {
+      const panel = document.getElementById(button.dataset.info ? `info-${button.dataset.info}` : "");
+      if (!panel) return;
+      button.setAttribute("aria-expanded", "false");
+      panel.hidden = true;
+      panel.classList.remove("is-open");
+    });
+  }
+
+  function openInfoPanel(button, buttons) {
+    closeAllInfoPanels(buttons);
+    const panel = document.getElementById(button.dataset.info ? `info-${button.dataset.info}` : "");
+    if (!panel) return;
+    button.setAttribute("aria-expanded", "true");
+    panel.hidden = false;
+    panel.classList.add("is-open");
   }
 
   function attachApp() {
     const form = document.getElementById("rentbuy-form");
     if (!form) return;
 
     const nodes = {
       placeholder: document.getElementById("rentbuy-placeholder"),
       content: document.getElementById("rentbuy-result-content"),
       headline: document.getElementById("rentbuy-headline"),
       buyList: document.getElementById("rentbuy-buy-list"),
       rentList: document.getElementById("rentbuy-rent-list"),
       assumptions: document.getElementById("rentbuy-assumptions"),
       errors: document.getElementById("rentbuy-errors"),
+      buySummaryCard: document.getElementById("buy-summary-card"),
+      rentSummaryCard: document.getElementById("rent-summary-card"),
+      buyTotalLabel: document.getElementById("buy-total-label"),
+      buyTotalValue: document.getElementById("buy-total-value"),
+      buyAvgValue: document.getElementById("buy-avg-value"),
+      rentTotalLabel: document.getElementById("rent-total-label"),
+      rentTotalValue: document.getElementById("rent-total-value"),
+      rentAvgValue: document.getElementById("rent-avg-value"),
       fieldErrors: Object.fromEntries(REQUIRED_FIELDS.map((field) => [field, document.querySelector(`[data-error-for="${field}"]`)]))
     };
 
     const uiState = { touched: Object.fromEntries(REQUIRED_FIELDS.map((field) => [field, false])) };
 
     REQUIRED_FIELDS.forEach((field) => {
       const el = form.elements[field];
       const markTouched = () => {
         uiState.touched[field] = true;
         renderApp(form, nodes, uiState);
       };
       el.addEventListener("blur", markTouched);
       el.addEventListener("input", () => {
         if (uiState.touched[field]) renderApp(form, nodes, uiState);
       });
     });
 
     form.addEventListener("input", () => renderApp(form, nodes, uiState));
 
-    document.querySelectorAll(".info-toggle").forEach((button) => {
-      const panel = document.getElementById(button.dataset.info ? `info-${button.dataset.info}` : "");
-      if (!panel) return;
-      button.addEventListener("click", () => toggleInfoPanel(button, panel));
+    const infoButtons = Array.from(document.querySelectorAll(".info-toggle"));
+    infoButtons.forEach((button) => {
+      button.addEventListener("click", () => {
+        const isOpen = button.getAttribute("aria-expanded") === "true";
+        if (isOpen) {
+          closeAllInfoPanels(infoButtons);
+          return;
+        }
+        openInfoPanel(button, infoButtons);
+      });
+    });
+
+    document.addEventListener("click", (event) => {
+      if (event.target.closest(".rentbuy-field")) return;
+      closeAllInfoPanels(infoButtons);
     });
 
     document.getElementById("rentbuy-example-values").addEventListener("click", () => {
       const defaults = { closingCostPct: "10", interestPaPct: "3.5", repaymentPaPct: "2", years: "20" };
       Object.entries(defaults).forEach(([field, value]) => {
         if (String(form.elements[field].value).trim() === "") form.elements[field].value = value;
       });
       renderApp(form, nodes, uiState);
     });
 
     document.getElementById("rentbuy-reset").addEventListener("click", () => {
       form.reset();
       uiState.touched = Object.fromEntries(REQUIRED_FIELDS.map((field) => [field, false]));
       Object.values(nodes.fieldErrors).forEach((node) => { node.textContent = ""; });
-      document.querySelectorAll(".info-toggle").forEach((button) => {
-        const panel = document.getElementById(button.dataset.info ? `info-${button.dataset.info}` : "");
-        if (!panel) return;
-        button.setAttribute("aria-expanded", "false");
-        panel.hidden = true;
-        panel.classList.remove("is-open");
-      });
+      nodes.errors.hidden = true;
+      nodes.errors.innerHTML = "";
+      closeAllInfoPanels(infoButtons);
       renderApp(form, nodes, uiState);
     });
 
     renderApp(form, nodes, uiState);
   }
 
   function runSelfTests() {
     const baseState = {
       purchasePrice: 300000,
       equity: 60000,
       closingCostPct: 10,
       interestPaPct: 3,
       repaymentPaPct: 2,
       rentMonthly: 1200,
       years: 20
     };
 
     const s1 = parseAndNormalizeState(baseState).state;
     const b1 = simulateMortgageMonthly(s1);
     const r1 = simulateRentMonthly(s1, b1);
     const c1 = computeComparison(b1, r1, s1);
 
     const s2 = parseAndNormalizeState({ ...baseState, equity: 500000 }).state;
     const b2 = simulateMortgageMonthly(s2);
 
@@ -455,66 +530,81 @@
     const s5 = parseAndNormalizeState({ ...baseState, opportunityPaPct: 4, rentMonthly: 3000 }).state;
     const b5 = simulateMortgageMonthly(s5);
     const r5 = simulateRentMonthly(s5, b5);
 
     const s6a = parseAndNormalizeState(baseState).state;
     const s6b = parseAndNormalizeState({ ...baseState, maintenanceYearly: "", hoaMonthly: "", rentGrowthPaPct: "" }).state;
     const b6a = simulateMortgageMonthly(s6a);
     const r6a = simulateRentMonthly(s6a, b6a);
     const c6a = computeComparison(b6a, r6a, s6a);
     const b6b = simulateMortgageMonthly(s6b);
     const r6b = simulateRentMonthly(s6b, b6b);
     const c6b = computeComparison(b6b, r6b, s6b);
 
     const s7 = parseAndNormalizeState({
       ...baseState,
       equity: 300000,
       repaymentPaPct: 20,
       maintenanceYearly: 1200,
       hoaMonthly: 80,
       years: 10
     }).state;
     const b7 = simulateMortgageMonthly(s7);
     const floorCashflow = s7.maintenanceMonthly + s7.hoaMonthly;
     const hasPaidOffMonth = b7.kaufenCashflows.some((cashflow) => Math.abs(cashflow - floorCashflow) < 1e-6);
 
-    const s8 = parseAndNormalizeState({
-      ...baseState,
-      opportunityPaPct: 4,
-      rentMonthly: 4000
-    }).state;
+    const s8 = parseAndNormalizeState({ ...baseState, opportunityPaPct: 4, rentMonthly: 4000 }).state;
     const b8 = simulateMortgageMonthly(s8);
     const r8 = simulateRentMonthly(s8, b8);
     const c8 = computeComparison(b8, r8, s8);
     const baselineEndvermoegenBuy8 = round2(b8.verkaufserloes - b8.rest);
 
+    const s9 = parseAndNormalizeState(baseState).state;
+    const b9 = simulateMortgageMonthly(s9);
+    const r9 = simulateRentMonthly(s9, b9);
+    const cash9 = computeCashflowSummary(b9, r9, s9);
+
+    const s11 = parseAndNormalizeState({
+      ...baseState,
+      equity: 500000,
+      maintenanceYearly: 2400,
+      hoaMonthly: 100
+    }).state;
+    const b11 = simulateMortgageMonthly(s11);
+    const r11 = simulateRentMonthly(s11, b11);
+    const cash11 = computeCashflowSummary(b11, r11, s11);
+
     return [
       { id: "T1", pass: b1.rest > 0 && Number.isFinite(b1.rest) && Number.isFinite(c1.nettoBuy) },
       { id: "T2", pass: s2.loanPrincipal <= 0 && b2.rest === 0 && b2.rate === 0 && b2.zinsenGesamt >= 0 },
       { id: "T3", pass: r3.investmentEndeRent === 0 && r3.totalInvestDiffRent === 0 && r3.totalInvestDiffBuy === 0 },
       { id: "T4", pass: b4.rest <= round2(s4.loanPrincipal) },
       { id: "T5", pass: r5.totalInvestDiffBuy > 0 && r5.investmentEndeBuy > r5.totalInvestDiffBuy },
       { id: "T6", pass: c6a.nettoBuy === c6b.nettoBuy && c6a.nettoRent === c6b.nettoRent },
       { id: "T7", pass: hasPaidOffMonth && b7.kaufenCashflows[b7.kaufenCashflows.length - 1] === floorCashflow },
       {
         id: "T8",
         pass: r8.investmentEndeBuy > 0
           && c8.breakdown.endvermoegenBuy === round2(baselineEndvermoegenBuy8 + r8.investmentEndeBuy)
           && c8.nettoBuy > round2(baselineEndvermoegenBuy8 - c8.breakdown.nichtVermoegensKostenBuy)
-      }
+      },
+      { id: "T9", pass: Math.abs(cash9.totalPaidRent - r9.mieteGesamt) < 0.01 },
+      { id: "T10", pass: Math.abs(cash9.avgPaidRent * s9.months - cash9.totalPaidRent) < 1 },
+      { id: "T11", pass: s11.loanPrincipal <= 0 && cash11.totalPaidBuy > 0 && cash11.totalPaidBuy >= round2(s11.months * (s11.maintenanceMonthly + s11.hoaMonthly) + s11.closingCostEur + s11.renovationOneOff) }
     ];
   }
 
   if (typeof module !== "undefined" && module.exports) {
     module.exports = {
       parseAndNormalizeState,
       simulateMortgageMonthly,
       simulateRentMonthly,
       computeComparison,
+      computeCashflowSummary,
       runSelfTests
     };
   }
 
   if (typeof document !== "undefined") {
     document.addEventListener("DOMContentLoaded", attachApp);
   }
 })();
