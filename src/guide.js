// ============================================================
// Reverse Birth Chart Guide — Personality-to-Sign Wizard
// ============================================================

// ============================================================
// Constants
// ============================================================
const SIGNS = [
  { name: 'Aries',       symbol: '\u2648', element: 'fire',  index: 0 },
  { name: 'Taurus',      symbol: '\u2649', element: 'earth', index: 1 },
  { name: 'Gemini',      symbol: '\u264A', element: 'air',   index: 2 },
  { name: 'Cancer',      symbol: '\u264B', element: 'water', index: 3 },
  { name: 'Leo',         symbol: '\u264C', element: 'fire',  index: 4 },
  { name: 'Virgo',       symbol: '\u264D', element: 'earth', index: 5 },
  { name: 'Libra',       symbol: '\u264E', element: 'air',   index: 6 },
  { name: 'Scorpio',     symbol: '\u264F', element: 'water', index: 7 },
  { name: 'Sagittarius', symbol: '\u2650', element: 'fire',  index: 8 },
  { name: 'Capricorn',   symbol: '\u2651', element: 'earth', index: 9 },
  { name: 'Aquarius',    symbol: '\u2652', element: 'air',   index: 10 },
  { name: 'Pisces',      symbol: '\u2653', element: 'water', index: 11 },
];

const PLANET_INFO = {
  sun:     { id: 0, name: 'Sun',     symbol: '\u2609' },
  moon:    { id: 1, name: 'Moon',    symbol: '\u263D' },
  mercury: { id: 2, name: 'Mercury', symbol: '\u263F' },
  venus:   { id: 3, name: 'Venus',   symbol: '\u2640' },
  mars:    { id: 4, name: 'Mars',    symbol: '\u2642' },
};

// ============================================================
// Sign trait descriptions (for dynamic Q6)
// ============================================================
const SIGN_TRAITS = {
  venus: {
    0:  'Falls hard and fast. No games, no hesitation.',
    1:  'Loves through the senses. Touch, taste, presence.',
    2:  'Attracted to wit and conversation. Keeps things light.',
    3:  'Nurtures, protects, takes care. Domestic love.',
    4:  'Gives generously. Makes their partner feel like royalty.',
    5:  'Shows love through thoughtful details. Practical devotion.',
    6:  'Wants a beautiful partnership. Respects boundaries and balance.',
    7:  'Loves with intensity. Wants to share everything. Secretive bonds.',
    8:  'Prefers freedom in love. No clinging, no being clung to.',
    9:  'Commits fully. Builds trust slowly and deliberately.',
    10: 'Love as friendship. Unconventional relationships.',
    11: 'Merges completely. Feels their partner\'s pain and joy as their own.',
  },
  mercury: {
    0:  'Says it straight. Can\'t do roundabout.',
    1:  'Slow, deliberate thinker. Once decided, won\'t budge.',
    2:  'Jumps between topics. Curious about everything. Talks fast.',
    3:  'Speaks with feeling. Chooses words to comfort others.',
    4:  'Speaks boldly, dramatically. Tells stories, not facts.',
    5:  'Precise, analytical. Won\'t speak unless they can be exact.',
    6:  'Adapts to the listener. Diplomatic, fair, polished.',
    7:  'Reads between the lines. Gets to the core. Keeps secrets.',
    8:  'Paints the big picture. Details are an afterthought.',
    9:  'Brief, no-nonsense. Just the conclusion and the facts.',
    10: 'Thinks from a unique angle. Sees what others miss.',
    11: 'Poetic, abstract. Communicates through feeling and intuition.',
  },
};

// ============================================================
// Astronomical constraints
// ============================================================
function getAllowedSigns(planetKey, sunSignIndex) {
  if (planetKey === 'mercury') {
    return [
      (sunSignIndex + 11) % 12,
      sunSignIndex,
      (sunSignIndex + 1) % 12,
    ];
  }
  if (planetKey === 'venus') {
    return [
      (sunSignIndex + 10) % 12,
      (sunSignIndex + 11) % 12,
      sunSignIndex,
      (sunSignIndex + 1) % 12,
      (sunSignIndex + 2) % 12,
    ];
  }
  return SIGNS.map((_, i) => i);
}

