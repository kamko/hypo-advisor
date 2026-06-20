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
  currentPayment: null,
  fixationEndDate: addMonthsToToday(8),
  refixDelayMonths: 0,
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
  title: "Refix earlier or wait?",
  intro: "Compare both options over the same time horizon. No registration and no recommendation that hides its assumptions.",
  mortgageTitle: "Your mortgage today",
  mortgageHelp: "You can find these values in online banking or your loan agreement.",
  balance: "Outstanding mortgage balance",
  maturityDate: "Final maturity date",
  currentRate: "Current interest rate",
  currentPayment: "Current monthly payment",
  currentPaymentHelp: "The regular payment set by your bank, excluding overpayments. Leave blank to use our estimate.",
  fixationEnd: "Current fixed-rate period ends",
  assumptionsTitle: "Comparison assumptions",
  assumptionsHelp: "The future rate is only an estimate. Below, you can see the rate at which the result changes.",
  refixDelay: "Move today forward by",
  monthsSuffix: "mo.",
  rateNow: "Rate if you refix on that date",
  futureRate: "Expected rate after the fixed period",
  switchCost: "Cost of the earlier refix",
  switchCostHelp: "For example, a bank fee or property valuation.",
  horizon: "Comparison horizon",
  yearsSuffix: "years",
  comparison: "Comparison",
  saved: "Saved locally",
  shareScenario: "Share scenario",
  result: "Comparison result",
  lowerCost: "Lower interest and fees",
  lowerCashflow: "Lower cash outflow",
  lowerBalance: "Lower outstanding balance",
  summaryHelp: "Principal repaid is not a cost — it reduces the outstanding balance.",
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
  earlyRefix: "Earlier refix",
  scheduledFix: "Scheduled fixed-rate end",
  breakEven: "Break-even future rate",
  breakEvenHelp: "If the rate after the fixed period is around this level, both scenarios will cost the same.",
  calculationTitle: "How we calculate it",
  calculationHelp: "If you wait, we use your current payment until the fixed period ends and the new payment afterwards. If you refix today, we use the new payment from today. Each payment is split into interest and principal. Only principal reduces the outstanding balance.",
  calcIntro: "We use a standard annuity model with monthly compounding. Calculations run without intermediate rounding.",
  calcShift: "First, we project the mortgage d months forward. This common period is excluded from the comparison; both scenarios start with the same balance Bₑ on the shifted date.",
  calcVariables: "Variables",
  varPrincipal: "current outstanding principal",
  varRate: "monthly rate = annual rate / 100 / 12",
  varTerm: "number of months until final maturity",
  varFixation: "number of months until the current fixed-rate period ends",
  varDelay: "number of months until the shifted comparison start",
  varHorizon: "comparison horizon in months",
  calcPayment: "Annuity payment",
  calcZeroRate: "For a zero rate, we use M = P / n.",
  calcMonthly: "Each month",
  calcMonthlyHelp: "I is interest, A is principal repaid and B is the outstanding balance. If you enter the current payment from your bank, we use it instead of the calculated M for the first k months.",
  calcScenarios: "Scenarios",
  calcNow: "Refix earlier: for the first d months, we use the current rate and payment. From balance Bₑ, we then calculate a new payment at the earlier refix rate over the remaining n − d months.",
  calcWait: "Wait: for the first k months, we use the current rate and current payment. From balance Bₖ, we then calculate a new payment at the expected rate over the remaining n − k months.",
  calcOutputs: "Outputs",
  calcOutflow: "Total paid from your account = all payments within the horizon + the cost of the earlier refix.",
  calcCost: "Interest and fees = sum of Iₜ + the cost of the earlier refix. Principal repaid is not a cost.",
  calcPrincipal: "Principal repaid = P − Bₕ.",
  calcBalance: "Balance after the horizon = Bₕ.",
  calcBreakEven: "Break-even rate",
  calcBreakEvenHelp: "Using binary search between 0% and 20%, we find the future rate at which interest and fees are equal in both scenarios.",
  calcDates: "Dates and rounding",
  calcDatesHelp: "We derive the number of payments from calendar months between today and the entered date; a partial final month counts as another payment. Payments are displayed to cents and totals to whole euros, but calculations use full precision. Your bank may use daily interest and its own rounding rules.",
  otherDecisions: "Other decisions",
  otherDecisionsHelp: "More mortgage decisions will be added here over time.",
  fixationEndTab: "End of fixed-rate period",
  decisionType: "What do you want to calculate?",
  decisionTypeHelp: "Each calculation uses its own assumptions and all data stays in your browser.",
  consolidationTab: "Loan consolidation",
  stressTab: "Payment stress test",
  currentLoans: "Current loans",
  currentLoansHelp: "We compare the same debt with a different rate and repayment period.",
  addLoan: "Add another loan",
  loanBalance: "Outstanding balance",
  loanRate: "Interest rate",
  loanTerm: "Remaining term",
  consolidationOffer: "Consolidation offer",
  consolidationOfferHelp: "The full debt is spread over the selected term. A longer term can reduce the payment but increase interest.",
  consolidationRate: "New interest rate",
  consolidationTerm: "New repayment term",
  consolidationFees: "One-off fees",
  monthlyRelief: "Change in monthly payment",
  totalInterestFees: "Total interest + fees",
  keepSeparate: "Keep loans separate",
  combineLoans: "Combine into one mortgage",
  monthlyDifference: "Monthly difference",
  costDifference: "Difference in total cost",
  debtFreeDifference: "Difference in repayment time",
  consolidationMethod: "We use annuity repayment. For separate loans, we add their current payments and all future interest. For consolidation, we add the principal balances, use the new rate and term, and include fees.",
  stressInputs: "Mortgage and budget",
  stressInputsHelp: "We do not predict the future. We show what higher rates would do to the household budget.",
  referenceRate: "Starting interest rate",
  householdIncome: "Household net monthly income",
  incomeHelp: "We use it only to show the payment as a share of income.",
  stressResult: "Payment resilience",
  highestScenario: "At the highest scenario",
  rate: "Rate",
  paymentChange: "Change",
  incomeShare: "Of income",
  stressNoteTitle: "How to read the result",
  stressNote: "The share of income is neither bank approval nor a universal safety limit. It excludes other expenses, loans and the household's financial reserve.",
  stressMethod: "For each rate, we recalculate the annuity payment using the same balance and remaining term. The scenarios are the starting rate, then +1, +2 and +3 percentage points.",
  mortgageBalance: "Outstanding mortgage balance",
  mortgageTerm: "Remaining mortgage term",
  mortgageIncrease: "Increase the mortgage",
  mortgageInvestment: "Mortgage or investment",
  later: "Later",
  disclaimer: "Indicative calculation, not financial advice. Your bank may calculate the payment differently.",
  reset: "Restore sample values",
  today: "Today",
};

