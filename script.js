// ─── Parameters ─────────────────────────────────────────────────────────────

// Launch anchor: Dec 7 2022 at UTC
const LAUNCH_MS = new Date('2022-12-07T00:00:00Z').getTime();

// Direct water use & electricity consumption per day
const DIRECT_WATER_L_PER_DAY = 148.28e6;   // liters/day
const ELEC_KWH_PER_DAY       = 39.98e6;    // kWh/day

// Water Usage Effectiveness (L water per kWh)
const WUE_L_PER_KWH = 1.8;

// Derived daily totals
const ELEC_WATER_L_PER_DAY = ELEC_KWH_PER_DAY * WUE_L_PER_KWH;
const TOTAL_WATER_L_PER_DAY = DIRECT_WATER_L_PER_DAY + ELEC_WATER_L_PER_DAY;

// Rates in units per second
const WATER_RATE_LPS = TOTAL_WATER_L_PER_DAY / 86400;        // ~2550 L/s
const ELEC_RATE_KWHPS = ELEC_KWH_PER_DAY / 86400;            // ~463 kWh/s

// DOM references
const waterEl = document.getElementById('water-counter');
const elecEl  = document.getElementById('elec-counter');

// ─── Calculator & Animation ────────────────────────────────────────────────

function getElapsedSeconds() {
  return (Date.now() - LAUNCH_MS) / 1000;
}

function getWaterLiters() {
  return WATER_RATE_LPS * getElapsedSeconds();
}

function getElectricityKwh() {
  return ELEC_RATE_KWHPS * getElapsedSeconds();
}

function animate() {
  const w = Math.round(getWaterLiters()).toLocaleString();
  const e = getElectricityKwh().toLocaleString(undefined, {
    maximumFractionDigits: 1
  });

  waterEl.innerText = w;
  elecEl.innerText  = e;

  requestAnimationFrame(animate);
}

animate();
