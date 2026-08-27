/* OWN — Wizard & Site Interactivity */

let currentStep = 1;
const selections = {
  1: null,
  2: null,
  3: [],
  4: null,
  5: null,
  6: [],
  7: null
};

const stepNames = {
  1: 'Protein Level',
  2: 'Protein Source',
  3: 'Add-ons',
  4: 'Base',
  5: 'Sweetener',
  6: 'Toppings',
  7: 'Coating'
};

function goToStep(step) {
  currentStep = step;

  document.querySelectorAll('.wizard__step-content').forEach(el => {
    el.style.display = 'none';
  });
  const target = document.querySelector(`.wizard__step-content[data-step="${step}"]`);
  if (target) {
    target.style.display = 'block';
    target.classList.remove('step-enter');
    void target.offsetWidth;
    target.classList.add('step-enter');
  }

  document.querySelectorAll('.wizard-step').forEach(el => {
    const s = parseInt(el.dataset.step);
    el.classList.remove('wizard-step--active', 'wizard-step--done');
    if (s === step) {
      el.classList.add('wizard-step--active');
    } else if (isStepCompleted(s)) {
      el.classList.add('wizard-step--done');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function isStepCompleted(step) {
  const val = selections[step];
  if (Array.isArray(val)) return val.length > 0;
  return val !== null;
}

function selectOption(card, step, value) {
  const container = card.closest('.wizard__step-content');
  container.querySelectorAll('.opt-card').forEach(c => {
    c.classList.remove('opt-card--selected');
  });
  card.classList.add('opt-card--selected');
  selections[step] = value;
  updateSummary();

  if (step < 7) {
    setTimeout(() => goToStep(step + 1), 400);
  }
}

function toggleOption(card, step, value, maxCount) {
  const arr = selections[step];
  const idx = arr.indexOf(value);

  if (value === 'No Add-on' || value === 'No Toppings') {
    const container = card.closest('.wizard__step-content');
    container.querySelectorAll('.opt-card').forEach(c => {
      c.classList.remove('opt-card--selected');
    });
    selections[step] = [value];
    card.classList.add('opt-card--selected');
    updateSummary();
    return;
  }

  const noIdx = arr.indexOf('No Add-on');
  if (noIdx > -1) arr.splice(noIdx, 1);
  const noIdx2 = arr.indexOf('No Toppings');
  if (noIdx2 > -1) arr.splice(noIdx2, 1);

  const container = card.closest('.wizard__step-content');
  container.querySelectorAll('.opt-card').forEach(c => {
    const nameEl = c.querySelector('.opt-card__name');
    if (nameEl && (nameEl.textContent === 'No Add-on' || nameEl.textContent === 'No Toppings')) {
      c.classList.remove('opt-card--selected');
    }
  });

  if (idx > -1) {
    arr.splice(idx, 1);
    card.classList.remove('opt-card--selected');
  } else {
    if (arr.length >= maxCount) return;
    arr.push(value);
    card.classList.add('opt-card--selected');
  }

  updateSummary();
}

function updateSummary() {
  const empty = document.getElementById('summaryEmpty');
  const content = document.getElementById('summaryContent');

  const hasAny = Object.values(selections).some(v =>
    Array.isArray(v) ? v.length > 0 : v !== null
  );

  if (!hasAny) {
    if (empty) empty.style.display = 'block';
    if (content) content.style.display = 'none';
    return;
  }

  if (empty) empty.style.display = 'none';
  if (content) content.style.display = 'block';

  const details = document.getElementById('summaryDetails');
  if (details) {
    let html = '';
    for (let i = 1; i <= 7; i++) {
      const val = selections[i];
      const display = Array.isArray(val) ? val.join(', ') : val;
      if (display) {
        html += `<div class="summary__row">
          <span class="summary__row-label">${stepNames[i]}</span>
          <span class="summary__row-value">${display}</span>
        </div>`;
      }
    }
    details.innerHTML = html;
  }
}

function setSize(size) {
  document.querySelectorAll('.size-toggle__opt').forEach(el => {
    el.classList.remove('size-toggle__opt--active');
    if (el.textContent.trim() === size) el.classList.add('size-toggle__opt--active');
  });
}

function resetWizard() {
  for (let i = 1; i <= 7; i++) {
    selections[i] = Array.isArray(selections[i]) ? [] : null;
  }
  document.querySelectorAll('.opt-card--selected').forEach(c => {
    c.classList.remove('opt-card--selected');
  });
  updateSummary();
  goToStep(1);
}

/* Add to Cart from wizard */
function addToCart() {
  var required = [1, 2, 4, 5, 7];
  for (var i = 0; i < required.length; i++) {
    var s = required[i];
    var val = selections[s];
    if (val === null || (Array.isArray(val) && val.length === 0)) {
      goToStep(s);
      return;
    }
  }

  var cart = [];
  try { cart = JSON.parse(localStorage.getItem('ownCart') || '[]'); } catch(e) {}

  var name = (selections[2] || '') + ' + ' + (selections[4] || '');
  if (selections[7] && selections[7] !== 'No Coating') name += ' + ' + selections[7];

  var item = {
    type: 'Custom Bar',
    name: name,
    selections: JSON.parse(JSON.stringify(selections)),
    size: document.querySelector('.size-toggle__opt--active') ?
      document.querySelector('.size-toggle__opt--active').textContent.trim() : 'Medium',
    qty: 1,
    price: 5.96
  };

  cart.push(item);
  localStorage.setItem('ownCart', JSON.stringify(cart));

  var badge = document.querySelector('.nav__badge');
  if (badge) badge.textContent = cart.length + 2;

  var btn = document.getElementById('summaryAddBtn');
  if (btn) {
    btn.textContent = 'Added to Cart!';
    btn.style.background = 'var(--success)';
    setTimeout(function() {
      btn.textContent = 'Add to Cart — $1.49/bar';
      btn.style.background = '';
    }, 2000);
  }
}

/* Hero image rotator */
(function() {
  const slides = document.querySelectorAll('.hero__slide');
  if (slides.length < 2) return;
  let current = 0;
  setInterval(function() {
    slides[current].classList.remove('hero__slide--active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('hero__slide--active');
  }, 4000);
})();

/* Scroll reveal */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal--visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* Stagger observer — for ingredients, timeline steps, etc */
var staggerObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      staggerObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.ingredient, .timeline__step').forEach(function(el, i) {
  el.style.transitionDelay = (i * 0.08) + 's';
  staggerObserver.observe(el);
});

/* Stat counter animation */
function animateCounter(el, target) {
  var start = 0;
  var suffix = '';
  var num = parseFloat(target);
  if (isNaN(num)) return;
  if (target.indexOf('+') > -1) suffix = '+';
  if (target.indexOf('g') > -1) suffix = 'g';
  var duration = 1200;
  var startTime = null;
  function step(ts) {
    if (!startTime) startTime = ts;
    var progress = Math.min((ts - startTime) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    var current = Math.round(eased * num);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else { el.textContent = target; el.classList.add('counted'); }
  }
  requestAnimationFrame(step);
}

var counterObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      var el = entry.target;
      var target = el.textContent.trim();
      el.textContent = '0';
      animateCounter(el, target);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.hero__stat-value').forEach(function(el) {
  counterObserver.observe(el);
});

/* Ripple effect on wizard card click */
document.addEventListener('click', function(e) {
  var card = e.target.closest('.opt-card, .opt-tile');
  if (!card) return;
  var existing = card.querySelector('.ripple');
  if (existing) existing.remove();
  var ripple = document.createElement('span');
  ripple.className = 'ripple';
  var rect = card.getBoundingClientRect();
  ripple.style.left = (e.clientX - rect.left - 10) + 'px';
  ripple.style.top = (e.clientY - rect.top - 10) + 'px';
  card.appendChild(ripple);
  setTimeout(function() { ripple.remove(); }, 600);
  card.classList.remove('just-selected');
  void card.offsetWidth;
  card.classList.add('just-selected');
  setTimeout(function() { card.classList.remove('just-selected'); }, 400);
});

/* Filter buttons & chips */
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('filter-btn')) {
    e.target.classList.toggle('filter-btn--active');
  }
  if (e.target.classList.contains('filter-chip')) {
    const parent = e.target.closest('.filter-chips');
    if (parent) {
      parent.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('filter-chip--active'));
      e.target.classList.add('filter-chip--active');
    }
  }
});

/* Cart quantity buttons */
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.c-item__qty-btn');
  if (!btn) return;
  const container = btn.closest('.c-item__qty');
  const valueEl = container.querySelector('.c-item__qty-val');
  let val = parseInt(valueEl.textContent);
  if (btn.textContent.trim() === '+') val++;
  else if (val > 1) val--;
  valueEl.textContent = val;
});

/* Coach profile toggle */
document.addEventListener('click', function(e) {
  const profile = e.target.closest('.coach-profile');
  if (!profile) return;
  const parent = profile.closest('.coach-profiles');
  parent.querySelectorAll('.coach-profile').forEach(p => p.classList.remove('coach-profile--active'));
  profile.classList.add('coach-profile--active');
});

/* Fulfillment toggle */
document.addEventListener('click', function(e) {
  const option = e.target.closest('.fulfill-opt');
  if (!option) return;
  const parent = option.closest('.fulfill-toggle');
  parent.querySelectorAll('.fulfill-opt').forEach(o => {
    o.classList.remove('fulfill-opt--active');
  });
  option.classList.add('fulfill-opt--active');
});
