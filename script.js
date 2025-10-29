const industryEl = document.getElementById('industry');
const typeEl = document.getElementById('type');
const generateBtn = document.getElementById('generate');
const targetEl = document.getElementById('target');
const resultSection = document.getElementById('result');
const briefText = document.getElementById('brief-text');
const twistText = document.getElementById('twist-text');
const twistRow = document.querySelector('.twist-row');
const twistToggleEl = document.getElementById('twist-toggle');
const againBtn = document.getElementById('again');
const copyBtn = document.getElementById('copy');

const topicsByIndustry = {
  Fintech: [
    'savings', 'micro-investing', 'peer-to-peer payments', 'budgeting', 'credit building', 
    'freelancer invoicing', 'split bills', 'AI wealth coaching', 'sustainable investing', 'subscription tracking'
  ],
  Health: [
    'mental wellness', 'habit tracking', 'medication reminders', 'telehealth check-ins', 
    'sleep coaching', 'nutrition planning', 'AI symptom journaling', 'mood-driven workouts', 'preventive nudges'
  ],
  Education: [
    'micro-learning', 'study groups', 'flashcards', 'language practice', 'peer mentoring', 
    'course discovery', 'AI tutoring', 'career path guidance', 'adaptive quizzes'
  ],
  Travel: [
    'itinerary planning', 'local discovery', 'flight deals', 'packing lists', 'offline maps', 
    'shared trips', 'AI travel companion', 'eco route suggestions', 'real-time translation help'
  ],
  Gaming: [
    'matchmaking', 'guild management', 'achievement tracking', 'esports brackets', 
    'user-generated levels', 'AI dungeon design', 'player behavior insights', 'cross-platform avatars'
  ],
  Social: [
    'interest communities', 'event discovery', 'local clubs', 'photo prompts', 'audio rooms', 
    'book swaps', 'AI-driven introductions', 'micro-social challenges', 'story-based identity building'
  ],
  Productivity: [
    'task batching', 'focus sessions', 'meeting notes', 'doc summarization', 
    'calendar harmony', 'template sharing', 'AI prioritization', 'contextual automation', 'ambient planning'
  ],
  Sustainability: [
    'carbon footprint tracking', 'local reuse networks', 'eco-friendly swaps', 
    'impact reporting', 'community cleanups', 'shared transport routes'
  ],
  Fashion: [
    'outfit planning', 'wardrobe digitization', 'AI styling', 
    'resale marketplaces', 'sustainable sourcing', 'creator collaborations'
  ]
};

const audiences = [
  'students', 'remote teams', 'first-time parents', 'busy professionals', 'indie creators',
  'travelers', 'new residents', 'community organizers', 'volunteers', 'small business owners',
  'digital nomads', 'retirees exploring tech', 'content creators', 'eco-conscious consumers',
  'high school teachers', 'solo entrepreneurs', 'gamers in their 30s', 'health coaches',
  'multilingual households', 'AI enthusiasts'
];

const goals = [
  'discover', 'plan', 'track', 'share', 'learn', 'improve', 'connect', 'collaborate', 'stay motivated',
  'reflect', 'automate', 'personalize', 'co-create', 'explore', 'grow', 'decompress', 'organize', 'experiment', 'feel supported'
];

const twists = [
  'You can only use 8-bit icons.',
  'The primary color must be purple.',
  'Design for offline-first usage.',
  'All actions must be reachable with one hand.',
  'Use only two type sizes.',
  'The app should feel like a cozy studio.',
  'Narrate key moments with subtle haptic feedback.',
  'No modals. Rethink flows to avoid them.',
  'Dark mode is the default; light mode is optional.',
  'Include a whimsical empty state illustration.',
  'Every screen must have a tiny animation.',
  'Design it to work perfectly on a smartwatch.',
  'The onboarding happens without any text.',
  'You must use a circular layout somewhere.',
  'All images must be black and white.',
  'Microcopy must sound like a friendly robot.',
  'Each error state should make the user smile.',
  'The interface should feel inspired by nature.',
  'Design as if it’s used in a noisy environment.',
  'Everything must fit in a single scroll view.',
  'The UI should subtly change based on time of day.',
  'You can’t use borders—rely on spacing and color only.',
  'The product must work beautifully in low light.',
  'Every button has to have a distinct shape.',
  'All illustrations must be geometric.',
  'Design for left-handed users first.',
  'No icons—use text or shapes instead.',
  'The experience should feel like a board game.',
  'Users can only interact with voice and gestures.',
  'Include one delightful hidden interaction (an Easter egg).',
  'Your layout grid must be 5 columns wide.',
  'The app should feel like a 90s OS.',
  'Use only monochrome + one accent color.',
  'Design for slow internet connections.',
  'Make it usable with gloves on.',
  'Every transition must have a purpose.',
  'The app should react subtly to the user’s mood.',
  'Design it so it can be printed on paper and still make sense.'
];