// ============================================================
// Question data (static)
// Q6 for venus/mercury is generated dynamically
// Q6 for mars uses the traditional element-to-sign two-step flow
// ============================================================
const QUESTIONS = {
  q1: {
    label: 'STEP 1 \u2014 Sun Sign',
    text: 'What does this character value most in life?',
    choices: [
      { text: 'Being true to themselves, taking on challenges',           element: 'fire',  next: 'q2_fire' },
      { text: 'Stability, comfort, protecting what\'s real and certain',  element: 'earth', next: 'q2_earth' },
      { text: 'Learning, communicating, making connections',              element: 'air',   next: 'q2_air' },
      { text: 'Feeling deeply, bonding closely, protecting loved ones',   element: 'water', next: 'q2_water' },
    ],
  },
  q2_fire: {
    label: 'STEP 1 \u2014 Sun Sign',
    text: 'How do they pursue what matters most?',
    choices: [
      { text: 'Act first, think later. Always wants to be first.',                     sign: 0,  result: 'sun' },
      { text: 'Does things their own way, boldly. Doesn\'t mind the spotlight.',       sign: 4,  result: 'sun' },
      { text: 'Reaches further, wider. Dives into the unknown.',                       sign: 8,  result: 'sun' },
    ],
  },
  q2_earth: {
    label: 'STEP 1 \u2014 Sun Sign',
    text: 'How do they pursue what matters most?',
    choices: [
      { text: 'Trusts the senses, takes their time. Never rushes.',                    sign: 1,  result: 'sun' },
      { text: 'Meticulous, detail-oriented. Always improving.',                        sign: 5,  result: 'sun' },
      { text: 'Makes plans, takes responsibility, builds steadily.',                   sign: 9,  result: 'sun' },
    ],
  },
  q2_air: {
    label: 'STEP 1 \u2014 Sun Sign',
    text: 'How do they pursue what matters most?',
    choices: [
      { text: 'Follows curiosity freely. Would rather sample everything than commit.', sign: 2,  result: 'sun' },
      { text: 'Seeks balance and fairness. Aesthetics matter too.',                    sign: 6,  result: 'sun' },
      { text: 'Refuses convention. Chases their own ideal.',                           sign: 10, result: 'sun' },
    ],
  },
  q2_water: {
    label: 'STEP 1 \u2014 Sun Sign',
    text: 'How do they pursue what matters most?',
    choices: [
      { text: 'Wraps loved ones in warmth. Creates a safe space.',                     sign: 3,  result: 'sun' },
      { text: 'Goes deep. Once they grab hold, they never let go.',                    sign: 7,  result: 'sun' },
      { text: 'Dissolves all boundaries. Accepts everything, empathizes with all.',    sign: 11, result: 'sun' },
    ],
  },
  q3: {
    label: 'STEP 2 \u2014 Moon Sign',
    text: 'When this character is stressed, what\'s their first reaction?',
    choices: [
      { text: 'Gets angry, restless, needs to move',             element: 'fire',  next: 'q4_fire' },
      { text: 'Goes quiet, endures, looks for a practical fix',  element: 'earth', next: 'q4_earth' },
      { text: 'Overthinks, talks it out, or pulls away',         element: 'air',   next: 'q4_air' },
      { text: 'Gets hurt, withdraws, overwhelmed by emotion',    element: 'water', next: 'q4_water' },
    ],
  },
  q4_fire: {
    label: 'STEP 2 \u2014 Moon Sign',
    text: 'What makes them feel safe?',
    choices: [
      { text: 'Freedom to move at their own pace',                  sign: 0,  result: 'moon' },
      { text: 'Being recognized, treated as special',               sign: 4,  result: 'moon' },
      { text: 'Being able to laugh, having hope',                   sign: 8,  result: 'moon' },
    ],
  },
  q4_earth: {
    label: 'STEP 2 \u2014 Moon Sign',
    text: 'What makes them feel safe?',
    choices: [
      { text: 'Physical comfort. Good food, soft textures.',            sign: 1,  result: 'moon' },
      { text: 'Order and clarity. Knowing exactly what needs to be done.', sign: 5,  result: 'moon' },
      { text: 'Social standing. Being relied upon.',                    sign: 9,  result: 'moon' },
    ],
  },
  q4_air: {
    label: 'STEP 2 \u2014 Moon Sign',
    text: 'What makes them feel safe?',
    choices: [
      { text: 'Fresh information and stimulation',                      sign: 2,  result: 'moon' },
      { text: 'A peaceful, beautiful space. No conflict.',              sign: 6,  result: 'moon' },
      { text: 'Solitude. Time that belongs to no one else.',            sign: 10, result: 'moon' },
    ],
  },
  q4_water: {
    label: 'STEP 2 \u2014 Moon Sign',
    text: 'What makes them feel safe?',
    choices: [
      { text: 'A trusted person nearby. Having a place to belong.',     sign: 3,  result: 'moon' },
      { text: 'A deep bond with someone they truly trust.',             sign: 7,  result: 'moon' },
      { text: 'A state of blankness. Being able to just drift.',        sign: 11, result: 'moon' },
    ],
  },
  q5: {
    label: 'STEP 3 \u2014 Extra Planet',
    text: 'Where does this character\'s strongest trait show up?',
    choices: [
      { text: 'Romance, love style, and taste',                planet: 'venus' },
      { text: 'Thinking, speaking, and communicating',          planet: 'mercury' },
      { text: 'Drive, anger, and how they fight',               planet: 'mars',  next: 'q6c' },
    ],
  },
  // Mars only (no constraint -> traditional two-step)
  q6c: {
    label: 'STEP 4 \u2014 Mars (Drive & Anger)',
    text: 'When this character gets angry or truly serious, how do they act?',
    choices: [
      { text: 'Explodes instantly, or charges in without thinking',   element: 'fire',  next: 'q6c_fire' },
      { text: 'Moves quietly but decisively',                         element: 'earth', next: 'q6c_earth' },
      { text: 'Fights with words, or simply walks away',              element: 'air',   next: 'q6c_air' },
      { text: 'Driven by emotion. Would risk everything for loved ones', element: 'water', next: 'q6c_water' },
    ],
  },
  q6c_fire: {
    label: 'STEP 4 \u2014 Mars (Drive & Anger)',
    text: 'A bit more detail on how they fight.',
    choices: [
      { text: 'Flash temper, but never holds a grudge.',                                  sign: 0, result: 'mars' },
      { text: 'Rage is intimidating. Pride is the fuel.',                                 sign: 4, result: 'mars' },
      { text: 'Fights for a cause. Won\'t move without a higher purpose.',                sign: 8, result: 'mars' },
    ],
  },
  q6c_earth: {
    label: 'STEP 4 \u2014 Mars (Drive & Anger)',
    text: 'A bit more detail on how they fight.',
    choices: [
      { text: 'Slow to anger, but once pushed past the limit, immovable.',                sign: 1, result: 'mars' },
      { text: 'Analyzes the problem and strikes at the most efficient point.',            sign: 5, result: 'mars' },
      { text: 'Strategic patience. Goes all-in at the perfect moment.',                   sign: 9, result: 'mars' },
    ],
  },
  q6c_air: {
    label: 'STEP 4 \u2014 Mars (Drive & Anger)',
    text: 'A bit more detail on how they fight.',
    choices: [
      { text: 'Counters with wit and sarcasm. Avoids head-on clashes.',                   sign: 2, result: 'mars' },
      { text: 'Dismantles arguments calmly. Never gets emotional.',                       sign: 6, result: 'mars' },
      { text: 'Rebels against the system itself. Anti-establishment fury.',               sign: 10, result: 'mars' },
    ],
  },
  q6c_water: {
    label: 'STEP 4 \u2014 Mars (Drive & Anger)',
    text: 'A bit more detail on how they fight.',
    choices: [
      { text: 'Only erupts when someone they love is hurt.',                              sign: 3, result: 'mars' },
      { text: 'Holds grudges. Once you\'re an enemy, there\'s no mercy.',                 sign: 7, result: 'mars' },
      { text: 'Anger diffuses outward. Would sacrifice themselves to end the conflict.',  sign: 11, result: 'mars' },
    ],
  },
};

