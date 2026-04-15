// === BRUMA — Language & Interactions ===

let currentLang = localStorage.getItem('bruma-lang') || 'es';

function setLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;

  // Toggle button active states
  document.getElementById('btn-es').classList.toggle('active', lang === 'es');
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');

  // Update all text nodes with data-es / data-en
  document.querySelectorAll('[data-es]').forEach(el => {
    const val = lang === 'es' ? el.dataset.es : el.dataset.en;
    if (val !== undefined) el.innerHTML = val;
  });

  // Placeholders
  document.querySelectorAll('[data-es-placeholder]').forEach(el => {
    el.placeholder = lang === 'es' ? el.dataset.esPlaceholder : el.dataset.enPlaceholder;
  });

  document.title = lang === 'es'
    ? 'Bruma — Café & Arte · CDMX'
    : 'Bruma — Coffee & Art · CDMX';

  localStorage.setItem('bruma-lang', lang);
}

// Apply saved language on load
setLang(currentLang);

// === Sticky nav ===
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// === Scroll reveal ===
const revealTargets = document.querySelectorAll(
  '.about-text, .about-scrapbook, .origin-card, .menu-board, ' +
  '.art-header, .art-polaroid, .ex-card, .art-quote, ' +
  '.event-card, .visit-info, .visit-img-col, .footer-cta h2, .footer-cta .cta-row'
);

revealTargets.forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 4) * 0.1}s`;
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

revealTargets.forEach(el => observer.observe(el));
