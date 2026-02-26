// ============================================================
// Reverse Birth Chart — Find birth dates by zodiac placements
// ============================================================
import SwissEPH from 'sweph-wasm';

// ============================================================
// Constants
// ============================================================
const PLANETS = [
  { id: 0,  name: 'Sun',     symbol: '\u2609', required: true },
  { id: 1,  name: 'Moon',    symbol: '\u263D', required: true },
  { id: 2,  name: 'Mercury', symbol: '\u263F', required: false },
  { id: 3,  name: 'Venus',   symbol: '\u2640', required: false },
  { id: 4,  name: 'Mars',    symbol: '\u2642', required: false },
  { id: 5,  name: 'Jupiter', symbol: '\u2643', required: false },
  { id: 6,  name: 'Saturn',  symbol: '\u2644', required: false },
  { id: 7,  name: 'Uranus',  symbol: '\u26E2', required: false },
  { id: 8,  name: 'Neptune', symbol: '\u2646', required: false },
  { id: 9,  name: 'Pluto',   symbol: '\u2647', required: false },
];

const SIGNS = [
  { name: 'Aries',       symbol: '\u2648', element: 'fire' },
  { name: 'Taurus',      symbol: '\u2649', element: 'earth' },
  { name: 'Gemini',      symbol: '\u264A', element: 'air' },
  { name: 'Cancer',      symbol: '\u264B', element: 'water' },
  { name: 'Leo',         symbol: '\u264C', element: 'fire' },
  { name: 'Virgo',       symbol: '\u264D', element: 'earth' },
  { name: 'Libra',       symbol: '\u264E', element: 'air' },
  { name: 'Scorpio',     symbol: '\u264F', element: 'water' },
  { name: 'Sagittarius', symbol: '\u2650', element: 'fire' },
  { name: 'Capricorn',   symbol: '\u2651', element: 'earth' },
  { name: 'Aquarius',    symbol: '\u2652', element: 'air' },
  { name: 'Pisces',      symbol: '\u2653', element: 'water' },
];

// Swiss Ephemeris flags
const SEFLG_MOSEPH = 4;
const SEFLG_SPEED = 256;
const SE_GREG_CAL = 1;
const CALC_FLAGS = SEFLG_MOSEPH | SEFLG_SPEED;

// Scan interval: 6 hours = 0.25 Julian days
const SCAN_INTERVAL = 0.25;
const MAX_YEARS = 10;
const MAX_DISPLAY = 200;

// ============================================================
// State
// ============================================================
let swe = null;
let isSearching = false;

// ============================================================
// DOM helpers
// ============================================================
const $ = (id) => document.getElementById(id);

// ============================================================
// Initialize WASM
// ============================================================
async function initWasm() {
  const statusEl = $('wasmStatus');
  const formEl = $('mainForm');

  try {
    swe = await SwissEPH.init();
    try { await swe.swe_set_ephe_path(); } catch (e) { /* OK for Moshier */ }

    statusEl.style.display = 'none';
    formEl.style.display = 'block';
    buildPlanetGrid();
    applyUrlParams();
    $('searchBtn').addEventListener('click', startSearch);
  } catch (err) {
    console.error('WASM load error:', err);
    statusEl.innerHTML = `
      <span class="error">\u26A0 Failed to load the calculation engine.</span><br><br>
      <span style="font-size:0.78rem;">
        Your browser may not support WebAssembly.<br>
        Please try the latest version of Chrome, Firefox, Safari, or Edge.<br><br>
        Technical details: ${err.message}
      </span>
    `;
    statusEl.classList.add('error');
  }
}

