// =============================================================================
// THE BLUEPRINT METHOD — APP CONTROLLER
// State machine + Apple-style parallax/reveals + email/Stripe glue.
// =============================================================================

// ---------------------------------------------------------------------------
// CONFIGURATION — edit these to monetize
// ---------------------------------------------------------------------------
const CONFIG = {
  // Checkout URL — currently Revolut, was originally Stripe. Same pattern: any payment link works here.
  STRIPE_PAYMENT_LINK: 'https://checkout.revolut.com/pay/cbde0607-8a14-4e6c-ac59-fd06d17dd645',
  EMAIL_ENDPOINT: '/api/subscribe',

  CATEGORY_LABELS: {
    market_entry_strategy:     'Market Entry Strategy',
    offer_architecture:        'Offer Architecture',
    service_delivery_model:    'Service Delivery Model',
    conversion_pathway:        'Conversion Pathway',
    brand_messaging_framework: 'Brand Messaging',
    content_strategy:          'Content Strategy',
    pricing_structure:         'Pricing Structure'
  },

  CATEGORY_TAGLINES: {
    market_entry_strategy:     'How you launch and create momentum.',
    offer_architecture:        "What you sell and how it's structured.",
    service_delivery_model:    'How you fulfil and serve clients.',
    conversion_pathway:        'The buyer journey from awareness to purchase.',
    brand_messaging_framework: 'How you communicate and position.',
    content_strategy:          'What you create and publish.',
    pricing_structure:         'How you frame and hold price.'
  }
};

// ---------------------------------------------------------------------------
// STATE
// ---------------------------------------------------------------------------
const state = {
  dob:        { day: null, month: null, year: null },
  fullName:   '',
  responses:  {},
  chart:      null,
  blueprint:  null,
  unlocked:        false,
  gateDismissed:   false
};

// ---------------------------------------------------------------------------
// QUESTIONS
// ---------------------------------------------------------------------------
const QUESTIONS = [
  { key: 'visibility',         text: 'I am comfortable being visible when I sell.' },
  { key: 'structure',          text: 'I prefer clear plans and repeatable systems.' },
  { key: 'experimentation',    text: 'I like novelty, fast pivots, and testing.' },
  { key: 'depth',              text: 'I prefer deep client relationships over volume.' },
  { key: 'authority',          text: 'I am comfortable taking a strong position.' },
  { key: 'capacity',           text: 'I can deliver consistently without strain.' },
  { key: 'nurture',            text: 'I am willing to warm leads over time.' },
  { key: 'teaching',           text: 'I like explaining, teaching, and breaking things down.' },
  { key: 'complexity',         text: 'I can manage multi-step systems and funnels.' },
  { key: 'premiumConfidence',  text: 'I am comfortable charging higher prices.' },
  { key: 'proofConfidence',    text: 'I trust the results I can get for people.' },
  { key: 'directness',         text: 'I prefer direct calls to action over subtle invitation.' }
];

const SCALE_LABELS = ['Strongly disagree', 'Strongly agree'];

// ---------------------------------------------------------------------------
// SCREEN ROUTING — uses .active class on .screen elements
// ---------------------------------------------------------------------------
function goToScreen(name) {
  document.querySelectorAll('.screen').forEach(el => {
    el.classList.remove('active');
    el.setAttribute('aria-hidden', 'true');
  });
  const target = document.getElementById('screen-' + name);
  if (target) {
    target.classList.add('active');
    target.removeAttribute('aria-hidden');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  // Refresh nav theming after switching screens
  setTimeout(updateNavTheme, 0);
}

// ---------------------------------------------------------------------------
// DOB step
// ---------------------------------------------------------------------------
function submitDOB() {
  const day   = parseInt(document.getElementById('dob-day').value, 10);
  const month = parseInt(document.getElementById('dob-month').value, 10);
  const year  = parseInt(document.getElementById('dob-year').value, 10);
  const errEl = document.getElementById('dob-error');
  errEl.classList.add('hidden');

  if (!day || !month || !year) return showError(errEl, 'Please fill in day, month and year.');
  if (year < 1900 || year > 2015) return showError(errEl, 'Year must be between 1900 and 2015.');
  const test = new Date(year, month - 1, day);
  if (test.getDate() !== day || test.getMonth() !== month - 1 || test.getFullYear() !== year) {
    return showError(errEl, "That date doesn't look valid. Please check.");
  }
  state.dob = { day, month, year };
  goToScreen('name');
}

// ---------------------------------------------------------------------------
// Name step
// ---------------------------------------------------------------------------
function submitName() {
  const name = document.getElementById('name-input').value.trim();
  const errEl = document.getElementById('name-error');
  errEl.classList.add('hidden');
  if (name.length < 2) return showError(errEl, 'Please enter at least 2 characters.');
  if (name.length > 100) return showError(errEl, 'Name is too long.');
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return showError(errEl, 'Letters, spaces, hyphens and apostrophes only.');
  }
  state.fullName = name;
  renderQuiz();
  goToScreen('quiz');
}