// ----------------------------------------------
// Deterministic randomness to keep briefs consistent
// ----------------------------------------------

function hashString(str) {
  let h = 1779033703 ^ (str?.length || 0);
  for (let i = 0; i < (str?.length || 0); i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  h ^= h >>> 16;
  return h >>> 0;
}

function rngFromSeed(seed) {
  let a = hashString(seed) || 1; // xorshift32
  return function () {
    a ^= a << 13;
    a ^= a >>> 17;
    a ^= a << 5;
    return ((a >>> 0) / 4294967296);
  };
}

function seededPick(array, rnd) {
  if (!array || array.length === 0) return '';
  return array[Math.floor(rnd() * array.length)];
}

// Tracks current parameter seed and a variant counter for "Generate another"
let lastSeedBasis = '';
let variantCounter = 0;
let lastEffectiveSeed = '';

// removed unused pick/sentenceCase utilities

// Type options supported by the UI
const allowedTypes = ['complete application', 'some UI', 'prototype', 'wireframes', 'user flows'];

// removed industryPhrases (no longer used in new brief format)

// Topic-specific action/object templates for coherent grammar
const topicActions = {
  // Fintech
  'savings': { action: 'build', object: 'savings habits' },
  'micro-investing': { action: 'start', object: 'micro‑investing' },
  'peer-to-peer payments': { action: 'send and receive', object: 'payments' },
  'budgeting': { action: 'plan and track', object: 'budgets' },
  'credit building': { action: 'improve', object: 'credit' },
  'freelancer invoicing': { action: 'create and track', object: 'invoices' },
  'split bills': { action: 'split and settle', object: 'expenses with friends' },
  // Health
  'mental wellness': { action: 'support', object: 'mental wellness' },
  'habit tracking': { action: 'build and track', object: 'habits' },
  'medication reminders': { action: 'stay on top of', object: 'medications' },
  'telehealth check-ins': { action: 'prepare and follow up on', object: 'telehealth check‑ins' },
  'sleep coaching': { action: 'improve', object: 'sleep' },
  'nutrition planning': { action: 'plan', object: 'nutrition' },
  // Education
  'micro-learning': { action: 'learn', object: 'in short sessions' },
  'study groups': { action: 'form and run', object: 'study groups' },
  'flashcards': { action: 'practice with', object: 'flashcards' },
  'language practice': { action: 'practice', object: 'languages' },
  'peer mentoring': { action: 'connect for', object: 'peer mentoring' },
  'course discovery': { action: 'discover', object: 'courses' },
  // Travel
  'itinerary planning': { action: 'plan and manage', object: 'itineraries' },
  'local discovery': { action: 'discover', object: 'local spots' },
  'flight deals': { action: 'find', object: 'flight deals' },
  'packing lists': { action: 'organize', object: 'packing lists' },
  'offline maps': { action: 'navigate with', object: 'offline maps' },
  'shared trips': { action: 'plan', object: 'shared trips' },
  // Gaming
  'matchmaking': { action: 'find', object: 'matchups' },
  'guild management': { action: 'organize', object: 'guilds' },
  'achievement tracking': { action: 'track', object: 'achievements' },
  'esports brackets': { action: 'run', object: 'esports brackets' },
  'user-generated levels': { action: 'create and share', object: 'levels' },
  // Social
  'interest communities': { action: 'join and contribute to', object: 'interest communities' },
  'event discovery': { action: 'discover', object: 'events' },
  'local clubs': { action: 'find and join', object: 'local clubs' },
  'photo prompts': { action: 'share', object: 'photos from prompts' },
  'audio rooms': { action: 'host and join', object: 'audio rooms' },
  'book swaps': { action: 'facilitate', object: 'book swaps' },
  // Productivity
  'task batching': { action: 'batch', object: 'tasks' },
  'focus sessions': { action: 'run', object: 'focus sessions' },
  'meeting notes': { action: 'capture and share', object: 'meeting notes' },
  'doc summarization': { action: 'summarize', object: 'documents' },
  'calendar harmony': { action: 'coordinate', object: 'calendars' },
  'template sharing': { action: 'share', object: 'templates' }
};

// Map industry to an app noun phrase
const industryAppPhrase = {
  Fintech: 'fintech application',
  Health: 'health application',
  Education: 'education application',
  Travel: 'travel application',
  Gaming: 'gaming application',
  Social: 'social application',
  Productivity: 'productivity application'
};

// Convert topic to a short modifier preceding the industry app noun
function topicModifier(industry, topic) {
  const map = {
    Travel: {
      'itinerary planning': 'itinerary',
      'local discovery': 'local discovery',
      'flight deals': 'flight-deals',
      'packing lists': 'packing',
      'offline maps': 'offline-maps',
      'shared trips': 'group-trip'
    },
    Fintech: {
      'savings': 'savings',
      'micro-investing': 'micro-investing',
      'peer-to-peer payments': 'payments',
      'budgeting': 'budgeting',
      'credit building': 'credit-building',
      'freelancer invoicing': 'invoicing',
      'split bills': 'bill-splitting'
    },
    Health: {
      'mental wellness': 'wellness',
      'habit tracking': 'habit-tracking',
      'medication reminders': 'medication',
      'telehealth check-ins': 'telehealth',
      'sleep coaching': 'sleep',
      'nutrition planning': 'nutrition'
    },
    Education: {
      'micro-learning': 'micro-learning',
      'study groups': 'study-group',
      'flashcards': 'flashcard',
      'language practice': 'language',
      'peer mentoring': 'mentoring',
      'course discovery': 'course-discovery'
    },
    Gaming: {
      'matchmaking': 'matchmaking',
      'guild management': 'guild',
      'achievement tracking': 'achievement',
      'esports brackets': 'tournament',
      'user-generated levels': 'UGC-levels'
    },
    Social: {
      'interest communities': 'community',
      'event discovery': 'event',
      'local clubs': 'club',
      'photo prompts': 'photo',
      'audio rooms': 'audio',
      'book swaps': 'book-swap'
    },
    Productivity: {
      'task batching': 'task',
      'focus sessions': 'focus',
      'meeting notes': 'notes',
      'doc summarization': 'summary',
      'calendar harmony': 'calendar',
      'template sharing': 'template'
    }
  };
  return (map[industry] && map[industry][topic]) || topic;
}

// Realistic main use cases per industry
const useCasesByIndustry = {
  Travel: [
    'book trips in less than 5 clicks',
    'save and reuse traveler profiles at checkout',
    'compare multi-city itineraries side by side',
    'receive real-time gate change alerts'
  ],
  Fintech: [
    'transfer money to contacts in under 10 seconds',
    'auto-categorize expenses with 95% accuracy',
    'round-up purchases to grow savings daily'
  ],
  Health: [
    'log habits in under 10 seconds per day',
    'set smart reminders that adapt to routines',
    'share progress with a coach each week'
  ],
  Education: [
    'finish a 5-minute lesson during a commute',
    'track study streaks without manual input',
    'form a study group in 3 taps'
  ],
  Gaming: [
    'join a match within 30 seconds',
    'find teammates with complementary roles',
    'review post-game highlights instantly'
  ],
  Social: [
    'create an event in under a minute',
    'find nearby groups that match interests',
    'share a photo set with automatic captions'
  ],
  Productivity: [
    'capture a task in one keystroke',
    'turn meeting notes into action items automatically',
    'schedule across time zones without back-and-forth'
  ]
};

// Topic-specific use cases to ensure coherence within each industry
// When present, these override the broader industry list
const useCasesByTopic = {
  Social: {
    'book swaps': [
      'catalog and list books for swapping in under a minute',
      'match with nearby readers for swaps automatically',
      'track swap history and condition notes seamlessly'
    ],
    'photo prompts': [
      'share a photo set with automatic captions',
      'respond to daily prompts with quick multi-photo posts',
      'auto-curate best shots from a burst to post faster'
    ],
    'event discovery': [
      'create an event in under a minute',
      'find nearby groups that match interests',
      'RSVP and add to calendar in one tap'
    ],
    'interest communities': [
      'find and join a relevant community in two taps',
      'surface trending threads you can contribute to right now'
    ],
    'audio rooms': [
      'start an audio room and invite friends in 15 seconds',
      'clip and share highlights right after the room ends'
    ],
    'local clubs': [
      'discover nearby clubs you can attend this week',
      'apply to join a club with a short intro in one flow'
    ]
  },
  Travel: {
    'itinerary planning': [
      'compare multi-city itineraries side by side',
      'plan and manage itineraries collaboratively with friends'
    ],
    'flight deals': [
      'find price drops for watched routes instantly',
      'bundle flights and stays with transparent total cost'
    ],
    'offline maps': [
      'navigate with offline maps and live reroutes',
      'save places and access them offline while roaming'
    ]
  },
  Fintech: {
    'savings': [
      'round-up purchases to grow savings daily',
      'set weekly savings goals with smart nudges'
    ],
    'peer-to-peer payments': [
      'transfer money to contacts in under 10 seconds',
      'split and settle expenses with friends instantly'
    ],
    'budgeting': [
      'auto-categorize expenses with 95% accuracy',
      'set envelope budgets that adapt to spending patterns'
    ]
  }
};

// Generation-specific style guidance to steer the brief tone
const generationStyle = {
  'Gen Z': 'Design language: vibrant, colourful, social-first interactions.',
  'Gen Alpha': 'Design language: playful, exploratory, safe-by-default.',
  'Millennials': 'Design language: clean, practical, productivity-focused.'
};

function generateBrief({ industry, type, target, seedOverride }) {
  const seed = seedOverride || `${industry}|${type}|${target || ''}`;
  const rnd = rngFromSeed(seed);

  const topic = seededPick(topicsByIndustry[industry] || ['discovery'], rnd);
  const modifier = topicModifier(industry, topic);
  const app = industryAppPhrase[industry] || `${industry.toLowerCase()} application`;
  const typePhrase = allowedTypes.includes(type) ? type : 'some UI';
  // Prefer topic-specific use cases when available; fall back to industry list
  const topicSpecific = (useCasesByTopic[industry] && useCasesByTopic[industry][topic]) || null;
  const candidateUseCases = topicSpecific && topicSpecific.length
    ? topicSpecific
    : (useCasesByIndustry[industry] || []);
  const useCase = seededPick(candidateUseCases.length ? candidateUseCases : ['deliver clear user value fast'], rnd);

  // E.g., "Create some UI for a cycling travel application. The main use case is as follows: book trips in less than 5 clicks."
  const modifierPrefix = modifier ? `${modifier} ` : '';
  const audienceSuffix = target ? ` for ${target}` : '';
  const first = `Create ${typePhrase} for a ${modifierPrefix}${app}${audienceSuffix}.`;
  const second = `The main use case is as follows: ${useCase}.`;
  const style = generationStyle[target] ? ` ${generationStyle[target]}` : '';
  return `${first} ${second}${style}`;
}

function generateTwist(seedBasis) {
  const rnd = rngFromSeed(`${seedBasis}|twist`);
  return seededPick(twists, rnd);
}

function setLoading(isLoading) {
  generateBtn.disabled = isLoading;
  generateBtn.textContent = isLoading ? 'Generating…' : 'Generate Brief';
}

function handleGenerate(variant = false) {
  const industry = industryEl.value;
  const type = typeEl.value;
  const target = targetEl ? targetEl.value : '';
  const includeTwist = twistToggleEl ? !!twistToggleEl.checked : true;

  if (!industry || !type || !target) {
    // soft nudge
    [industryEl, typeEl, targetEl].forEach(el => {
      if (!el.value) {
        el.parentElement.classList.add('shake');
        setTimeout(() => el.parentElement.classList.remove('shake'), 400);
      }
    });
    return;
  }

  setLoading(true);

  // Simulate a tiny delay for anticipation/micro-interaction
  const basis = `${industry}|${type}|${target}`;
  if (basis !== lastSeedBasis) {
    variantCounter = 0;
    lastSeedBasis = basis;
  }
  if (variant) {
    variantCounter += 1;
  } else {
    variantCounter = 0;
  }

  const effectiveSeed = variantCounter ? `${basis}|v${variantCounter}` : basis;
  lastEffectiveSeed = effectiveSeed;

  setTimeout(() => {
    const brief = generateBrief({ industry, type, target, seedOverride: effectiveSeed });
    const twist = includeTwist ? generateTwist(effectiveSeed) : '';
    briefText.textContent = brief;
    twistText.textContent = twist;
    if (twistRow) {
      if (includeTwist) {
        twistRow.style.display = '';
      } else {
        twistRow.style.display = 'none';
      }
    }
    resultSection.classList.remove('hidden');
    setLoading(false);
  }, 420);
}

function handleCopy() {
  const includeTwist = twistToggleEl ? !!twistToggleEl.checked : true;
  const content = includeTwist && twistText.textContent
    ? `Brief: ${briefText.textContent}\nTwist: ${twistText.textContent}`
    : `Brief: ${briefText.textContent}`;
  navigator.clipboard.writeText(content).then(() => {
    const label = copyBtn.querySelector('.label-text');
    if (label) {
      const previous = label.textContent;
      label.textContent = 'Copied!';
      setTimeout(() => (label.textContent = previous || 'Copy brief'), 1200);
    } else {
      // fallback if structure changes
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = 'Copy brief'), 1200);
    }
  }).catch(() => {
    // fallback UI
    window.prompt('Copy to clipboard:', content);
  });
}

