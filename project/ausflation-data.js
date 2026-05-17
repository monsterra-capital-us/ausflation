// Ausflation — mock data
// Aligned to actual ABS CPI (latest release: monthly CPI for March 2026,
// published 30 Apr 2026 — 4.6% YoY headline) and the real RBA cash-rate
// path (source: rba.gov.au statistics/cash-rate). Ausflation itself is a
// hypothetical daily benchmark and reads slightly above ABS in recent months
// as it catches the fuel-price shock from the Middle East conflict faster.

// ─────────────────────── Headline ───────────────────────
window.AUSFLATION_HEADLINE = {
  rate: 4.85,              // YoY % — Ausflation daily reading (May 2026)
  rateYesterday: 4.81,
  rate7dAgo: 4.72,
  indexLevel: 115.18,
  indexBase: 100.00,         // base = May 2024
  abs: {
    period: "Mar 2026",      // ABS is now a complete monthly series
    rate: 4.60,
    releaseDate: "30 Apr 2026",
    nextRelease: "28 May 2026",
  },
  rba: {
    cashRate: 4.35,
    target: [2.0, 3.0],
  },
  pricesTracked: 1_412_338,
  sourcesActive: 12,
  identifier: "MNS-260517-K7H3",
  lastUpdated: "17 May 2026 · 09:14 AEST",
  asOf: "May 2026",
};