function showError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
}

// ---------------------------------------------------------------------------
// Quiz
// ---------------------------------------------------------------------------
function renderQuiz() {
  const root = document.getElementById('quiz-questions');
  root.innerHTML = QUESTIONS.map((q, i) => `
    <div class="quiz-card" data-q="${q.key}"
         role="group" aria-labelledby="ql-${i}">
      <p class="quiz-num">${String(i + 1).padStart(2, '0')} / 12</p>
      <p class="quiz-text" id="ql-${i}">${q.text}</p>
      <div class="quiz-scale">
        ${[1,2,3,4,5].map(n => `
          <button class="scale-btn"
            onclick="answerQuestion('${q.key}', ${n})"
            data-val="${n}"
            aria-label="${n} — ${n === 1 ? SCALE_LABELS[0] : n === 5 ? SCALE_LABELS[1] : 'Neutral'}">${n}</button>
        `).join('')}
      </div>
      <div class="scale-labels">
        <span>${SCALE_LABELS[0]}</span>
        <span>${SCALE_LABELS[1]}</span>
      </div>
    </div>
  `).join('');
  updateQuizState();
}

function answerQuestion(key, value) {
  state.responses[key] = value;
  const card = document.querySelector(`[data-q="${key}"]`);
  if (card) {
    card.classList.add('answered');
    card.querySelectorAll('.scale-btn').forEach(b => {
      b.classList.toggle('selected', parseInt(b.dataset.val, 10) === value);
    });
  }
  updateQuizState();
}

function updateQuizState() {
  const answered = Object.keys(state.responses).length;
  const total = QUESTIONS.length;
  document.getElementById('quiz-counter').textContent = `${answered} of ${total}`;
  document.getElementById('quiz-progress').style.width = (75 + 25 * answered / total) + '%';
  document.getElementById('quiz-submit').disabled = answered < total;
}

// ---------------------------------------------------------------------------
// Calculate
// ---------------------------------------------------------------------------
function submitQuiz() {
  goToScreen('loading');
  const messages = [
    'Reading the numbers',
    'Mapping the unseen patterns',
    'Aligning how you actually work',
    'Drawing your blueprint'
  ];
  let i = 0;
  const msgEl = document.getElementById('loading-msg');
  const interval = setInterval(() => {
    i = (i + 1) % messages.length;
    msgEl.textContent = messages[i];
  }, 700);

  setTimeout(() => {
    try {
      state.chart = BlueprintCalculator.calculateChart(
        state.dob.day, state.dob.month, state.dob.year, state.fullName
      );
      state.blueprint = BlueprintCalculator.calculateBlueprint(state.chart, state.responses);
      clearInterval(interval);
      renderResults();
      goToScreen('results');
      // After paint, kick off reveals + parallax
      requestAnimationFrame(() => {
        observeReveals();
        attachParallax();
      });
    } catch (e) {
      clearInterval(interval);
      console.error(e);
      alert('Something went wrong. Please refresh and try again.');
    }
  }, 2400);
}