const TOTAL_STEPS = 6;

// ============================================================
// Dynamic Q6 builder for constrained planets
// ============================================================
function buildConstrainedQ6(planetKey, sunSignIndex) {
  const allowed = getAllowedSigns(planetKey, sunSignIndex);
  const traits = SIGN_TRAITS[planetKey];

  const questionTexts = {
    venus:   'Which love style fits this character best?',
    mercury: 'Which thinking/speaking style fits this character best?',
  };

  const labelTexts = {
    venus:   'STEP 4 \u2014 Venus (Love Style)',
    mercury: 'STEP 4 \u2014 Mercury (Mind & Words)',
  };

  return {
    label: labelTexts[planetKey],
    text: questionTexts[planetKey],
    isDynamic: true,
    choices: allowed.map((si) => ({
      text: traits[si],
      hint: SIGNS[si].symbol + ' ' + SIGNS[si].name,
      sign: si,
      result: planetKey,
      element: SIGNS[si].element,
    })),
  };
}

// ============================================================
// LLM Prompt (Route A)
// ============================================================
const LLM_PROMPT = `You are an assistant with deep expertise in Western astrology.
Read the novel excerpt provided below and, for each character, infer their natal chart placements (zodiac signs for key planets).

### Procedure (follow this order strictly)

#### Step 1: Determine the Sun sign and Moon sign

For each character, infer the following two placements:

- **Sun sign**: The character's core identity, life purpose, and driving force.
  - Clues: guiding principles, values, what they prioritize in life, how others perceive them.
- **Moon sign**: Emotional nature, what makes them feel safe, their private self.
  - Clues: stress reactions, how they show vulnerability or affection, anger style, unconscious habits, sources of comfort.

For each, cite specific scenes or behaviors from the text as evidence.

#### Step 2: Add 1\u20132 additional planets that capture their strongest traits

Once Sun and Moon are decided, identify the area where the character's personality is most distinctive, and infer the corresponding planet's sign:

- Distinctive in romance, love expression, or aesthetics \u2192 **Venus**
- Distinctive in thought patterns, speech, or communication \u2192 **Mercury**
- Distinctive in drive, anger, or combat style \u2192 **Mars**

Again, cite textual evidence for each inference.

### Astronomical constraints (must be obeyed)

Planets have physical limits on how far they can be from the Sun:

- **Mercury** can only be in the same sign as the Sun, or one sign before/after it.
  - Example: If Sun is in Virgo, Mercury can only be in Leo, Virgo, or Libra.
- **Venus** can only be in the same sign as the Sun, or up to two signs before/after it.
  - Example: If Sun is in Virgo, Venus can only be in Cancer, Leo, Virgo, Libra, or Scorpio.
- **Mars and beyond** have no such constraint.

Never propose a combination that violates these rules.
If the text suggests the opposite sign (180\u00B0 away) but the constraint forbids it, find the closest valid interpretation instead.

### Output format

For each character, output in this format:

\`\`\`
[Character Name]
\u2609 Sun: [Sign] \u2014 Evidence: "[summary or quote from the text]"
\u263D Moon: [Sign] \u2014 Evidence: "[summary or quote]"
Additional planet(s) (1\u20132):
\u263F/\u2640/\u2642 [Sign] \u2014 Evidence: "[summary or quote]"
\`\`\`

### Notes

- If unsure, list two candidates with evidence for each.
- If the character lacks enough description, write "Insufficient information" rather than guessing.
- Base your inferences on personality and behavior, not on any stated birthday.

---

Paste the novel text below.

(Paste your text here)`;

