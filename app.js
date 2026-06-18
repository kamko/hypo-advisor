const STORAGE_KEY = "hypo-advisor:mortgage:v1";
const URL_STATE_VERSION = 1;

function addMonthsToToday(months) {
  const today = new Date();
  const target = new Date(today.getFullYear(), today.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(today.getDate(), lastDay));
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}-${String(target.getDate()).padStart(2, "0")}`;
}

const defaults = {
  balance: 120000,
  maturityDate: addMonthsToToday(22 * 12),
  currentRate: 1.49,
  fixationEndDate: addMonthsToToday(8),
  rateNow: 3.89,
  futureRate: 3.49,
  switchCost: 0,
  horizonYears: 3,
};

const form = document.querySelector("#mortgage-form");
const inputs = [...form.querySelectorAll("input")];
const errorMessage = document.querySelector("#error-message");
const resultsContent = document.querySelector("#results-content");
const savedState = document.querySelector("#saved-state");
const copyLinkButton = document.querySelector("#copy-link");
let currentLanguage = navigator.language.toLowerCase().startsWith("sk") ? "sk" : "en";

const englishCopy = {
  privacy: "Data stays on this device",
  context: "Decision before the fixed-rate period ends",
  title: "Refix today or wait?",
  intro: "Compare both options over the same time horizon. No registration and no recommendation that hides its assumptions.",
  mortgageTitle: "Your mortgage today",
  mortgageHelp: "You can find these values in online banking or your loan agreement.",
  balance: "Outstanding mortgage balance",
  maturityDate: "Final maturity date",
  currentRate: "Current interest rate",
  fixationEnd: "Current fixed-rate period ends",
  assumptionsTitle: "Comparison assumptions",
  assumptionsHelp: "The future rate is only an estimate. Below, you can see the rate at which the result changes.",
  rateNow: "Rate if you refix today",
  futureRate: "Expected rate after the fixed period",
  switchCost: "Cost of switching today",
  switchCostHelp: "For example, a bank fee or property valuation.",
  horizon: "Comparison horizon",
  yearsSuffix: "years",
  comparison: "Comparison",
  saved: "Saved locally",
  copyLink: "Copy link to this scenario",
  result: "Comparison result",
  by: "by",
  scenario: "Scenario",
  payment: "Payment",
  interestFees: "Interest + fees",
  refixNow: "Refix today",
  wait: "Wait",
  refixShort: "Refix today",
  totalPaid: "Total paid from your account",
  principalPaid: "Of which principal repaid",
  balanceAfter: "Balance after the horizon",
  currentFixation: "Current fixed rate",
  newRate: "New rate",
  breakEven: "Break-even future rate",
  breakEvenHelp: "If the rate after the fixed period is around this level, both scenarios will cost the same.",
  calculationTitle: "How we calculate it",
  calculationHelp: "If you wait, we use your current payment until the fixed period ends and the new payment afterwards. If you refix today, we use the new payment from today. Each payment is split into interest and principal. Only principal reduces the outstanding balance.",
  otherDecisions: "Other decisions",
  otherDecisionsHelp: "More mortgage decisions will be added here over time.",
  fixationEndTab: "End of fixed-rate period",
  mortgageIncrease: "Increase the mortgage",
  mortgageInvestment: "Mortgage or investment",
  later: "Later",
  disclaimer: "Indicative calculation, not financial advice. Your bank may calculate the payment differently.",
  reset: "Restore sample values",
  today: "Today",
};

const slovakCopy = new Map(
  [...document.querySelectorAll("[data-i18n]")].map((element) => [element.dataset.i18n, element.textContent]),
);

const messages = {
  sk: {
    invalid: "Skontrolujte označené hodnoty. Každé pole musí obsahovať platnú hodnotu.",
    maturityFuture: "Dátum konečnej splatnosti musí byť v budúcnosti.",
    fixationFuture: "Koniec aktuálnej fixácie musí byť v budúcnosti.",
    fixationBeforeMaturity: "Koniec fixácie musí nastať pred konečnou splatnosťou hypotéky.",
    horizonAfterFixation: "Horizont porovnania musí siahať za koniec aktuálnej fixácie.",
    waitCheaper: "Čakanie vychádza lacnejšie",
    nowCheaper: "Refixácia dnes vychádza lacnejšie",
    equal: "Obe možnosti vychádzajú rovnako",
    equalExplanation: (duration) => `Pri zadaných predpokladoch majú oba scenáre za ${duration} rovnaké náklady.`,
    differenceExplanation: (duration) => `Rozdiel v zaplatených úrokoch a poplatkoch za ${duration}.`,
    maturityRemaining: (duration) => `Zostáva približne ${duration}.`,
    fixationRemaining: (duration) => `Do konca fixácie zostáva približne ${duration}.`,
    copied: "Odkaz skopírovaný",
  },
  en: {
    invalid: "Check the highlighted values. Each field must contain a valid value.",
    maturityFuture: "The final maturity date must be in the future.",
    fixationFuture: "The current fixed-rate period must end in the future.",
    fixationBeforeMaturity: "The fixed-rate period must end before the mortgage matures.",
    horizonAfterFixation: "The comparison horizon must extend beyond the current fixed-rate period.",
    waitCheaper: "Waiting costs less",
    nowCheaper: "Refixing today costs less",
    equal: "Both options cost the same",
    equalExplanation: (duration) => `Under these assumptions, both scenarios have the same cost over ${duration}.`,
    differenceExplanation: (duration) => `Difference in interest and fees paid over ${duration}.`,
    maturityRemaining: (duration) => `Approximately ${duration} remaining.`,
    fixationRemaining: (duration) => `Approximately ${duration} until the fixed-rate period ends.`,
    copied: "Link copied",
  },
};

const urlKeys = {
  balance: "b",
  maturityDate: "md",
  currentRate: "cr",
  fixationEndDate: "fd",
  rateNow: "rn",
  futureRate: "fr",
  switchCost: "sc",
  horizonYears: "hy",
  language: "l",
};

function message(key, ...args) {
  const value = messages[currentLanguage][key];
  return typeof value === "function" ? value(...args) : value;
}

function numberLocale() {
  return currentLanguage === "sk" ? "sk-SK" : "en-GB";
}

function formatEuro(value, decimals = 0) {
  return new Intl.NumberFormat(numberLocale(), {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

function formatPercent(value) {
  return new Intl.NumberFormat(numberLocale(), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    element.textContent = currentLanguage === "en" ? englishCopy[key] : slovakCopy.get(key);
  });
  document.querySelectorAll("[data-language]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.language === currentLanguage));
  });
}

function monthlyPayment(principal, annualRate, months) {
  if (principal <= 0 || months <= 0) return 0;
  const rate = annualRate / 100 / 12;
  if (rate === 0) return principal / months;
  return principal * (rate * (1 + rate) ** months) / ((1 + rate) ** months - 1);
}

function simulate(principal, annualRate, totalMonths, monthsToRun) {
  let balance = principal;
  let interest = 0;
  let paid = 0;
  const payment = monthlyPayment(principal, annualRate, totalMonths);
  const monthlyRate = annualRate / 100 / 12;
  const run = Math.min(monthsToRun, totalMonths);

  for (let month = 0; month < run; month += 1) {
    const interestPart = balance * monthlyRate;
    const principalPart = Math.min(payment - interestPart, balance);
    interest += interestPart;
    paid += interestPart + principalPart;
    balance = Math.max(0, balance - principalPart);
  }

  return { balance, interest, payment, paid };
}

function scenarioNow(values) {
  const totalMonths = values.totalMonths;
  const horizonMonths = Math.min(values.horizonYears * 12, totalMonths);
  const period = simulate(values.balance, values.rateNow, totalMonths, horizonMonths);
  return {
    cost: period.interest + values.switchCost,
    paid: period.paid + values.switchCost,
    payment: period.payment,
    balance: period.balance,
  };
}

function scenarioWait(values, futureRate = values.futureRate) {
  const totalMonths = values.totalMonths;
  const horizonMonths = Math.min(values.horizonYears * 12, totalMonths);
  const firstMonths = Math.min(values.monthsToFix, horizonMonths);
  const first = simulate(values.balance, values.currentRate, totalMonths, firstMonths);
  const remainingHorizon = horizonMonths - firstMonths;
  const remainingTerm = totalMonths - firstMonths;
  const second = simulate(first.balance, futureRate, remainingTerm, remainingHorizon);

  return {
    cost: first.interest + second.interest,
    paid: first.paid + second.paid,
    paymentBefore: first.payment,
    paymentAfter: second.payment,
    balance: second.balance,
  };
}

function findBreakEven(values, targetCost) {
  let low = 0;
  let high = 20;
  for (let i = 0; i < 60; i += 1) {
    const mid = (low + high) / 2;
    if (scenarioWait(values, mid).cost < targetCost) low = mid;
    else high = mid;
  }
  const result = (low + high) / 2;
  return result >= 19.99 ? null : result;
}

function getValues() {
  const values = Object.fromEntries(inputs.map((input) => [
    input.name,
    input.type === "date" ? input.value : Number(input.value),
  ]));
  values.totalMonths = monthsUntil(values.maturityDate);
  values.monthsToFix = monthsUntil(values.fixationEndDate);
  return values;
}

function parseLocalDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function monthsUntil(value) {
  const target = parseLocalDate(value);
  if (!target) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let months = (target.getFullYear() - today.getFullYear()) * 12 + target.getMonth() - today.getMonth();
  if (target.getDate() > today.getDate()) months += 1;
  return Math.max(0, months);
}

function formatRemainingMonths(months) {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years) {
    parts.push(currentLanguage === "sk"
      ? `${years} ${years === 1 ? "rok" : years < 5 ? "roky" : "rokov"}`
      : `${years} ${years === 1 ? "year" : "years"}`);
  }
  if (rest) parts.push(pluralMonths(rest));
  return parts.join(currentLanguage === "sk" ? " a " : " and ")
    || (currentLanguage === "sk" ? "menej ako mesiac" : "less than a month");
}

function validate(values) {
  if (!form.checkValidity()) return message("invalid");
  if (values.totalMonths < 1) return message("maturityFuture");
  if (values.monthsToFix < 1) return message("fixationFuture");
  if (parseLocalDate(values.fixationEndDate) >= parseLocalDate(values.maturityDate)) return message("fixationBeforeMaturity");
  if (values.horizonYears * 12 <= values.monthsToFix) return message("horizonAfterFixation");
  return "";
}

function pluralMonths(value) {
  if (currentLanguage === "en") return `${value} ${value === 1 ? "month" : "months"}`;
  if (value === 1) return "1 mesiac";
  if (value >= 2 && value <= 4) return `${value} mesiace`;
  return `${value} mesiacov`;
}

function pluralYears(value) {
  if (currentLanguage === "en") return `${value} ${value === 1 ? "year" : "years"}`;
  return `${value} ${value === 1 ? "rok" : value < 5 ? "roky" : "rokov"}`;
}

function save(values) {
  values.language = currentLanguage;
  const persistentValues = Object.fromEntries(Object.keys(urlKeys).map((key) => [key, values[key]]));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persistentValues));
  updateUrl(persistentValues);
  savedState.classList.remove("flash");
  void savedState.offsetWidth;
  savedState.classList.add("flash");
}

function encodeUrlState(values) {
  const compact = { v: URL_STATE_VERSION };
  Object.entries(urlKeys).forEach(([key, shortKey]) => { compact[shortKey] = values[key]; });
  return btoa(JSON.stringify(compact))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

function decodeUrlState() {
  const match = location.hash.match(/^#s=([A-Za-z0-9_-]+)$/u);
  if (!match) return null;
  try {
    const base64 = match[1].replaceAll("-", "+").replaceAll("_", "/");
    const compact = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")));
    if (compact.v !== URL_STATE_VERSION) return null;
    return Object.fromEntries(
      Object.entries(urlKeys)
        .filter(([, shortKey]) => compact[shortKey] !== undefined)
        .map(([key, shortKey]) => [key, compact[shortKey]]),
    );
  } catch {
    return null;
  }
}

function updateUrl(values) {
  const url = new URL(location.href);
  url.hash = `s=${encodeUrlState(values)}`;
  history.replaceState(null, "", url);
}

function render() {
  const values = getValues();
  const error = validate(values);
  errorMessage.hidden = !error;
  errorMessage.textContent = error;
  resultsContent.style.opacity = error ? "0.45" : "1";
  if (error) return;

  const now = scenarioNow(values);
  const wait = scenarioWait(values);
  const difference = now.cost - wait.cost;
  const absDifference = Math.abs(difference);
  const duration = pluralYears(values.horizonYears);
  const explanation = difference === 0
    ? message("equalExplanation", duration)
    : message("differenceExplanation", duration);

  const outcome = difference > 0 ? "wait" : difference < 0 ? "now" : "even";
  const differenceBlock = document.querySelector(".difference-block");
  differenceBlock.dataset.outcome = outcome;
  document.querySelector("#difference-label").textContent = currentLanguage === "sk" ? slovakCopy.get("result") : englishCopy.result;
  document.querySelector("#outcome-verdict").textContent = difference === 0
    ? message("equal")
    : message(difference > 0 ? "waitCheaper" : "nowCheaper");
  document.querySelector("#cost-difference").textContent = formatEuro(absDifference);
  document.querySelector("#difference-explanation").textContent = explanation;
  document.querySelector("#now-payment").textContent = formatEuro(now.payment, 2);
  document.querySelector("#now-cost").textContent = formatEuro(now.cost);
  document.querySelector("#wait-payment").textContent = `${formatEuro(wait.paymentBefore, 2)} → ${formatEuro(wait.paymentAfter, 2)}`;
  document.querySelector("#wait-cost").textContent = formatEuro(wait.cost);
  document.querySelector("#wait-months-label").textContent = pluralMonths(values.monthsToFix);
  document.querySelector("#maturity-helper").textContent = message("maturityRemaining", formatRemainingMonths(values.totalMonths));
  document.querySelector("#fixation-helper").textContent = message("fixationRemaining", pluralMonths(values.monthsToFix));
  document.querySelector("#scenario-now-row").classList.toggle("is-cheaper", outcome === "now");
  document.querySelector("#scenario-wait-row").classList.toggle("is-cheaper", outcome === "wait");
  document.querySelector("#now-paid").textContent = formatEuro(now.paid);
  document.querySelector("#wait-paid").textContent = formatEuro(wait.paid);
  document.querySelector("#now-principal-paid").textContent = formatEuro(values.balance - now.balance);
  document.querySelector("#wait-principal-paid").textContent = formatEuro(values.balance - wait.balance);
  document.querySelector("#now-balance").textContent = formatEuro(now.balance);
  document.querySelector("#wait-balance").textContent = formatEuro(wait.balance);

  const breakEven = findBreakEven(values, now.cost);
  document.querySelector("#break-even-rate").textContent = breakEven === null ? "> 20 %" : `${formatPercent(breakEven)} %`;

  document.querySelector("#fix-point-label").textContent = currentLanguage === "sk" ? `O ${values.monthsToFix} mes.` : `In ${pluralMonths(values.monthsToFix)}`;
  document.querySelector("#horizon-label").textContent = currentLanguage === "sk" ? `O ${values.horizonYears} r.` : `In ${pluralYears(values.horizonYears)}`;
  const marker = Math.min(100, values.monthsToFix / (values.horizonYears * 12) * 100);
  document.querySelector(".timeline-track").style.setProperty("--marker", `${marker}%`);

  save(values);
}

function load() {
  let values = defaults;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const shared = decodeUrlState();
    values = { ...defaults, ...stored, ...(shared || {}) };
    if (values.language === "sk" || values.language === "en") currentLanguage = values.language;
    if (!shared && !stored.maturityDate && stored.yearsLeft) values.maturityDate = addMonthsToToday(stored.yearsLeft * 12);
    if (!shared && !stored.fixationEndDate && stored.monthsToFix) values.fixationEndDate = addMonthsToToday(stored.monthsToFix);
  } catch {
    values = defaults;
  }
  inputs.forEach((input) => {
    if (values[input.name] !== undefined) input.value = values[input.name];
  });
  const todayIso = addMonthsToToday(0);
  document.querySelector("#maturityDate").min = todayIso;
  document.querySelector("#fixationEndDate").min = todayIso;
}

async function copyShareLink() {
  const originalLabel = copyLinkButton.textContent;
  try {
    await navigator.clipboard.writeText(location.href);
    copyLinkButton.textContent = message("copied");
  } catch {
    const temporary = document.createElement("textarea");
    temporary.value = location.href;
    temporary.setAttribute("readonly", "");
    temporary.style.position = "fixed";
    temporary.style.opacity = "0";
    document.body.append(temporary);
    temporary.select();
    document.execCommand("copy");
    temporary.remove();
    copyLinkButton.textContent = message("copied");
  }
  window.setTimeout(() => { copyLinkButton.textContent = originalLabel; }, 1800);
}

form.addEventListener("input", render);
copyLinkButton.addEventListener("click", copyShareLink);
document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => {
    currentLanguage = button.dataset.language;
    applyLanguage();
    render();
  });
});
document.querySelector("#reset-button").addEventListener("click", () => {
  inputs.forEach((input) => { input.value = defaults[input.name]; });
  localStorage.removeItem(STORAGE_KEY);
  render();
  document.querySelector("#balance").focus();
});

load();
applyLanguage();
render();