// ---------------------------------------------------------------------------
// Render full-bleed parallax results
// ---------------------------------------------------------------------------
function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderResults() {
  const firstName = state.fullName.split(' ')[0];
  document.getElementById('result-firstname').textContent = firstName;

  // Friction pill
  const friction = state.blueprint.frictionLoad;
  const level = state.blueprint.frictionLevel;
  const dot = document.getElementById('friction-dot');
  dot.classList.remove('medium', 'high');
  if (level === 'medium') dot.classList.add('medium');
  if (level === 'high') dot.classList.add('high');
  document.getElementById('friction-text').textContent =
    `Friction load: ${friction} — ${level === 'low' ? 'low, clean alignment' : level === 'medium' ? 'medium, some patterns to watch' : 'high, deliberate practice required'}`;

  // Sort by alignment desc — strongest patterns first
  const cats = Object.entries(state.blueprint.categories)
    .map(([key, val]) => ({ key, ...val }))
    .sort((a, b) => b.alignment - a.alignment);

  const root = document.getElementById('results-cards');
  // Alternate dark / light / grey for visual rhythm
  const themes = ['light', 'dark', 'grey', 'light', 'dark', 'grey', 'light'];

  root.innerHTML = cats.map((c, idx) => {
    const interp = window.INTERPRETATIONS[c.key]?.[c.score] || {};
    const theme = themes[idx];
    const locked = idx >= 1 && !state.unlocked; // first one free, rest locked unless unlocked
    const lockClass = locked ? 'category-locked' : '';
    const lockCta = locked
      ? `<button class="category-locked-cta" onclick="showGate()">Unlock to read</button>`
      : '';
    return `
      <section class="category-section ${theme} ${lockClass}" data-locked="${locked ? '1' : '0'}">
        <div class="category-bg-num" data-parallax="0.35">${c.score}</div>
        <div class="category-content">
          <p class="category-eyebrow reveal">${String(idx + 1).padStart(2, '0')} · ${CONFIG.CATEGORY_LABELS[c.key]}</p>
          <h2 class="category-title reveal reveal-delay-1">${esc(interp.name) || 'Pattern'}</h2>
          <p class="category-tagline reveal reveal-delay-2">${esc(interp.core)}</p>

          <div class="alignment-row reveal reveal-delay-2">
            <span style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; opacity: 0.6;">Alignment</span>
            <div class="alignment-bar"><div class="alignment-fill" data-w="${c.alignment}"></div></div>
            <span class="alignment-pct">${Math.round(c.alignment)}%</span>
          </div>

          <div class="category-grid reveal reveal-delay-3">
            <div class="category-block">
              <p class="label">What to do</p>
              <p>${esc(interp.tactical)}</p>
            </div>
            <div class="category-block avoid">
              <p class="label">What to avoid</p>
              <p style="opacity: 0.85;">${esc(interp.avoid)}</p>
            </div>
          </div>
          ${lockCta}
        </div>
      </section>
    `;
  }).join('');

  // Configure stripe link
  const stripeBtn = document.getElementById('stripe-link');
  if (stripeBtn && CONFIG.STRIPE_PAYMENT_LINK) {
    stripeBtn.href = CONFIG.STRIPE_PAYMENT_LINK;
  }

  // If they're not unlocked yet, show the gate after the first category section
  // becomes visible (so they get a teaser before the prompt).
  if (!state.unlocked) {
    setTimeout(showGateOnScroll, 500);
  } else {
    revealAll();
  }
}

// ---------------------------------------------------------------------------
// Email gate logic — shown after user scrolls past the first category
// ---------------------------------------------------------------------------
function showGate() {
  document.getElementById('gate-overlay').classList.add('active');
  setTimeout(() => document.getElementById('email-input').focus(), 50);
}

function setupFocusTrap() {
  const overlay = document.getElementById('gate-overlay');
  overlay.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    const focusable = Array.from(
      overlay.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])')
    ).filter(el => !el.disabled);
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  });
}

function showGateOnScroll() {
  const sections = document.querySelectorAll('#results-cards .category-section');
  if (sections.length < 2) return;
  const triggerSection = sections[1]; // gate appears as they enter category #2
  const observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting && !state.unlocked && !state.gateDismissed) {
        showGate();
        observer.disconnect();
        return;
      }
    }
  }, { threshold: 0.2 });
  observer.observe(triggerSection);

  // Allow the user to re-open the gate by tapping any locked/blurred card
  document.querySelectorAll('#results-cards .category-section').forEach((sec, idx) => {
    if (idx === 0) return; // first one is free
    sec.style.cursor = 'pointer';
    sec.addEventListener('click', () => {
      if (!state.unlocked) showGate();
    });
  });
}

async function unlockResults() {
  const emailEl = document.getElementById('email-input');
  const email = emailEl.value.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    emailEl.style.borderColor = '#ff3b30';
    emailEl.placeholder = 'Please enter a valid email';
    emailEl.value = '';
    return;
  }

  if (CONFIG.EMAIL_ENDPOINT) {
    try {
      await fetch(CONFIG.EMAIL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: state.fullName,
          blueprint_summary: summarizeBlueprint()
        })
      });
    } catch (e) { console.warn('Email submit failed:', e); }
  }

  try {
    localStorage.setItem('bp_unlocked', '1');
    localStorage.setItem('bp_email', email);
  } catch (_) {}

  state.unlocked = true;
  document.getElementById('gate-overlay').classList.remove('active');
  revealAll();
  showToast('Your blueprint is on its way — check your inbox.');
}

function revealAll() {
  // Force-reveal all sections (in case they're not in view yet)
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
  document.querySelectorAll('.alignment-fill').forEach(el => {
    const w = el.dataset.w;
    if (w) el.style.width = w + '%';
  });
  // Unblur the locked categories now that the user has unlocked
  document.querySelectorAll('.category-section.category-locked').forEach(el => {
    el.classList.remove('category-locked');
    el.dataset.locked = '0';
  });
  document.querySelectorAll('.category-locked-cta').forEach(el => el.remove());
}

// Dismiss the email gate WITHOUT unlocking — user stays in free preview mode
// (first category visible, rest blurred). They can scroll back up to revisit
// what's free, and the overlay won't auto-show again on this scroll.
function dismissGate() {
  document.getElementById('gate-overlay').classList.remove('active');
  // Mark dismissed so the IntersectionObserver doesn't keep popping it
  state.gateDismissed = true;
  showToast("No problem — here's your free preview. Tap any locked card to unlock later.");
}