// ============================================================
// State
// ============================================================
let wizardState = {
  currentQuestion: null,
  history: [],
  stepCount: 0,
  results: {},
  extraPlanet: null,
  _dynamicQ: null,
};

const $ = (id) => document.getElementById(id);

// ============================================================
// Route choice
// ============================================================
function initRouteChoice() {
  $('cardRouteA').addEventListener('click', () => showRouteA());
  $('cardRouteB').addEventListener('click', () => showRouteB());
  $('routeABack').addEventListener('click', () => showRouteChoice());
}

function showRouteChoice() {
  $('routeChoice').style.display = 'block';
  $('routeA').style.display = 'none';
  $('routeB').style.display = 'none';
  $('wizardResult').style.display = 'none';
}

function showRouteA() {
  $('routeChoice').style.display = 'none';
  $('routeA').style.display = 'block';
  $('routeB').style.display = 'none';
  $('wizardResult').style.display = 'none';
  renderPrompt();
}

function showRouteB() {
  $('routeChoice').style.display = 'none';
  $('routeA').style.display = 'none';
  $('routeB').style.display = 'block';
  $('wizardResult').style.display = 'none';
  resetWizard();
  showQuestion('q1');
}

// ============================================================
// Route A: Prompt display
// ============================================================
function renderPrompt() {
  $('promptText').textContent = LLM_PROMPT;

  const copyBtn = $('copyBtn');
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(LLM_PROMPT);
      copyBtn.textContent = '\u2713 Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = '\uD83D\uDCCB Copy Prompt';
        copyBtn.classList.remove('copied');
      }, 2000);
    } catch (e) {
      const textarea = document.createElement('textarea');
      textarea.value = LLM_PROMPT;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      copyBtn.textContent = '\u2713 Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = '\uD83D\uDCCB Copy Prompt';
        copyBtn.classList.remove('copied');
      }, 2000);
    }
  });
}