const dynamicSlovakCopy = {
  loanBalance: "Zostatok",
  loanRate: "Úroková sadzba",
  loanTerm: "Zostávajúca splatnosť",
  monthsSuffix: "mes.",
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
    delayBeforeFixation: "Posunutý dnešok musí byť pred riadnym koncom fixácie.",
    waitCheaper: "Počkať",
    nowCheaper: "Refixovať dnes",
    equal: "Rovnaké náklady",
    equalExplanation: (duration) => `Pri zadaných predpokladoch majú oba scenáre za ${duration} rovnaké náklady.`,
    differenceExplanation: (duration) => `na úrokoch a poplatkoch počas ${duration}.`,
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
    delayBeforeFixation: "The shifted start date must be before the current fixed-rate period ends.",
    waitCheaper: "Wait",
    nowCheaper: "Refix today",
    equal: "Equal cost",
    equalExplanation: (duration) => `Under these assumptions, both scenarios have the same cost over ${duration}.`,
    differenceExplanation: (duration) => `in interest and fees over ${duration}.`,
    maturityRemaining: (duration) => `Approximately ${duration} remaining.`,
    fixationRemaining: (duration) => `Approximately ${duration} until the fixed-rate period ends.`,
    copied: "Link copied",
  },
};

const urlKeys = {
  balance: "b",
  maturityDate: "md",
  currentRate: "cr",
  currentPayment: "cp",
  fixationEndDate: "fd",
  rateNow: "rn",
  futureRate: "fr",
  switchCost: "sc",
  horizonYears: "hy",
  refixDelayMonths: "rd",
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
    element.textContent = currentLanguage === "en" ? englishCopy[key] : (slovakCopy.get(key) ?? dynamicSlovakCopy[key] ?? element.textContent);
  });
  document.querySelectorAll("[data-language]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.language === currentLanguage));
  });
  document.querySelectorAll("[data-number]").forEach((input) => {
    const value = parseLocalizedNumber(input.value);
    if (Number.isFinite(value)) {
      input.value = String(value).replace(".", currentLanguage === "sk" ? "," : ".");
    }
  });
  document.querySelector("#currentPayment").placeholder = currentLanguage === "sk" ? "Vypočítame" : "Calculated automatically";
}

function monthlyPayment(principal, annualRate, months) {
  if (principal <= 0 || months <= 0) return 0;
  const rate = annualRate / 100 / 12;
  if (rate === 0) return principal / months;
  return principal * (rate * (1 + rate) ** months) / ((1 + rate) ** months - 1);
}

