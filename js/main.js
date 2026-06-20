// main.js - Entry point

import { initMenu } from './menu.js';
import { initLightbox } from './modal.js';
import { initValidation } from './validation.js';

// ---------- Scroll reveal ----------
function initReveal() {
  const elements = document.querySelectorAll('.reveal, .reveal-stagger');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -3% 0px' });

  elements.forEach((el) => observer.observe(el));
}

// ---------- Counter-up ----------
function countUp(el, target, duration = 1800) {
  const start = performance.now();
  const isFloat = target % 1 !== 0;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 4);
    const value = isFloat ? (ease * target).toFixed(1) : Math.round(ease * target);
    el.textContent = value;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        countUp(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach((el) => observer.observe(el));
}

// ---------- Header scroll state ----------
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        header.classList.toggle('is-scrolled', window.scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// ---------- Hero spotlight ----------
function initSpotlight() {
  const spotlight = document.querySelector('.hero__spotlight');
  const hero = document.querySelector('.hero');
  if (!spotlight || !hero) return;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    spotlight.style.setProperty('--mx', `${x}%`);
    spotlight.style.setProperty('--my', `${y}%`);
  }, { passive: true });
}

// ---------- Hero image load animation ----------
function initHeroLoad() {
  const hero = document.querySelector('.hero');
  const img = hero?.querySelector('.hero__bg img');
  if (!hero || !img) return;

  if (img.complete) {
    hero.classList.add('is-loaded');
  } else {
    img.addEventListener('load', () => hero.classList.add('is-loaded'));
  }
}

// ---------- Gallery filters ----------
function initGalleryFilters() {
  const filters = document.querySelectorAll('.gallery__filter');
  const items = document.querySelectorAll('.gallery__grid-item');
  if (!filters.length || !items.length) return;

  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
      filters.forEach((f) => f.classList.remove('is-active'));
      filter.classList.add('is-active');

      const style = filter.dataset.filter;

      items.forEach((item) => {
        if (style === 'all' || item.dataset.style === style) {
          item.style.display = '';
          requestAnimationFrame(() => {
            item.style.opacity = '1';
            item.style.transform = '';
          });
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => { item.style.display = 'none'; }, 300);
        }
      });
    });
  });
}

// ---------- FAQ accordion ----------
function initFAQ() {
  const items = document.querySelectorAll('.faq__item');
  if (!items.length) return;

  items.forEach((item) => {
    const question = item.querySelector('.faq__question');
    question?.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      // Close all
      items.forEach((i) => i.classList.remove('is-open'));
      // Open clicked if it was closed
      if (!isOpen) item.classList.add('is-open');
    });
  });
}

// ---------- Smooth scroll for anchor links ----------
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// ---------- Quiz logic ----------
function initQuiz() {
  const quiz = document.querySelector('.quiz__wrap');
  if (!quiz) return;

  let currentStep = 1;
  const totalSteps = 5;
  const answers = {
    style: null,
    layout: null,
    material: null,
    width: 3.0,
    height: 2.5,
    name: '',
    phone: ''
  };

  const steps = quiz.querySelectorAll('.quiz__step');
  const progressFill = quiz.querySelector('.quiz__progress-fill');
  const progressText = quiz.querySelector('.quiz__progress-text');
  const btnNext = quiz.querySelector('#quiz-next');
  const btnPrev = quiz.querySelector('#quiz-prev');

  function updateProgress() {
    const pct = (currentStep / totalSteps) * 100;
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressText) progressText.textContent = `${currentStep} / ${totalSteps}`;
  }

  function goToStep(n) {
    steps.forEach((s) => s.classList.remove('is-active'));
    const next = quiz.querySelector(`[data-step="${n}"]`);
    if (next) next.classList.add('is-active');
    currentStep = n;
    updateProgress();

    if (btnPrev) btnPrev.style.display = n > 1 ? 'flex' : 'none';
    if (btnNext) {
      if (n === totalSteps) {
        btnNext.textContent = 'Отправить заявку';
      } else {
        btnNext.textContent = 'Далее';
      }
    }

    if (n === 4) updateCalcResult();
  }

  // Card selections
  quiz.querySelectorAll('.quiz__card').forEach((card) => {
    card.addEventListener('click', () => {
      const group = card.dataset.group;
      quiz.querySelectorAll(`[data-group="${group}"]`).forEach((c) => c.classList.remove('is-selected'));
      card.classList.add('is-selected');
      if (group === 'style') answers.style = card.dataset.value;
    });
  });

  quiz.querySelectorAll('.quiz__layout').forEach((btn) => {
    btn.addEventListener('click', () => {
      quiz.querySelectorAll('.quiz__layout').forEach((b) => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      answers.layout = btn.dataset.value;
    });
  });

  quiz.querySelectorAll('.quiz__material').forEach((mat) => {
    mat.addEventListener('click', () => {
      quiz.querySelectorAll('.quiz__material').forEach((m) => m.classList.remove('is-selected'));
      mat.classList.add('is-selected');
      answers.material = mat.dataset.value;
    });
  });

  // Size inputs
  const widthInput = quiz.querySelector('#quiz-width');
  const heightInput = quiz.querySelector('#quiz-height');

  widthInput?.addEventListener('input', () => {
    answers.width = parseFloat(widthInput.value) || 3.0;
    updateCalcResult();
  });

  heightInput?.addEventListener('input', () => {
    answers.height = parseFloat(heightInput.value) || 2.5;
    updateCalcResult();
  });

  function updateCalcResult() {
    const basePrice = 40000;
    const perimeterMeters = (answers.width + answers.height) * 2;
    const materialMultiplier = { enamel: 1.0, veneer: 1.3, plastic: 0.9, massiv: 1.6 };
    const mult = materialMultiplier[answers.material] || 1.0;
    const total = Math.round(basePrice * perimeterMeters * mult / 1000) * 1000;
    const resultEl = quiz.querySelector('#quiz-price');
    if (resultEl) {
      resultEl.textContent = total.toLocaleString('ru-RU') + ' ₽';
    }
  }

  // Navigation
  btnNext?.addEventListener('click', () => {
    if (currentStep < totalSteps) {
      goToStep(currentStep + 1);
    } else {
      submitQuiz();
    }
  });

  btnPrev?.addEventListener('click', () => {
    if (currentStep > 1) goToStep(currentStep - 1);
  });

  function submitQuiz() {
    const nameEl = quiz.querySelector('#quiz-name');
    const phoneEl = quiz.querySelector('#quiz-phone');
    const phoneCleaned = (phoneEl?.value || '').replace(/\D/g, '');
    if (!nameEl?.value.trim() || phoneCleaned.length < 10) {
      phoneEl?.classList.add('shake');
      phoneEl?.classList.add('is-error');
      setTimeout(() => {
        phoneEl?.classList.remove('shake');
      }, 500);
      return;
    }
    phoneEl?.classList.remove('is-error');
    showModal();
  }

  updateProgress();
}