// ============================================================
// Route B: Wizard
// ============================================================
function resetWizard() {
  wizardState = {
    currentQuestion: null,
    history: [],
    stepCount: 0,
    results: {},
    extraPlanet: null,
    _dynamicQ: null,
  };
}

function getLogicalStep(questionId) {
  if (questionId === 'q1') return 0;
  if (questionId.startsWith('q2')) return 1;
  if (questionId === 'q3') return 2;
  if (questionId.startsWith('q4')) return 3;
  if (questionId === 'q5') return 4;
  if (questionId.startsWith('q6') || questionId.startsWith('_dynamic')) return 5;
  return 0;
}

function renderProgress(currentStep) {
  const container = $('wizardProgress');
  container.innerHTML = '';
  for (let i = 0; i < TOTAL_STEPS; i++) {
    const dot = document.createElement('div');
    dot.className = 'wizard-dot';
    if (i === currentStep) dot.classList.add('active');
    else if (i < currentStep) dot.classList.add('done');
    container.appendChild(dot);
  }
}

function showQuestion(questionId, dynamicQ) {
  wizardState.currentQuestion = questionId;

  const q = dynamicQ || QUESTIONS[questionId];
  if (!q) return;

  const logicalStep = getLogicalStep(questionId);
  wizardState.stepCount = logicalStep;
  renderProgress(logicalStep);

  const stepsContainer = $('wizardSteps');
  stepsContainer.innerHTML = '';

  const stepDiv = document.createElement('div');
  stepDiv.className = 'wizard-step active';

  const label = document.createElement('div');
  label.className = 'question-label';
  label.textContent = q.label;

  const text = document.createElement('div');
  text.className = 'question-text';
  text.textContent = q.text;

  const choiceGrid = document.createElement('div');
  choiceGrid.className = 'choice-grid';

  q.choices.forEach((choice, idx) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.type = 'button';
    if (choice.element) {
      btn.dataset.element = choice.element;
    }

    const mainText = document.createTextNode(choice.text);
    btn.appendChild(mainText);

    if (choice.hint) {
      const hintSpan = document.createElement('span');
      hintSpan.className = 'choice-hint';
      hintSpan.textContent = choice.hint;
      btn.appendChild(hintSpan);
    }

    btn.addEventListener('click', () => handleChoice(questionId, idx, q));
    choiceGrid.appendChild(btn);
  });

  stepDiv.appendChild(label);
  stepDiv.appendChild(text);
  stepDiv.appendChild(choiceGrid);
  stepsContainer.appendChild(stepDiv);

  const nav = $('wizardNav');
  nav.style.display = wizardState.history.length > 0 ? 'flex' : 'none';
}

function handleChoice(questionId, choiceIndex, questionObj) {
  const q = questionObj || QUESTIONS[questionId];
  const choice = q.choices[choiceIndex];

  wizardState.history.push({ questionId, choiceIndex });

  if (choice.result && choice.sign !== undefined) {
    wizardState.results[choice.result] = choice.sign;

    if (choice.result === 'sun') {
      showQuestion('q3');
      return;
    }
    if (choice.result === 'moon') {
      showQuestion('q5');
      return;
    }
    if (['venus', 'mercury', 'mars'].includes(choice.result)) {
      wizardState.extraPlanet = choice.result;
      showResult();
      return;
    }
  }

  if (choice.planet) {
    wizardState.extraPlanet = choice.planet;

    if (choice.planet === 'venus' || choice.planet === 'mercury') {
      const sunSign = wizardState.results.sun;
      const dynamicQ = buildConstrainedQ6(choice.planet, sunSign);
      const dynamicId = '_dynamic_' + choice.planet;
      wizardState._dynamicQ = dynamicQ;
      showQuestion(dynamicId, dynamicQ);
      return;
    }
  }

  if (choice.next) {
    showQuestion(choice.next);
  }
}