function simulate(principal, annualRate, totalMonths, monthsToRun, paymentOverride = null) {
  let balance = principal;
  let interest = 0;
  let paid = 0;
  const payment = paymentOverride || monthlyPayment(principal, annualRate, totalMonths);
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

function comparisonStart(values) {
  const delay = Math.min(values.refixDelayMonths, values.totalMonths);
  const projected = simulate(values.balance, values.currentRate, values.totalMonths, delay, values.currentPayment);
  return {
    balance: projected.balance,
    totalMonths: values.totalMonths - delay,
    monthsToFix: Math.max(0, values.monthsToFix - delay),
  };
}

function scenarioNow(values) {
  const start = comparisonStart(values);
  const horizonMonths = Math.min(values.horizonYears * 12, start.totalMonths);
  const period = simulate(start.balance, values.rateNow, start.totalMonths, horizonMonths);
  return {
    cost: period.interest + values.switchCost,
    paid: period.paid + values.switchCost,
    payment: period.payment,
    balance: period.balance,
    startBalance: start.balance,
  };
}

function scenarioWait(values, futureRate = values.futureRate) {
  const start = comparisonStart(values);
  const horizonMonths = Math.min(values.horizonYears * 12, start.totalMonths);
  const firstMonths = Math.min(start.monthsToFix, horizonMonths);
  const first = simulate(start.balance, values.currentRate, start.totalMonths, firstMonths, values.currentPayment);
  const remainingHorizon = horizonMonths - firstMonths;
  const remainingTerm = start.totalMonths - firstMonths;
  const second = simulate(first.balance, futureRate, remainingTerm, remainingHorizon);

  return {
    cost: first.interest + second.interest,
    paid: first.paid + second.paid,
    paymentBefore: first.payment,
    paymentAfter: second.payment,
    balance: second.balance,
    startBalance: start.balance,
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
  const values = Object.fromEntries(inputs.map((input) => {
    if (input.dataset.number !== undefined) {
      const value = parseLocalizedNumber(input.value);
      const min = input.dataset.min === undefined ? -Infinity : Number(input.dataset.min);
      const max = input.dataset.max === undefined ? Infinity : Number(input.dataset.max);
      const valid = value === null ? !input.required : Number.isFinite(value) && value >= min && value <= max;
      input.setCustomValidity(valid ? "" : "invalid");
      return [input.name, value];
    }
    return [input.name, input.type === "date" ? input.value : input.value === "" ? null : Number(input.value)];
  }));
  values.totalMonths = monthsUntil(values.maturityDate);
  values.monthsToFix = monthsUntil(values.fixationEndDate);
  document.querySelector("#refixDelayMonths").max = String(Math.max(0, values.monthsToFix - 1));
  return values;
}

function parseLocalizedNumber(rawValue) {
  let value = String(rawValue ?? "").trim().replace(/[\s\u00a0]/gu, "");
  if (!value) return null;
  if (!/^[+-]?[0-9.,]+$/u.test(value)) return Number.NaN;

  const comma = value.lastIndexOf(",");
  const dot = value.lastIndexOf(".");
  const decimalIndex = Math.max(comma, dot);
  if (decimalIndex >= 0) {
    const integerPart = value.slice(0, decimalIndex).replace(/[.,]/gu, "");
    const decimalPart = value.slice(decimalIndex + 1).replace(/[.,]/gu, "");
    value = `${integerPart}.${decimalPart}`;
  }
  return Number(value);
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
  if (Number.isFinite(values.refixDelayMonths) && values.monthsToFix > 0 && values.refixDelayMonths >= values.monthsToFix) {
    return message("delayBeforeFixation");
  }
  if (!form.checkValidity()) return message("invalid");
  if (values.totalMonths < 1) return message("maturityFuture");
  if (values.monthsToFix < 1) return message("fixationFuture");
  if (values.currentPayment && values.currentPayment <= values.balance * (values.currentRate / 100 / 12)) {
    return currentLanguage === "sk"
      ? "Aktuálna splátka musí byť vyššia ako mesačný úrok."
      : "The current payment must be higher than the monthly interest.";
  }
  if (parseLocalDate(values.fixationEndDate) >= parseLocalDate(values.maturityDate)) return message("fixationBeforeMaturity");
  if (values.horizonYears * 12 <= values.monthsToFix - values.refixDelayMonths) return message("horizonAfterFixation");
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

function refixScenarioLabel(months, short = false) {
  if (currentLanguage === "en") {
    if (months === 0) return short ? "Refix today" : "Refix today";
    return `Refix in ${pluralMonths(months)}`;
  }
  if (months === 0) return short ? "Refix dnes" : "Refixovať dnes";
  return `${short ? "Refix" : "Refixovať"} o ${pluralMonths(months)}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat(numberLocale(), {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseLocalDate(value));
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
  const number = (value, multiplier = 1) => Math.round(Number(value) * multiplier).toString(36);
  const date = (value) => Number(value.replaceAll("-", "")).toString(36);
  return [
    3,
    number(values.balance, 100),
    date(values.maturityDate),
    number(values.currentRate, 100),
    date(values.fixationEndDate),
    values.currentPayment ? number(values.currentPayment, 100) : "-",
    number(values.refixDelayMonths),
    number(values.rateNow, 100),
    number(values.futureRate, 100),
    number(values.switchCost, 100),
    number(values.horizonYears),
    values.language === "sk" ? "s" : "e",
  ].join(".");
}

function decodeUrlState() {
  const encoded = new URL(location.href).searchParams.get("s");
  if (encoded) {
    try {
      const parts = encoded.split(".");
      const isVersion3 = parts[0] === "3" && parts.length === 12;
      const isVersion2 = parts[0] === "2" && parts.length === 11;
      if (!isVersion3 && !isVersion2) return null;
      const languageIndex = isVersion3 ? 11 : 10;
      const numericPartsAreValid = parts.slice(1, languageIndex).every((part, index) => (
        index === 4 ? /^(?:-|[0-9a-z]+)$/u.test(part) : /^[0-9a-z]+$/u.test(part)
      ));
      if (!numericPartsAreValid || !/^[se]$/u.test(parts[languageIndex])) return null;
      const number = (value, divisor = 1) => parseInt(value, 36) / divisor;
      const date = (value) => {
        const raw = String(parseInt(value, 36)).padStart(8, "0");
        return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
      };
      return {
        balance: number(parts[1], 100),
        maturityDate: date(parts[2]),
        currentRate: number(parts[3], 100),
        fixationEndDate: date(parts[4]),
        currentPayment: parts[5] === "-" ? null : number(parts[5], 100),
        refixDelayMonths: isVersion3 ? number(parts[6]) : 0,
        rateNow: number(parts[isVersion3 ? 7 : 6], 100),
        futureRate: number(parts[isVersion3 ? 8 : 7], 100),
        switchCost: number(parts[isVersion3 ? 9 : 8], 100),
        horizonYears: number(parts[isVersion3 ? 10 : 9]),
        language: parts[languageIndex] === "s" ? "sk" : "en",
      };
    } catch {
      return null;
    }
  }

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
  url.searchParams.set("s", encodeUrlState(values));
  url.hash = "";
  history.replaceState(null, "", url);
}

function render() {
  const values = getValues();
  const error = validate(values);
  errorMessage.hidden = !error;
  errorMessage.textContent = error;
  resultsContent.hidden = Boolean(error);
  if (error) return;

  const now = scenarioNow(values);
  const wait = scenarioWait(values);
  const start = comparisonStart(values);
  const shiftedDate = addMonthsToToday(values.refixDelayMonths);
  const duration = pluralYears(values.horizonYears);
  const waitHasLowerCost = wait.cost <= now.cost;
  const subject = waitHasLowerCost ? wait : now;
  const other = waitHasLowerCost ? now : wait;
  const subjectName = currentLanguage === "sk"
    ? (waitHasLowerCost ? "Čakanie" : refixScenarioLabel(values.refixDelayMonths, true))
    : (waitHasLowerCost ? "Waiting" : refixScenarioLabel(values.refixDelayMonths, true));
  const costAdvantage = Math.abs(other.cost - subject.cost);
  const cashAdvantage = other.paid - subject.paid;
  const balanceAdvantage = other.balance - subject.balance;
  const cashWord = currentLanguage === "sk"
    ? (cashAdvantage >= 0 ? "menej" : "viac")
    : (cashAdvantage >= 0 ? "less" : "more");
  const balanceWord = currentLanguage === "sk"
    ? (balanceAdvantage >= 0 ? "nižší" : "vyšší")
    : (balanceAdvantage >= 0 ? "lower" : "higher");

  document.querySelector("#difference-label").textContent = currentLanguage === "sk"
    ? `Počas ${values.horizonYears} ${values.horizonYears === 1 ? "roka" : "rokov"} od ${formatDate(shiftedDate)}`
    : `Over ${duration} from ${formatDate(shiftedDate)}`;
  const headlineSubject = document.querySelector("#headline-subject");
  const headlineAction = document.querySelector("#headline-action");
  const headlineAmount = document.querySelector("#headline-amount");
  const headlineRest = document.querySelector("#headline-rest");
  headlineSubject.className = costAdvantage < 0.5 ? "" : (waitHasLowerCost ? "is-wait" : "is-now");
  headlineAmount.className = "";
  if (costAdvantage < 0.5) {
    headlineSubject.textContent = currentLanguage === "sk" ? "Oba scenáre majú rovnaké úroky a poplatky." : "Both scenarios have the same interest and fees.";
    headlineAction.textContent = "";
    headlineAmount.textContent = "";
    headlineRest.textContent = "";
  } else {
    headlineSubject.textContent = subjectName;
    headlineAction.textContent = currentLanguage === "sk" ? "ušetrí" : "saves";
    headlineAmount.textContent = formatEuro(costAdvantage);
    headlineAmount.className = waitHasLowerCost ? "is-wait" : "is-now";
    headlineRest.textContent = currentLanguage === "sk" ? "na úrokoch a poplatkoch." : "in interest and fees.";
  }
  document.querySelector("#cashflow-label").textContent = currentLanguage === "sk" ? "Z účtu odíde" : "Cash outflow is";
  document.querySelector("#cashflow-detail").textContent = `${currentLanguage === "sk" ? "o " : ""}${formatEuro(Math.abs(cashAdvantage))} ${cashWord}`;
  document.querySelector("#cashflow-detail").className = cashAdvantage >= 0 ? "is-positive" : "is-tradeoff";
  document.querySelector("#balance-label").textContent = currentLanguage === "sk" ? "Zostávajúci dlh bude" : "Outstanding balance is";
  document.querySelector("#balance-detail").textContent = `${currentLanguage === "sk" ? "o " : ""}${formatEuro(Math.abs(balanceAdvantage))} ${balanceWord}`;
  document.querySelector("#balance-detail").className = balanceAdvantage >= 0 ? "is-positive" : "is-tradeoff";

  const connector = cashAdvantage >= 0 && balanceAdvantage >= 0
    ? " + "
    : (currentLanguage === "sk" ? ", ale " : ", but ");
  document.querySelector("#result-equation").textContent = currentLanguage === "sk"
    ? `${formatEuro(Math.abs(cashAdvantage))} ${cashWord} z účtu${connector}${formatEuro(Math.abs(balanceAdvantage))} ${balanceWord} dlh = ${formatEuro(costAdvantage)} úspora.`
    : `${formatEuro(Math.abs(cashAdvantage))} ${cashWord} cash outflow${connector}${formatEuro(Math.abs(balanceAdvantage))} ${balanceWord} debt = ${formatEuro(costAdvantage)} saved.`;
  document.querySelector("#now-payment").textContent = formatEuro(now.payment, 2);
  document.querySelector("#now-cost").textContent = formatEuro(now.cost);
  document.querySelector("#wait-payment").textContent = `${formatEuro(wait.paymentBefore, 2)} → ${formatEuro(wait.paymentAfter, 2)}`;
  document.querySelector("#wait-cost").textContent = formatEuro(wait.cost);
  document.querySelector("#refix-scenario-name").textContent = refixScenarioLabel(values.refixDelayMonths);
  document.querySelector("#refix-short-name").textContent = refixScenarioLabel(values.refixDelayMonths, true);
  document.querySelector("#wait-months-label").textContent = pluralMonths(start.monthsToFix);
  document.querySelector("#current-payment-source").textContent = values.currentPayment
    ? (currentLanguage === "sk" ? "Splátka z banky" : "Payment from bank")
    : (currentLanguage === "sk" ? "Anuitný odhad" : "Annuity estimate");
  document.querySelector("#maturity-helper").textContent = message("maturityRemaining", formatRemainingMonths(values.totalMonths));
  document.querySelector("#fixation-helper").textContent = message("fixationRemaining", pluralMonths(values.monthsToFix));
  document.querySelector("#scenario-now-row").classList.remove("is-cheaper");
  document.querySelector("#scenario-wait-row").classList.remove("is-cheaper");
  document.querySelector("#now-paid").textContent = formatEuro(now.paid);
  document.querySelector("#wait-paid").textContent = formatEuro(wait.paid);
  document.querySelector("#now-principal-paid").textContent = formatEuro(start.balance - now.balance);
  document.querySelector("#wait-principal-paid").textContent = formatEuro(start.balance - wait.balance);
  document.querySelector("#now-balance").textContent = formatEuro(now.balance);
  document.querySelector("#wait-balance").textContent = formatEuro(wait.balance);

  const breakEven = findBreakEven(values, now.cost);
  document.querySelector("#break-even-rate").textContent = breakEven === null ? "> 20 %" : `${formatPercent(breakEven)} %`;

  document.querySelector("#refix-delay-help").textContent = currentLanguage === "sk"
    ? `Porovnanie začne ${formatDate(shiftedDate)}. Najprv odhadneme zostatok k tomuto dátumu.`
    : `The comparison starts on ${formatDate(shiftedDate)}. We first estimate the balance on that date.`;
  document.querySelector("#refix-point-label").textContent = currentLanguage === "sk"
    ? `${refixScenarioLabel(values.refixDelayMonths, true)} · Fix o ${values.monthsToFix} mes.`
    : `${refixScenarioLabel(values.refixDelayMonths, true)} · Fix in ${pluralMonths(values.monthsToFix)}`;
  document.querySelector("#horizon-label").textContent = currentLanguage === "sk" ? `Horizont +${values.horizonYears} r.` : `Horizon +${pluralYears(values.horizonYears)}`;
  const timelineMonths = values.refixDelayMonths + values.horizonYears * 12;
  const refixMarker = Math.min(100, values.refixDelayMonths / timelineMonths * 100);
  const fixMarker = Math.min(100, values.monthsToFix / timelineMonths * 100);
  const timelineTrack = document.querySelector(".timeline-track");
  timelineTrack.style.setProperty("--refix-marker", `${refixMarker}%`);
  timelineTrack.style.setProperty("--fix-marker", `${fixMarker}%`);

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
  const label = copyLinkButton.querySelector("span");
  const originalLabel = label.textContent;
  try {
    await navigator.clipboard.writeText(location.href);
    label.textContent = message("copied");
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
    label.textContent = message("copied");
  }
  window.setTimeout(() => { label.textContent = originalLabel; }, 1800);
}

form.addEventListener("input", render);
copyLinkButton.addEventListener("click", copyShareLink);
document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => {
    currentLanguage = button.dataset.language;
    applyLanguage();
    render();
    updateLoanLabels();
    renderConsolidation();
    renderStressTest();
    setDecisionMode(activeDecisionMode, false);
  });
});
document.querySelector("#reset-button").addEventListener("click", () => {
  inputs.forEach((input) => { input.value = defaults[input.name]; });
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(DECISIONS_STORAGE_KEY);
  resetDecisionTools();
  render();
  document.querySelector("#balance").focus();
});

const DECISIONS_STORAGE_KEY = "hypo-advisor:decisions:v1";
const defaultLoans = [
  { balance: 120000, rate: 3.89, months: 264 },
  { balance: 12000, rate: 8.9, months: 60 },
];
let activeDecisionMode = "fixation";

function readDecisionState() {
  try {
    return JSON.parse(localStorage.getItem(DECISIONS_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveDecisionState() {
  const loans = readLoans();
  const state = {
    activeDecisionMode,
    loans,
    consolidation: {
      rate: Number(document.querySelector("#conNewRate").value),
      years: Number(document.querySelector("#conNewYears").value),
      fees: Number(document.querySelector("#conFees").value),
    },
    stress: {
      balance: Number(document.querySelector("#stressBalance").value),
      years: Number(document.querySelector("#stressYears").value),
      rate: Number(document.querySelector("#stressRate").value),
      income: Number(document.querySelector("#stressIncome").value),
    },
  };
  localStorage.setItem(DECISIONS_STORAGE_KEY, JSON.stringify(state));
}

function translateElement(element) {
  element.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    node.textContent = currentLanguage === "en" ? englishCopy[key] : (slovakCopy.get(key) ?? dynamicSlovakCopy[key] ?? node.textContent);
  });
}

function addLoan(loan = { balance: 5000, rate: 7.9, months: 48 }) {
  const fragment = document.querySelector("#loan-row-template").content.cloneNode(true);
  const row = fragment.querySelector(".loan-row");
  row.querySelector(".loan-balance").value = loan.balance;
  row.querySelector(".loan-rate").value = loan.rate;
  row.querySelector(".loan-months").value = loan.months;
  row.querySelector(".remove-loan").addEventListener("click", () => {
    row.remove();
    updateLoanLabels();
    renderConsolidation();
  });
  translateElement(row);
  document.querySelector("#loan-list").append(row);
  updateLoanLabels();
}

function updateLoanLabels() {
  const rows = [...document.querySelectorAll(".loan-row")];
  rows.forEach((row, index) => {
    row.querySelector(".loan-number").textContent = currentLanguage === "sk" ? `Úver ${index + 1}` : `Loan ${index + 1}`;
    const remove = row.querySelector(".remove-loan");
    remove.textContent = currentLanguage === "sk" ? "Odobrať" : "Remove";
    remove.setAttribute("aria-label", currentLanguage === "sk" ? `Odobrať úver ${index + 1}` : `Remove loan ${index + 1}`);
    row.setAttribute("aria-label", currentLanguage === "sk" ? `Úver ${index + 1}` : `Loan ${index + 1}`);
    remove.hidden = rows.length === 1;
  });
}

function readLoans() {
  return [...document.querySelectorAll(".loan-row")].map((row) => ({
    balance: Number(row.querySelector(".loan-balance").value),
    rate: Number(row.querySelector(".loan-rate").value),
    months: Number(row.querySelector(".loan-months").value),
  }));
}

function renderConsolidation() {
  const formElement = document.querySelector("#consolidation-form");
  const error = document.querySelector("#consolidation-error");
  const content = document.querySelector("#consolidation-results");
  const loans = readLoans();
  const newRate = Number(document.querySelector("#conNewRate").value);
  const newMonths = Number(document.querySelector("#conNewYears").value) * 12;
  const fees = Number(document.querySelector("#conFees").value);
  const validLoans = loans.length > 0 && loans.every((loan) => loan.balance >= 100 && loan.rate >= 0 && loan.rate <= 30 && loan.months >= 1);

  if (!formElement.checkValidity() || !validLoans || newRate < 0 || newMonths < 1 || fees < 0) {
    error.textContent = currentLanguage === "sk" ? "Skontrolujte hodnoty pri všetkých úveroch a v ponuke." : "Check the values for every loan and the consolidation offer.";
    error.hidden = false;
    content.hidden = true;
    return;
  }

  error.hidden = true;
  content.hidden = false;
  const separatePayment = loans.reduce((sum, loan) => sum + monthlyPayment(loan.balance, loan.rate, loan.months), 0);
  const separateCost = loans.reduce((sum, loan) => {
    const payment = monthlyPayment(loan.balance, loan.rate, loan.months);
    return sum + payment * loan.months - loan.balance;
  }, 0);
  const principal = loans.reduce((sum, loan) => sum + loan.balance, 0);
  const combinedPayment = monthlyPayment(principal, newRate, newMonths);
  const combinedCost = combinedPayment * newMonths - principal + fees;
  const monthlySaving = separatePayment - combinedPayment;
  const costSaving = separateCost - combinedCost;
  const oldMonths = Math.max(...loans.map((loan) => loan.months));
  const termDifference = newMonths - oldMonths;

  document.querySelector("#conHeadline").textContent = currentLanguage === "sk"
    ? `Mesačná splátka ${monthlySaving >= 0 ? "klesne" : "stúpne"} o ${formatEuro(Math.abs(monthlySaving), 2)}`
    : `Monthly payment ${monthlySaving >= 0 ? "falls" : "rises"} by ${formatEuro(Math.abs(monthlySaving), 2)}`;
  document.querySelector("#conSummary").textContent = currentLanguage === "sk"
    ? `Konsolidácia ${costSaving >= 0 ? "zníži" : "zvýši"} celkové úroky a poplatky o ${formatEuro(Math.abs(costSaving))}. Nižšia splátka sama osebe neznamená lacnejší úver.`
    : `Consolidation ${costSaving >= 0 ? "reduces" : "increases"} total interest and fees by ${formatEuro(Math.abs(costSaving))}. A lower payment does not by itself mean a cheaper loan.`;
  document.querySelector("#conSeparatePayment").textContent = formatEuro(separatePayment, 2);
  document.querySelector("#conSeparateCost").textContent = formatEuro(separateCost);
  document.querySelector("#conCombinedPayment").textContent = formatEuro(combinedPayment, 2);
  document.querySelector("#conCombinedCost").textContent = formatEuro(combinedCost);
  document.querySelector("#conMonthlyDifference").textContent = `${monthlySaving >= 0 ? "−" : "+"}${formatEuro(Math.abs(monthlySaving), 2)}`;
  document.querySelector("#conCostDifference").textContent = `${costSaving >= 0 ? "−" : "+"}${formatEuro(Math.abs(costSaving))}`;
  document.querySelector("#conTermDifference").textContent = currentLanguage === "sk"
    ? `${termDifference > 0 ? "+" : termDifference < 0 ? "−" : ""}${pluralMonths(Math.abs(termDifference))}`
    : `${termDifference > 0 ? "+" : termDifference < 0 ? "−" : ""}${pluralMonths(Math.abs(termDifference))}`;
  saveDecisionState();
}

function renderStressTest() {
  const formElement = document.querySelector("#stress-form");
  const error = document.querySelector("#stress-error");
  const content = document.querySelector("#stress-results");
  const balance = Number(document.querySelector("#stressBalance").value);
  const months = Number(document.querySelector("#stressYears").value) * 12;
  const baseRate = Number(document.querySelector("#stressRate").value);
  const income = Number(document.querySelector("#stressIncome").value);

  if (!formElement.checkValidity() || balance < 1000 || months < 1 || baseRate < 0 || income <= 0) {
    error.textContent = currentLanguage === "sk" ? "Skontrolujte hodnoty hypotéky a príjmu." : "Check the mortgage and income values.";
    error.hidden = false;
    content.hidden = true;
    return;
  }

  error.hidden = true;
  content.hidden = false;
  const scenarios = [0, 1, 2, 3].map((increase) => {
    const rate = baseRate + increase;
    const payment = monthlyPayment(balance, rate, months);
    return { increase, rate, payment, share: payment / income * 100 };
  });
  const basePayment = scenarios[0].payment;
  document.querySelector("#stressRows").innerHTML = scenarios.map((scenario, index) => `
    <div class="stress-row${index === 0 ? " is-base" : ""}" role="row">
      <span role="cell">${formatPercent(scenario.rate)} %${index === 0 ? `<small>${currentLanguage === "sk" ? "východisková" : "starting"}</small>` : ""}</span>
      <strong role="cell">${formatEuro(scenario.payment, 2)}</strong>
      <span role="cell">${index === 0 ? "—" : `+${formatEuro(scenario.payment - basePayment, 2)}`}</span>
      <strong role="cell">${new Intl.NumberFormat(numberLocale(), { maximumFractionDigits: 1 }).format(scenario.share)} %</strong>
    </div>`).join("");
  const highest = scenarios.at(-1);
  document.querySelector("#stressHeadline").textContent = currentLanguage === "sk"
    ? `Splátka stúpne o ${formatEuro(highest.payment - basePayment, 2)}`
    : `Payment rises by ${formatEuro(highest.payment - basePayment, 2)}`;
  document.querySelector("#stressSummary").textContent = currentLanguage === "sk"
    ? `Pri sadzbe ${formatPercent(highest.rate)} % by splátka tvorila ${new Intl.NumberFormat(numberLocale(), { maximumFractionDigits: 1 }).format(highest.share)} % zadaného čistého príjmu.`
    : `At ${formatPercent(highest.rate)}%, the payment would use ${new Intl.NumberFormat(numberLocale(), { maximumFractionDigits: 1 }).format(highest.share)}% of the entered net income.`;
  saveDecisionState();
}

function setDecisionMode(mode, shouldFocus = true) {
  activeDecisionMode = mode;
  document.querySelectorAll("[data-mode]").forEach((button) => {
    const selected = button.dataset.mode === mode;
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  document.querySelectorAll("[data-panel]").forEach((panel) => { panel.hidden = panel.dataset.panel !== mode; });
  const copy = {
    sk: {
      fixation: ["Rozhodovanie pred koncom fixácie", "Refixovať skôr alebo počkať?", "Porovnajte si obe možnosti na rovnakom časovom horizonte. Bez registrácie a bez odporúčania, ktoré by skrývalo predpoklady."],
      consolidation: ["Viac úverov, jedno rozhodnutie", "Spojiť úvery do jednej hypotéky?", "Porovnajte súčet dnešných splátok a úrokov s jednou konsolidačnou ponukou. Nižšia splátka nemusí znamenať nižšie náklady."],
      stress: ["Rezerva pre horší vývoj", "Čo spraví vyššia sadzba so splátkou?", "Pozrite si štyri sadzobné scenáre pri rovnakom dlhu a splatnosti. Nejde o predpoveď, ale o skúšku odolnosti rozpočtu."],
    },
    en: {
      fixation: ["Decision before the fixed-rate period ends", "Refix earlier or wait?", "Compare both options over the same time horizon. No registration and no recommendation that hides its assumptions."],
      consolidation: ["Several loans, one decision", "Combine loans into one mortgage?", "Compare today's total payments and interest with one consolidation offer. A lower payment may not mean a lower total cost."],
      stress: ["A buffer for a worse outcome", "What would a higher rate do to your payment?", "See four rate scenarios for the same debt and term. This is not a forecast, but a resilience check for the household budget."],
    },
  }[currentLanguage][mode];
  document.querySelector(".context-label").textContent = copy[0];
  document.querySelector("#page-title").textContent = copy[1];
  document.querySelector(".intro > p:last-child").textContent = copy[2];
  if (shouldFocus) {
    document.querySelector(`#tab-${mode}`).focus();
    document.querySelector("#top").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  saveDecisionState();
}

function resetDecisionTools() {
  document.querySelector("#loan-list").replaceChildren();
  defaultLoans.forEach(addLoan);
  document.querySelector("#conNewRate").value = 4.1;
  document.querySelector("#conNewYears").value = 22;
  document.querySelector("#conFees").value = 300;
  document.querySelector("#stressBalance").value = 120000;
  document.querySelector("#stressYears").value = 22;
  document.querySelector("#stressRate").value = 3.89;
  document.querySelector("#stressIncome").value = 2400;
  setDecisionMode("fixation", false);
  renderConsolidation();
  renderStressTest();
}

function initializeDecisionTools() {
  const state = readDecisionState();
  (state.loans?.length ? state.loans : defaultLoans).forEach(addLoan);
  if (state.consolidation) {
    document.querySelector("#conNewRate").value = state.consolidation.rate;
    document.querySelector("#conNewYears").value = state.consolidation.years;
    document.querySelector("#conFees").value = state.consolidation.fees;
  }
  if (state.stress) {
    document.querySelector("#stressBalance").value = state.stress.balance;
    document.querySelector("#stressYears").value = state.stress.years;
    document.querySelector("#stressRate").value = state.stress.rate;
    document.querySelector("#stressIncome").value = state.stress.income;
  }
  document.querySelector("#add-loan").addEventListener("click", () => {
    addLoan();
    renderConsolidation();
    document.querySelector(".loan-row:last-child .loan-balance").focus();
  });
  document.querySelector("#consolidation-form").addEventListener("input", renderConsolidation);
  document.querySelector("#stress-form").addEventListener("input", renderStressTest);
  document.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => setDecisionMode(button.dataset.mode)));
  document.querySelector("[role='tablist']").addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    const tabs = [...document.querySelectorAll("[data-mode]")];
    const currentIndex = tabs.findIndex((tab) => tab.dataset.mode === activeDecisionMode);
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const next = tabs[(currentIndex + direction + tabs.length) % tabs.length];
    event.preventDefault();
    setDecisionMode(next.dataset.mode);
  });
  activeDecisionMode = ["fixation", "consolidation", "stress"].includes(state.activeDecisionMode) ? state.activeDecisionMode : "fixation";
  updateLoanLabels();
  renderConsolidation();
  renderStressTest();
  setDecisionMode(activeDecisionMode, false);
}

load();
applyLanguage();
render();
initializeDecisionTools();
