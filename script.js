/* =============================================
   BRUMA — script.js
   ============================================= */

// --- Language Toggle ---
let currentLang = 'es';

const langToggle = document.getElementById('langToggle');
const esOpt = document.getElementById('es-opt');
const enOpt = document.getElementById('en-opt');

function setLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;

  // Toggle active state on buttons
  esOpt.classList.toggle('active', lang === 'es');
  enOpt.classList.toggle('active', lang === 'en');

  // Update all elements with data-es / data-en attributes
  document.querySelectorAll('[data-es]').forEach(el => {
    const text = lang === 'es' ? el.dataset.es : el.dataset.en;
    if (!text) return;
    // Use innerHTML to support <br/> and <em> in attribute values
    el.innerHTML = text;
  });

  // Update input placeholders separately
  document.querySelectorAll('[data-es-placeholder]').forEach(el => {
    el.placeholder = lang === 'es' ? el.dataset.esPlaceholder : el.dataset.enPlaceholder;
  });

  // Update page title
  document.title = lang === 'es'
    ? 'Bruma — Café & Arte · CDMX'
    : 'Bruma — Coffee & Art · CDMX';

  // Persist preference
  localStorage.setItem('bruma-lang', lang);
}

langToggle.addEventListener('click', () => {
  setLang(currentLang === 'es' ? 'en' : 'es');
});

// Restore saved language
const savedLang = localStorage.getItem('bruma-lang');
if (savedLang && savedLang !== 'es') setLang(savedLang);


// --- Nav scroll effect ---
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });


// --- Scroll fade-in ---
const fadeEls = document.querySelectorAll(
  '.about-text-col, .about-image-col, .origin-card, .menu-col, ' +
  '.art-intro, .art-item, .exhibition-card, .art-quote, ' +
  '.visit-text, .stat, .footer-cta h2'
);

fadeEls.forEach(el => el.classList.add('fade-in'));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

fadeEls.forEach(el => observer.observe(el));


// --- Staggered fade for grid children ---
document.querySelectorAll('.origins-grid, .menu-cols, .exhibition-grid').forEach(grid => {
  Array.from(grid.children).forEach((child, i) => {
    child.style.transitionDelay = `${i * 0.12}s`;
  });
});