generateBtn.addEventListener('click', () => handleGenerate(false));
againBtn.addEventListener('click', () => handleGenerate(true));
copyBtn.addEventListener('click', handleCopy);


// ----------------------------------------------
// Custom dropdowns with Heroicons (MIT) via CDN URLs
// ----------------------------------------------

const HERO_BASE = 'https://cdn.jsdelivr.net/npm/heroicons@2.1.5/24/outline';
function hero(name) { return `<img class="icon" alt="" src="${HERO_BASE}/${name}.svg"/>`; }

// Label → Heroicon name mapping
const industryIcons = {
  Fintech: hero('credit-card'),
  Health: hero('heart'),
  Education: hero('academic-cap'),
  Travel: hero('paper-airplane'),
  Gaming: hero('puzzle-piece'),
  Social: hero('users'),
  Productivity: hero('list-bullet')
};

const typeIcons = {
  'complete application': hero('cube'),
  'some UI': hero('rectangle-group'),
  'prototype': hero('play'),
  'wireframes': hero('presentation-chart-bar'),
  'user flows': hero('arrow-path')
};

// removed tone icons

// Target generation icons
const targetIcons = {
  'Gen Z': hero('sparkles'),
  'Gen Alpha': hero('beaker'),
  'Millennials': hero('briefcase')
};
const chevronDown = '<svg class="chevron" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