// ─────────────────────── Time series ───────────────────────
// 36 monthly readings, Jun 2023 → May 2026.
// ABS series uses real quarterly CPI prints (Q2'23–2.1% Q2'25, 3.0% Q3'25)
// stair-stepped between quarters, then real monthly prints from Oct 2025
// onward (the ABS transitioned to complete-monthly CPI on 26 Nov 2025).
// Latest ABS: Mar 2026 = 4.6% YoY (fuel shock + electricity-rebate expiry).
window.AUSFLATION_SERIES = (() => {
  const labels = [];
  const ausflation = [];
  const abs = [];
  const base = new Date(2023, 5, 1);
  for (let i = 0; i < 36; i++) {
    const d = new Date(base.getFullYear(), base.getMonth() + i, 1);
    labels.push(d);
  }

  // Ausflation — hypothetical daily benchmark, anchored to real ABS prints.
  // Tracks ABS closely with small noise; from Mar 2026 reads ~0.25pp higher
  // as the daily series picks up fuel/electricity faster.
  const aus = [
    // Jun23..Dec23 (7) — ABS Q2'23 6.0, Q3'23 5.4, Q4'23 4.1
    6.02, 5.78, 5.51, 5.42, 5.05, 4.61, 4.12,
    // 2024 (12) — ABS Q1'24 3.6, Q2'24 3.8, Q3'24 2.8, Q4'24 2.4
    4.02, 3.78, 3.61, 3.65, 3.78, 3.81, 3.55, 3.12, 2.83, 2.71, 2.55, 2.41,
    // 2025 (12) — ABS Q1'25 2.4, Q2'25 2.1, Q3'25 3.0; then real monthly:
    //   Oct'25 ~3.0, Nov'25 ~3.5, Dec'25 3.8
    2.42, 2.38, 2.41, 2.22, 2.18, 2.12, 2.32, 2.55, 3.02, 3.05, 3.52, 3.82,
    // 2026 Jan..May (5) — ABS Jan 3.8, Feb 3.7, Mar 4.6; Ausflation leads slightly
    3.85, 3.78, 4.62, 4.78, 4.85,
  ];

  // ABS monthly indicator / complete-monthly CPI (real prints).
  // Pre-Apr-2024 the monthly indicator was less complete; we stair-step from
  // the quarterly headline so the visual matches what ABS actually published.
  const absByMonth = {
    // Q2'23 = 6.0 → Q3'23 = 5.4 → Q4'23 = 4.1
    "2023-06": 6.0, "2023-07": 6.0, "2023-08": 6.0,
    "2023-09": 5.4, "2023-10": 5.4, "2023-11": 5.4,
    "2023-12": 4.1,
    // Q1'24 = 3.6 → Q2'24 = 3.8 → Q3'24 = 2.8 → Q4'24 = 2.4
    "2024-01": 4.1, "2024-02": 4.1, "2024-03": 3.6,
    "2024-04": 3.6, "2024-05": 3.6, "2024-06": 3.8,
    "2024-07": 3.8, "2024-08": 3.8, "2024-09": 2.8,
    "2024-10": 2.8, "2024-11": 2.8, "2024-12": 2.4,
    // Q1'25 = 2.4 → Q2'25 = 2.1 → Q3'25 = 3.0
    "2025-01": 2.4, "2025-02": 2.4, "2025-03": 2.4,
    "2025-04": 2.4, "2025-05": 2.4, "2025-06": 2.1,
    "2025-07": 2.1, "2025-08": 2.1, "2025-09": 3.0,
    // Complete monthly CPI begins (real prints, ref month Oct 2025+):
    "2025-10": 3.0, "2025-11": 3.5, "2025-12": 3.8,
    "2026-01": 3.8, "2026-02": 3.7, "2026-03": 4.6,
    // Apr/May 2026 not yet released as of 17 May 2026 — hold last print.
    "2026-04": 4.6, "2026-05": 4.6,
  };

  // RBA cash rate — actual policy path (source: rba.gov.au statistics/cash-rate).
  //   Jun 23: 4.10  →  Nov 23: 4.35 (held thru Jan 25)
  //   Feb 25: 4.10  →  May 25: 3.85  →  Aug 25: 3.60 (held thru Jan 26)
  //   Feb 26: 3.85  →  Mar 26: 4.10  →  6 May 26: 4.35 (current)
  const cashByMonth = {
    "2023-06": 4.10, "2023-07": 4.10, "2023-08": 4.10, "2023-09": 4.10, "2023-10": 4.10,
    "2023-11": 4.35, "2023-12": 4.35,
    "2024-01": 4.35, "2024-02": 4.35, "2024-03": 4.35, "2024-04": 4.35, "2024-05": 4.35,
    "2024-06": 4.35, "2024-07": 4.35, "2024-08": 4.35, "2024-09": 4.35, "2024-10": 4.35,
    "2024-11": 4.35, "2024-12": 4.35,
    "2025-01": 4.35,
    "2025-02": 4.10, "2025-03": 4.10, "2025-04": 4.10,
    "2025-05": 3.85, "2025-06": 3.85, "2025-07": 3.85,
    "2025-08": 3.60, "2025-09": 3.60, "2025-10": 3.60, "2025-11": 3.60, "2025-12": 3.60,
    "2026-01": 3.60,
    "2026-02": 3.85,
    "2026-03": 4.10, "2026-04": 4.10,
    "2026-05": 4.35,
  };

  const cashRate = [];
  labels.forEach((d, i) => {
    ausflation.push(aus[i]);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    abs.push(absByMonth[k]);
    cashRate.push(cashByMonth[k]);
  });
  return { labels, ausflation, abs, cashRate };
})();