function summarizeBlueprint() {
  if (!state.blueprint) return null;
  return Object.fromEntries(
    Object.entries(state.blueprint.categories).map(([k, v]) => [
      k, { score: v.score, alignment: Math.round(v.alignment) }
    ])
  );
}

// ---------------------------------------------------------------------------
// Restart
// ---------------------------------------------------------------------------
function restart() {
  state.dob = { day: null, month: null, year: null };
  state.fullName = '';
  state.responses = {};
  state.chart = null;
  state.blueprint = null;
  state.unlocked = false;
  document.getElementById('dob-day').value = '';
  document.getElementById('dob-month').value = '';
  document.getElementById('dob-year').value = '';
  document.getElementById('name-input').value = '';
  document.getElementById('gate-overlay').classList.remove('active');
  goToScreen('landing');
}

// ===========================================================================
// SCROLL EFFECTS — reveal on enter + parallax + nav theming
// ===========================================================================

let revealObserver = null;

function observeReveals() {
  if (revealObserver) revealObserver.disconnect();
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // If this section has alignment bars, animate them in
        entry.target.parentElement?.querySelectorAll?.('.alignment-fill')?.forEach(bar => {
          const w = bar.dataset.w;
          if (w) bar.style.width = w + '%';
        });
        // Also handle alignment fills inside the same section
        entry.target.querySelectorAll?.('.alignment-fill')?.forEach(bar => {
          const w = bar.dataset.w;
          if (w) bar.style.width = w + '%';
        });
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -8% 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => {
    if (!el.classList.contains('in-view')) revealObserver.observe(el);
  });
}

// Parallax — drives slow-moving background elements off scroll position
let rafScheduled = false;
function attachParallax() {
  if (window.__parallaxAttached) return;
  window.__parallaxAttached = true;

  const onScroll = () => {
    if (rafScheduled) return;
    rafScheduled = true;
    requestAnimationFrame(() => {
      rafScheduled = false;
      const y = window.scrollY || window.pageYOffset;
      const vh = window.innerHeight;

      // Hero background numbers — float at varied speeds
      document.querySelectorAll('#heroBg span').forEach(el => {
        const speed = parseFloat(el.dataset.speed || '0.3');
        el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
      });

      // Hero content (logo + headline + buttons) — slow fade + drift up as you scroll past hero
      const heroContent = document.querySelector('.hero .hero-content');
      if (heroContent) {
        const fadeDistance = vh * 0.65;
        const progress = Math.min(1, Math.max(0, y / fadeDistance));
        const drift = -y * 0.35;
        const opacity = 1 - progress;
        heroContent.style.transform = `translate3d(0, ${drift}px, 0)`;
        heroContent.style.opacity = String(opacity);
      }

      // Category background numbers — strong parallax against scroll
      document.querySelectorAll('[data-parallax]').forEach(el => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - vh / 2;
        const speed = parseFloat(el.dataset.parallax || '0.35');
        const offset = -center * speed;
        el.style.transform = `translate3d(0, calc(-50% + ${offset}px), 0)`;
      });
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function updateNavTheme() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  // Find the active screen's first section
  const activeScreen = document.querySelector('.screen.active');
  if (!activeScreen) return;

  // Find the section currently under the nav (top: 60)
  const probe = document.elementFromPoint(window.innerWidth / 2, 60);
  if (!probe) return;
  const section = probe.closest('section, .form-section, .upsell-section, .loader-section');
  if (!section) return;

  // Determine if this section is "light" or "dark"
  const cs = window.getComputedStyle(section);
  const bg = cs.backgroundColor;
  // Parse rgb to brightness
  const m = bg.match(/rgb[a]?\(([^)]+)\)/);
  if (!m) return;
  const [r, g, b] = m[1].split(',').map(s => parseInt(s.trim(), 10));
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  if (brightness > 160) nav.classList.add('light');
  else nav.classList.remove('light');
}

// ===========================================================================
// INIT
// ===========================================================================
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 5000);
}

document.addEventListener('DOMContentLoaded', () => {
  setupFocusTrap();
  // Restore unlock state for returning visitors
  try {
    if (localStorage.getItem('bp_unlocked') === '1') state.unlocked = true;
  } catch (_) {}
  // Keyboard helpers
  document.getElementById('dob-year')?.addEventListener('keydown', e => { if (e.key === 'Enter') submitDOB(); });
  document.getElementById('name-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') submitName(); });
  document.getElementById('email-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') unlockResults(); });

  // Scroll handlers
  observeReveals();
  attachParallax();

  window.addEventListener('scroll', () => {
    requestAnimationFrame(updateNavTheme);
  }, { passive: true });
  updateNavTheme();
});