function enhanceSelect(selectEl, iconMap) {
  const wrap = selectEl.closest('.select-wrap');
  if (!wrap) return;

  // Keep native select for state/validation but visually hide it from UI interaction
  selectEl.classList.add('visually-hidden-select');
  selectEl.setAttribute('tabindex', '-1');
  selectEl.setAttribute('aria-hidden', 'true');

  const dropdown = document.createElement('div');
  dropdown.className = 'dropdown';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'dropdown-button';
  button.setAttribute('aria-haspopup', 'listbox');
  button.setAttribute('aria-expanded', 'false');
  button.id = `${selectEl.id}-button`;

  const valueSpan = document.createElement('span');
  valueSpan.className = 'value';
  valueSpan.innerHTML = `${iconFor(selectEl, iconMap, selectEl.value)}<span class="label">${selectEl.selectedOptions[0]?.textContent || selectEl.options[0]?.textContent || ''}</span>`;

  const chevron = document.createElement('span');
  chevron.innerHTML = chevronDown;

  button.appendChild(valueSpan);
  button.appendChild(chevron);

  const list = document.createElement('ul');
  list.className = 'dropdown-list';
  list.setAttribute('role', 'listbox');
  list.setAttribute('tabindex', '-1');
  list.hidden = true;

  Array.from(selectEl.options).forEach((opt, idx) => {
    const isDisabled = opt.disabled;
    const item = document.createElement('li');
    item.className = 'dropdown-item';
    item.setAttribute('role', 'option');
    const dataValue = opt.hasAttribute('value') ? opt.value : opt.textContent;
    item.setAttribute('data-value', dataValue);
    item.setAttribute('aria-selected', String(opt.selected));
    if (isDisabled) item.setAttribute('aria-disabled', 'true');
    item.tabIndex = isDisabled ? -1 : 0; // allow focus unless disabled
    item.innerHTML = `${iconFor(selectEl, iconMap, (opt.hasAttribute('value') ? opt.value : opt.textContent))}<span class="label">${opt.textContent}</span>`;
    if (!isDisabled) {
      item.addEventListener('click', () => selectValue(opt.hasAttribute('value') ? opt.value : opt.textContent));
    }
    list.appendChild(item);
  });

  function open() {
    list.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    const selected = list.querySelector('[aria-selected="true"]');
    (selected || list.querySelector('.dropdown-item:not([aria-disabled="true"])'))?.focus();
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onDocKey);
  }

  function close() {
    list.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', onDocClick);
    document.removeEventListener('keydown', onDocKey);
  }

  function onDocClick(e) {
    if (!dropdown.contains(e.target)) close();
  }

  function onDocKey(e) {
    if (e.key === 'Escape') { close(); button.focus(); }
  }

  function selectValue(value) {
    // Update native select
    selectEl.value = value;
    const evt = new Event('change', { bubbles: true });
    selectEl.dispatchEvent(evt);
    // Update visuals
    valueSpan.innerHTML = `${iconFor(selectEl, iconMap, value)}<span class="label">${getSelectedLabel()}</span>`;
    list.querySelectorAll('.dropdown-item').forEach(li => li.setAttribute('aria-selected', String(li.getAttribute('data-value') === value)));
    close();
    button.focus();
  }

  function getSelectedLabel() {
    return selectEl.selectedOptions[0]?.textContent || '';
  }

  button.addEventListener('click', () => {
    if (list.hidden) open(); else close();
  });

  button.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  });

  list.addEventListener('keydown', (e) => {
    const focusable = Array.from(list.querySelectorAll('.dropdown-item:not([aria-disabled="true"])'));
    const idx = focusable.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = focusable[Math.min(idx + 1, focusable.length - 1)] || focusable[0];
      next.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = focusable[Math.max(idx - 1, 0)] || focusable[focusable.length - 1];
      prev.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (document.activeElement && document.activeElement.classList.contains('dropdown-item')) {
        const val = document.activeElement.getAttribute('data-value');
        selectValue(val);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
      button.focus();
    }
  });

  dropdown.appendChild(button);
  dropdown.appendChild(list);
  wrap.appendChild(dropdown);
}