// ---------- Calculator ----------
function initCalculator() {
  const calc = document.querySelector('.calculator');
  if (!calc) return;

  const inputs = calc.querySelectorAll('.calc__input');
  const lengthSlider = calc.querySelector('#calc-length');
  const resultEl = calc.querySelector('#calc-result');
  const breakdownBody = calc.querySelector('#calc-breakdown');

  const PRICES = {
    econom: 40000,
    standart: 65000,
    premium: 110000
  };

  function getValues() {
    const width = parseFloat(calc.querySelector('#calc-width')?.value) || 3;
    const depth = parseFloat(calc.querySelector('#calc-depth')?.value) || 0.6;
    const length = parseFloat(lengthSlider?.value) || 3;
    const level = calc.querySelector('#calc-level')?.value || 'standart';
    return { width, depth, length, level };
  }

  function calculate() {
    const { width, length, level } = getValues();
    const perMeter = PRICES[level] || PRICES.standart;
    const totalMeters = Math.max(width, 2);
    const base = totalMeters * perMeter;
    const installation = Math.round(base * 0.15);
    const delivery = 5000;
    const total = base + installation + delivery;

    if (resultEl) {
      animatePrice(resultEl, total);
    }

    if (breakdownBody) {
      breakdownBody.innerHTML = `
        <div class="calc__breakdown-row">
          <span class="calc__breakdown-name">Корпуса и фасады</span>
          <span class="calc__breakdown-value">${base.toLocaleString('ru-RU')} ₽</span>
        </div>
        <div class="calc__breakdown-row">
          <span class="calc__breakdown-name">Монтаж</span>
          <span class="calc__breakdown-value">${installation.toLocaleString('ru-RU')} ₽</span>
        </div>
        <div class="calc__breakdown-row">
          <span class="calc__breakdown-name">Доставка</span>
          <span class="calc__breakdown-value">${delivery.toLocaleString('ru-RU')} ₽</span>
        </div>
      `;
    }
  }

  function animatePrice(el, target) {
    const start = performance.now();
    const duration = 600;
    const startVal = parseInt(el.dataset.current || '0');
    el.dataset.current = target;

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(startVal + (target - startVal) * ease);
      el.textContent = `от ${val.toLocaleString('ru-RU')} ₽`;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // Slider label update
  if (lengthSlider) {
    const lengthLabel = calc.querySelector('#calc-length-label');
    lengthSlider.addEventListener('input', () => {
      if (lengthLabel) lengthLabel.textContent = `${lengthSlider.value} м`;
      calculate();
    });
  }

  inputs.forEach((inp) => inp.addEventListener('input', calculate));
  calc.querySelectorAll('.calc__select').forEach((sel) => sel.addEventListener('change', calculate));

  // Initial calc
  calculate();
}

// ---------- Modal success ----------
function showModal() {
  const modal = document.querySelector('#modal-success');
  if (!modal) return;
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function initModalClose() {
  const modal = document.querySelector('#modal-success');
  const overlay = modal?.querySelector('.modal__overlay');
  const closeBtn = modal?.querySelector('.modal__close');
  const okBtn = modal?.querySelector('#modal-ok');

  function closeModal() {
    modal?.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  overlay?.addEventListener('click', closeModal);
  closeBtn?.addEventListener('click', closeModal);
  okBtn?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

// ---------- Init all ----------
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMenu();
  initHeroLoad();
  initSpotlight();
  initReveal();
  initCounters();
  initGalleryFilters();
  initLightbox();
  initFAQ();
  initSmoothScroll();
  initQuiz();
  initCalculator();
  initValidation();
  initModalClose();
});