function initWizardBack() {
  $('wizardBack').addEventListener('click', () => {
    if (wizardState.history.length === 0) return;

    wizardState.history.pop();

    if (wizardState.history.length === 0) {
      showQuestion('q1');
      wizardState.results = {};
      wizardState.extraPlanet = null;
      wizardState._dynamicQ = null;
      return;
    }

    const savedHistory = [...wizardState.history];
    const lastQuestionId = savedHistory[savedHistory.length - 1].questionId;

    // Reset and replay up to (but not including) the last entry
    resetWizard();

    for (let i = 0; i < savedHistory.length - 1; i++) {
      const entry = savedHistory[i];
      const q = QUESTIONS[entry.questionId];
      if (!q) continue;
      const choice = q.choices[entry.choiceIndex];

      wizardState.history.push(entry);

      if (choice.result && choice.sign !== undefined) {
        wizardState.results[choice.result] = choice.sign;
      }
      if (choice.planet) {
        wizardState.extraPlanet = choice.planet;
      }
    }

    // Re-show the last question
    let dynamicQ = null;
    if (lastQuestionId.startsWith('_dynamic_')) {
      const planetKey = lastQuestionId.replace('_dynamic_', '');
      dynamicQ = buildConstrainedQ6(planetKey, wizardState.results.sun);
      wizardState._dynamicQ = dynamicQ;
    }

    showQuestion(lastQuestionId, dynamicQ);
  });
}

// ============================================================
// Result display
// ============================================================
function showResult() {
  $('routeB').style.display = 'none';
  $('wizardResult').style.display = 'block';

  const sunSign = wizardState.results.sun;
  const moonSign = wizardState.results.moon;
  const extraPlanet = wizardState.extraPlanet;
  const extraSign = wizardState.results[extraPlanet];

  const resultDiv = $('wizardResult');
  resultDiv.innerHTML = '';

  const title = document.createElement('div');
  title.className = 'section-title';
  title.textContent = 'Result';
  resultDiv.appendChild(title);

  const card = document.createElement('div');
  card.className = 'result-summary-card';

  const rows = [
    { planet: PLANET_INFO.sun,  sign: sunSign,  priority: 'Required' },
    { planet: PLANET_INFO.moon, sign: moonSign, priority: 'Required' },
    { planet: PLANET_INFO[extraPlanet], sign: extraSign, priority: 'Preferred' },
  ];

  rows.forEach((r) => {
    const row = document.createElement('div');
    row.className = 'result-sign-row';
    row.innerHTML =
      '<span class="result-planet-label">' + r.planet.symbol + ' ' + r.planet.name + '</span>' +
      '<span class="result-sign-value">' + SIGNS[r.sign].symbol + ' ' + SIGNS[r.sign].name + '</span>' +
      '<span class="result-priority">' + r.priority + '</span>';
    card.appendChild(row);
  });

  resultDiv.appendChild(card);

  const actions = document.createElement('div');
  actions.className = 'result-actions';

  const searchLink = document.createElement('a');
  searchLink.className = 'search-link-btn';
  searchLink.href = buildReverseUrl();
  searchLink.textContent = 'Search for matching birth dates \u2192';
  actions.appendChild(searchLink);

  const restartBtn = document.createElement('button');
  restartBtn.className = 'restart-btn';
  restartBtn.type = 'button';
  restartBtn.textContent = '\u21BA Start Over';
  restartBtn.addEventListener('click', () => showRouteChoice());
  actions.appendChild(restartBtn);

  resultDiv.appendChild(actions);
}

// ============================================================
// URL building for index.html (reverse search)
// ============================================================
function buildReverseUrl() {
  const params = new URLSearchParams();
  params.set('sun', wizardState.results.sun);
  params.set('moon', wizardState.results.moon);

  const extraPlanet = wizardState.extraPlanet;
  if (extraPlanet && wizardState.results[extraPlanet] !== undefined) {
    params.set(extraPlanet, wizardState.results[extraPlanet]);
  }

  params.set('p_sun', 'required');
  params.set('p_moon', 'required');
  if (extraPlanet) {
    params.set('p_' + extraPlanet, 'optional');
  }

  return './index.html?' + params.toString();
}

// ============================================================
// Boot
// ============================================================
function init() {
  initRouteChoice();
  initWizardBack();
}

init();