function iconFor(selectEl, map, label) {
  const kind = (selectEl.id === 'industry') ? industryIcons : typeIcons;
  const key = (label || '').trim();
  return (kind[key] || map?.[key] || '') || '';
}

// Enhance on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  enhanceSelect(industryEl, industryIcons);
  enhanceSelect(targetEl, targetIcons);
  enhanceSelect(typeEl, typeIcons);
  // Initialize twist row visibility based on toggle default
  if (twistRow && twistToggleEl) {
    twistRow.style.display = twistToggleEl.checked ? '' : 'none';
  }
  // Reflect changes immediately if user toggles after generation
  if (twistToggleEl) {
    twistToggleEl.addEventListener('change', () => {
      if (twistRow) {
        const includeTwist = !!twistToggleEl.checked;
        if (!resultSection.classList.contains('hidden')) {
          if (includeTwist) {
            // generate twist deterministically for the current seed
            const seedBasis = lastSeedBasis;
            const eff = variantCounter ? `${seedBasis}|v${variantCounter}` : seedBasis;
            twistText.textContent = generateTwist(eff || lastEffectiveSeed || `${industryEl.value}|${typeEl.value}`);
            twistRow.style.display = '';
          } else {
            twistText.textContent = '';
            twistRow.style.display = 'none';
          }
        } else {
          // No result yet; just set visibility
          twistRow.style.display = includeTwist ? '' : 'none';
        }
      }
    });
  }
});