// ─────────────────────── Categories — 11 ABS groups ───────────────────────
// ABS rates anchored to actual ABS CPI March 2026 release (annual % changes):
//   Food 3.1, Alc & tobacco 4.4, Clothing 7.1, Housing 6.5, Furnishings 1.4,
//   Health 3.0, Transport 8.9, Comms 1.4, Recreation 2.8, Education 4.8,
//   Insurance & fin 2.8.
// Weights are real ABS 17-series basket (2025 weight update, rounded).
// Ausflation rates are hypothetical and read close-to-slightly-above ABS
// because the daily benchmark catches the fuel + electricity shock faster.
window.AUSFLATION_CATEGORIES = [
  {
    id: "food", name: "Food & non-alcoholic beverages",
    weight: 17.0, rate: 3.24, abs: 3.10, delta30d: +0.12,
    top: { item: "Fresh produce", change: 5.8 },
    series: [3.10,3.08,3.05,3.08,3.10,3.12,3.14,3.16,3.18,3.20,3.22,3.23,3.24],
    sources: ["Coles", "Woolworths"],
  },
  {
    id: "alcohol", name: "Alcohol & tobacco",
    weight: 7.4, rate: 4.62, abs: 4.40, delta30d: +0.08,
    top: { item: "Tobacco (excise indexation)", change: 9.4 },
    series: [4.30,4.35,4.40,4.42,4.45,4.48,4.51,4.54,4.56,4.58,4.60,4.61,4.62],
    sources: ["Dan Murphy's", "BWS"],
  },
  {
    id: "clothing", name: "Clothing & footwear",
    weight: 3.2, rate: 7.32, abs: 7.10, delta30d: +0.45,
    top: { item: "Women's outerwear", change: 8.6 },
    series: [4.90,5.10,5.30,5.60,5.95,6.30,6.55,6.78,6.95,7.10,7.20,7.28,7.32],
    sources: ["Kmart", "Target"],
  },
  {
    id: "housing", name: "Housing",
    weight: 21.7, rate: 6.84, abs: 6.50, delta30d: +0.32,
    top: { item: "Electricity (rebate expiry)", change: 25.4 },
    series: [5.55,5.80,6.10,6.30,6.45,6.55,6.62,6.68,6.72,6.76,6.79,6.82,6.84],
    sources: ["Domain", "realestate.com.au", "AEMO"],
  },
  {
    id: "furniture", name: "Furnishings & household equip.",
    weight: 9.0, rate: 1.52, abs: 1.40, delta30d: +0.04,
    top: { item: "Whitegoods", change: 2.6 },
    series: [1.40,1.42,1.43,1.44,1.45,1.46,1.47,1.48,1.49,1.50,1.51,1.51,1.52],
    sources: ["Bunnings", "Kmart", "Target"],
  },
  {
    id: "health", name: "Health",
    weight: 6.6, rate: 3.18, abs: 3.00, delta30d: +0.06,
    top: { item: "Private health premiums", change: 4.4 },
    series: [3.00,3.02,3.04,3.06,3.08,3.10,3.12,3.14,3.15,3.16,3.17,3.18,3.18],
    sources: ["PBS list", "PHIO"],
  },
  {
    id: "transport", name: "Transport",
    weight: 10.7, rate: 9.42, abs: 8.90, delta30d: +1.24,
    top: { item: "Automotive fuel (ULP 91)", change: 24.2 },
    series: [1.10,0.85,-0.20,1.20,2.80,4.50,6.10,7.20,7.95,8.50,8.92,9.20,9.42],
    sources: ["FuelCheck NSW", "7-Eleven Fuel"],
  },
  {
    id: "comms", name: "Communication",
    weight: 2.4, rate: 1.52, abs: 1.40, delta30d: +0.04,
    top: { item: "Mobile plans", change: 2.1 },
    series: [0.80,0.90,1.00,1.10,1.18,1.25,1.32,1.38,1.42,1.46,1.48,1.50,1.52],
    sources: ["Telstra", "Optus", "TPG"],
  },
  {
    id: "recreation", name: "Recreation & culture",
    weight: 8.6, rate: 2.94, abs: 2.80, delta30d: +0.08,
    top: { item: "Domestic holiday travel", change: 4.8 },
    series: [3.60,3.50,3.42,3.30,3.20,3.12,3.05,3.00,2.96,2.94,2.94,2.94,2.94],
    sources: ["Webjet", "Wotif"],
  },
  {
    id: "education", name: "Education",
    weight: 4.2, rate: 4.92, abs: 4.80, delta30d: +0.02,
    top: { item: "Tertiary fees (CPI-linked)", change: 5.6 },
    series: [5.40,5.34,5.28,5.22,5.16,5.10,5.05,5.00,4.97,4.94,4.93,4.92,4.92],
    sources: ["Uni fee schedules"],
  },
  {
    id: "insurance", name: "Insurance & financial",
    weight: 8.2, rate: 2.91, abs: 2.80, delta30d: +0.06,
    top: { item: "Home & contents insurance", change: 8.2 },
    series: [2.40,2.45,2.50,2.55,2.62,2.70,2.76,2.82,2.86,2.88,2.90,2.91,2.91],
    sources: ["IAG", "Suncorp", "QBE"],
  },
];