// ============================================================
// Build UI
// ============================================================
function buildPlanetGrid() {
  const grid = $('planetGrid');
  grid.innerHTML = '';

  for (const planet of PLANETS) {
    const row = document.createElement('div');
    row.className = `planet-row${planet.required ? ' required' : ''}`;
    row.dataset.planetId = planet.id;

    // Planet name
    const nameDiv = document.createElement('div');
    nameDiv.className = 'planet-name';
    nameDiv.innerHTML = `<span class="planet-symbol">${planet.symbol}</span>${planet.name}`;

    // Sign select
    const select = document.createElement('select');
    select.id = `sign-${planet.id}`;
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = planet.required ? '— Select —' : '— Any —';
    select.appendChild(defaultOpt);

    for (let i = 0; i < SIGNS.length; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${SIGNS[i].symbol} ${SIGNS[i].name}`;
      select.appendChild(opt);
    }

    // Priority toggle
    const priorityDiv = document.createElement('div');
    priorityDiv.className = 'priority-toggle';

    const btnRequired = document.createElement('button');
    btnRequired.className = 'priority-btn active';
    btnRequired.textContent = 'Required';
    btnRequired.dataset.priority = 'required';
    btnRequired.type = 'button';
    btnRequired.addEventListener('click', () => setPriority(planet.id, 'required'));

    const btnOptional = document.createElement('button');
    btnOptional.className = 'priority-btn';
    btnOptional.textContent = 'Preferred';
    btnOptional.dataset.priority = 'optional';
    btnOptional.type = 'button';
    btnOptional.addEventListener('click', () => setPriority(planet.id, 'optional'));

    priorityDiv.appendChild(btnRequired);
    priorityDiv.appendChild(btnOptional);

    row.appendChild(nameDiv);
    row.appendChild(select);
    row.appendChild(priorityDiv);
    grid.appendChild(row);
  }
}

function setPriority(planetId, priority) {
  const row = document.querySelector(`.planet-row[data-planet-id="${planetId}"]`);
  row.querySelectorAll('.priority-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.priority === priority);
  });
}

function getPriority(planetId) {
  const row = document.querySelector(`.planet-row[data-planet-id="${planetId}"]`);
  const activeBtn = row.querySelector('.priority-btn.active');
  return activeBtn ? activeBtn.dataset.priority : 'required';
}

// ============================================================
// Apply URL parameters (from guide.html)
// ============================================================
const URL_PARAM_MAP = {
  sun: 0, moon: 1, mercury: 2, venus: 3, mars: 4,
  jupiter: 5, saturn: 6, uranus: 7, neptune: 8, pluto: 9,
};

function applyUrlParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.size === 0) return;

  let applied = false;
  for (const [key, planetId] of Object.entries(URL_PARAM_MAP)) {
    const signValue = params.get(key);
    if (signValue !== null) {
      const select = $(`sign-${planetId}`);
      if (select) {
        select.value = signValue;
        applied = true;
      }
    }

    // Priority
    const priorityValue = params.get(`p_${key}`);
    if (priorityValue === 'required' || priorityValue === 'optional') {
      setPriority(planetId, priorityValue);
    }
  }

  // Clear URL params after applying (clean URL)
  if (applied) {
    window.history.replaceState({}, '', window.location.pathname);
  }
}

// ============================================================
// Gather criteria from UI
// ============================================================
function getCriteria() {
  const criteria = [];
  for (const planet of PLANETS) {
    const select = $(`sign-${planet.id}`);
    if (select.value !== '') {
      const si = parseInt(select.value);
      criteria.push({
        planetId: planet.id,
        planetName: planet.name,
        planetSymbol: planet.symbol,
        signIndex: si,
        signName: SIGNS[si].name,
        signSymbol: SIGNS[si].symbol,
        priority: getPriority(planet.id),
      });
    }
  }
  return criteria;
}

// ============================================================
// Validation
// ============================================================
function validate() {
  const criteria = getCriteria();

  if (!criteria.some((c) => c.planetId === 0) || !criteria.some((c) => c.planetId === 1)) {
    alert('Sun and Moon signs are required.');
    return null;
  }

  const yearStart = parseInt($('yearStart').value);
  const yearEnd = parseInt($('yearEnd').value);

  if (isNaN(yearStart) || isNaN(yearEnd)) {
    alert('Please enter valid years.');
    return null;
  }
  if (yearEnd < yearStart) {
    alert('End year must be equal to or later than start year.');
    return null;
  }
  if (yearEnd - yearStart >= MAX_YEARS) {
    alert(`Year range is limited to ${MAX_YEARS} years.\nPlease narrow the range or search in multiple passes.`);
    return null;
  }

  return { criteria, yearStart, yearEnd };
}

// ============================================================
// Ephemeris helpers
// ============================================================
function toJD(year, month, day, hour) {
  return swe.swe_julday(year, month, day, hour, SE_GREG_CAL);
}

function fromJD(jd) {
  return swe.swe_revjul(jd, SE_GREG_CAL);
}

function getSignIndex(longitude) {
  let lon = longitude % 360;
  if (lon < 0) lon += 360;
  return Math.floor(lon / 30);
}

function getDegreeInSign(longitude) {
  let lon = longitude % 360;
  if (lon < 0) lon += 360;
  return lon % 30;
}

function calcPositions(jd) {
  const positions = {};
  for (const planet of PLANETS) {
    try {
      const result = swe.swe_calc_ut(jd, planet.id, CALC_FLAGS);
      const lon = result[0];
      positions[planet.id] = {
        longitude: lon,
        signIndex: getSignIndex(lon),
        degree: getDegreeInSign(lon),
        speed: result[3],
      };
    } catch (e) {
      positions[planet.id] = null;
    }
  }
  return positions;
}

// ============================================================
// Main search
// ============================================================
async function doSearch(params) {
  const { criteria, yearStart, yearEnd } = params;
  const progressBar = $('progressBar');
  const progressText = $('progressText');
  $('progressArea').classList.add('active');

  const startJD = toJD(yearStart, 1, 1, 0);
  const endJD = toJD(yearEnd + 1, 1, 1, 0);
  const totalSteps = Math.ceil((endJD - startJD) / SCAN_INTERVAL);

  const requiredCriteria = criteria.filter((c) => c.priority === 'required');
  const totalCriteria = criteria.length;
  const rawResults = [];

  let step = 0;
  let lastUpdate = 0;

  for (let jd = startJD; jd <= endJD; jd += SCAN_INTERVAL) {
    step++;

    // Throttle DOM updates
    const now = performance.now();
    if (now - lastUpdate > 100) {
      const pct = Math.min(100, (step / totalSteps) * 100);
      progressBar.style.width = pct + '%';
      const dt = fromJD(jd);
      const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      progressText.textContent = `Searching ${monthNames[dt.month]} ${dt.year}... (${Math.round(pct)}%)`;
      lastUpdate = now;
      await new Promise((r) => setTimeout(r, 0)); // yield
    }

    if (!isSearching) break;

    const positions = calcPositions(jd);

    // Check required criteria first (early exit)
    let requiredMet = true;
    for (const c of requiredCriteria) {
      const pos = positions[c.planetId];
      if (!pos || pos.signIndex !== c.signIndex) {
        requiredMet = false;
        break;
      }
    }
    if (!requiredMet) continue;

    // Count total matches
    let matchCount = 0;
    for (const c of criteria) {
      const pos = positions[c.planetId];
      if (pos && pos.signIndex === c.signIndex) matchCount++;
    }

    if (matchCount > 0) {
      rawResults.push({ jd, positions, matchCount });
    }
  }

  progressBar.style.width = '100%';
  progressText.textContent = 'Search complete. Organizing results...';
  await new Promise((r) => setTimeout(r, 50));

  // Deduplicate: keep best match per calendar day
  const dayMap = new Map();
  for (const r of rawResults) {
    const dt = fromJD(r.jd);
    const key = `${dt.year}-${dt.month}-${dt.day}`;
    const existing = dayMap.get(key);
    if (!existing || r.matchCount > existing.matchCount) {
      dayMap.set(key, { ...r, date: dt });
    }
  }

  // Sort: match count desc, then date asc
  const results = Array.from(dayMap.values()).sort((a, b) => {
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
    return a.jd - b.jd;
  });

  return { results: results.slice(0, MAX_DISPLAY), totalFound: results.length, totalCriteria };
}

// ============================================================
// Moon time hint
// ============================================================
function getMoonTimeHint(jd, targetSignIndex) {
  const dt = fromJD(jd);
  const dayStartJD = toJD(dt.year, dt.month, dt.day, 0);
  const periods = [];
  const labels = ['early morning', 'early morning', 'morning', 'morning', 'afternoon', 'afternoon', 'evening', 'evening'];

  for (let h = 0; h < 24; h += 3) {
    try {
      const result = swe.swe_calc_ut(dayStartJD + h / 24, 1, CALC_FLAGS);
      if (getSignIndex(result[0]) === targetSignIndex) {
        periods.push(labels[h / 3]);
      }
    } catch (e) { /* skip */ }
  }

  if (periods.length === 0 || periods.length >= 8) return null;

  const moonCriterion = getCriteria().find((c) => c.planetId === 1);
  if (!moonCriterion) return null;

  const unique = [...new Set(periods)];
  return `Moon is in ${moonCriterion.signName} during the ${unique.join(' to ')}`;
}

// ============================================================
// Display results
// ============================================================
function displayResults({ results, totalFound, totalCriteria }) {
  const area = $('resultsArea');
  const summary = $('resultsSummary');
  const list = $('resultsList');
  const criteria = getCriteria();

  area.classList.add('active');

  if (results.length === 0) {
    summary.textContent = 'No matching dates found.';
    list.innerHTML = `
      <div class="no-results">
        Try relaxing your criteria or changing the year range.<br>
        If you specified outer planets (Uranus through Pluto),<br>
        target a year range when those planets are in the desired sign.
      </div>`;
    return;
  }

  summary.textContent =
    `${totalFound} candidate date${totalFound !== 1 ? 's' : ''} found` +
    (totalFound > results.length ? ` (showing top ${results.length})` : '') +
    `. Sorted by match count.`;

  list.innerHTML = '';

  for (const r of results) {
    const card = document.createElement('div');
    card.className = 'result-card';

    // Match level
    let matchClass = 'match-low';
    if (r.matchCount === totalCriteria) matchClass = 'match-full';
    else if (r.matchCount >= totalCriteria * 0.8) matchClass = 'match-high';
    else if (r.matchCount >= totalCriteria * 0.5) matchClass = 'match-mid';

    const matchedSymbols = criteria
      .filter((c) => r.positions[c.planetId]?.signIndex === c.signIndex)
      .map((c) => c.planetSymbol)
      .join('');

    // Header
    const header = document.createElement('div');
    header.className = 'result-header';

    const dateEl = document.createElement('div');
    dateEl.className = 'result-date';
    dateEl.textContent = formatDate(r.date);

    const matchEl = document.createElement('div');
    matchEl.className = `result-match ${matchClass}`;
    matchEl.textContent = `${r.matchCount}/${totalCriteria} ${matchedSymbols}`;

    header.appendChild(dateEl);
    header.appendChild(matchEl);

    // Planet positions
    const planetsDiv = document.createElement('div');
    planetsDiv.className = 'result-planets';

    for (const planet of PLANETS) {
      const pos = r.positions[planet.id];
      if (!pos) continue;

      const criterion = criteria.find((c) => c.planetId === planet.id);
      const isMatched = criterion && pos.signIndex === criterion.signIndex;
      const isSpecified = !!criterion;

      const span = document.createElement('span');
      span.className = `result-planet${isMatched ? ' matched' : isSpecified ? ' unmatched' : ''}`;
      const deg = Math.floor(pos.degree);
      span.textContent = `${planet.symbol}${SIGNS[pos.signIndex].symbol}${deg}\u00B0`;
      span.title = `${planet.name}: ${SIGNS[pos.signIndex].name} ${deg}\u00B0`;
      planetsDiv.appendChild(span);
    }

    card.appendChild(header);
    card.appendChild(planetsDiv);

    // Moon time hint
    const moonCriterion = criteria.find((c) => c.planetId === 1);
    if (moonCriterion) {
      const hint = getMoonTimeHint(r.jd, moonCriterion.signIndex);
      if (hint) {
        const hintEl = document.createElement('div');
        hintEl.className = 'result-time-hint';
        hintEl.textContent = hint;
        card.appendChild(hintEl);
      }
    }

    list.appendChild(card);
  }
}

function formatDate(dt) {
  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const m = monthNames[dt.month] || dt.month;
  const d = dt.day;
  if (dt.year < 0) {
    return `${m} ${d}, ${Math.abs(dt.year)} BCE`;
  }
  return `${m} ${d}, ${dt.year}`;
}

// ============================================================
// Entry point
// ============================================================
async function startSearch() {
  if (isSearching) return;

  const params = validate();
  if (!params) return;

  isSearching = true;
  const btn = $('searchBtn');
  btn.disabled = true;
  btn.textContent = 'Searching...';

  $('resultsArea').classList.remove('active');
  $('resultsList').innerHTML = '';

  try {
    const result = await doSearch(params);
    displayResults(result);
  } catch (err) {
    console.error('Search error:', err);
    $('resultsArea').classList.add('active');
    $('resultsSummary').textContent = '';
    $('resultsList').innerHTML = `
      <div class="status-msg error">
        An error occurred during the search.<br>${err.message}
      </div>`;
  } finally {
    isSearching = false;
    btn.disabled = false;
    btn.textContent = 'Search';
    $('progressArea').classList.remove('active');
  }
}

// Boot
initWasm();