// ─────────────────────── Data sources ───────────────────────
window.AUSFLATION_SOURCES = [
  { id: "coles",       name: "Coles",                 kind: "Grocery retailer",    items: 18_412, sync: "09:08 AEST", lag: "6m",  status: "ok",  region: "National" },
  { id: "woolies",     name: "Woolworths",            kind: "Grocery retailer",    items: 19_204, sync: "09:11 AEST", lag: "3m",  status: "ok",  region: "National" },
  { id: "domain",      name: "Domain",                kind: "Rental listings",     items: 142_891, sync: "08:42 AEST", lag: "32m", status: "ok",  region: "National" },
  { id: "rea",         name: "realestate.com.au",     kind: "Rental + dwelling",   items: 218_044, sync: "08:55 AEST", lag: "19m", status: "ok",  region: "National" },
  { id: "aemo",        name: "AEMO",                  kind: "Electricity NEM",     items: 5_184,   sync: "09:13 AEST", lag: "1m",  status: "ok",  region: "5-state NEM" },
  { id: "fuelcheck",   name: "FuelCheck NSW",         kind: "Petrol — retail",     items: 2_148,   sync: "09:14 AEST", lag: "<1m", status: "live", region: "NSW" },
  { id: "seven",       name: "7-Eleven Fuel",         kind: "Petrol — retail",     items: 711,     sync: "09:09 AEST", lag: "5m",  status: "ok",  region: "National" },
  { id: "bunnings",    name: "Bunnings",              kind: "Hardware + household",items: 31_550,  sync: "08:30 AEST", lag: "44m", status: "ok",  region: "National" },
  { id: "kmart",       name: "Kmart",                 kind: "General merch.",      items: 14_220,  sync: "08:15 AEST", lag: "59m", status: "ok",  region: "National" },
  { id: "target",      name: "Target",                kind: "General merch.",      items: 12_086,  sync: "08:18 AEST", lag: "56m", status: "ok",  region: "National" },
  { id: "auspost",     name: "Australia Post",        kind: "Parcel + postage",    items: 184,     sync: "Daily 06:00", lag: "3h", status: "ok",  region: "National" },
  { id: "corelogic",   name: "CoreLogic",             kind: "Dwelling values",     items: 9_877_220, sync: "Daily 07:00", lag: "2h", status: "ok", region: "National" },
];

// ─────────────────────── Methodology bullets ───────────────────────
window.AUSFLATION_METHOD = [
  {
    eyebrow: "Coverage",
    head: "11 ABS groups, 1.4M prices.",
    body: "Each ABS CPI expenditure class is mapped to one or more live Australian price feeds. Weights are pegged to the ABS 17-series basket (2025 weight update) and re-anchored quarterly.",
  },
  {
    eyebrow: "Frequency",
    head: "Daily index, hourly inputs.",
    body: "Grocery, fuel and electricity inputs refresh hourly. Rents refresh nightly. The composite index is published at 09:00 AEST each business day with a full audit trail.",
  },
  {
    eyebrow: "Independence",
    head: "Not a government series.",
    body: "Ausflation is produced by MonsterraCapital research as a private benchmark. It is not endorsed by the ABS, the RBA, or any government body. We do not accept feeds from rated parties.",
  },
];
