/* ═══════════════════════════════════════════════
   BRUMA · script.js
   Effects: grain canvas, custom cursor, 3D tilt,
   magnetic buttons, text scramble, paint-wipe
   reveal, stat counters, parallax
   ═══════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────
   1. LANGUAGE TOGGLE
   ───────────────────────────────────────────── */
let currentLang = localStorage.getItem('bruma-lang') || 'es';

window.setLang = function(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;

  document.getElementById('btn-es').classList.toggle('active', lang === 'es');
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');

  document.querySelectorAll('[data-es]').forEach(el => {
    const val = lang === 'es' ? el.dataset.es : el.dataset.en;
    if (val !== undefined) el.innerHTML = val;
  });

  document.querySelectorAll('[data-es-placeholder]').forEach(el => {
    el.placeholder = lang === 'es' ? el.dataset.esPlaceholder : el.dataset.enPlaceholder;
  });

  document.title = lang === 'es'
    ? 'Bruma — Café & Arte · CDMX'
    : 'Bruma — Coffee & Art · CDMX';

  localStorage.setItem('bruma-lang', lang);
};

setLang(currentLang);


/* ─────────────────────────────────────────────
   2. ANIMATED FILM GRAIN (canvas)
   Renders new noise every frame — vintage feel
   ───────────────────────────────────────────── */
(function initGrain() {
  const canvas = document.getElementById('grain');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h, frame = 0;

  function resize() {
    w = canvas.width  = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function tick() {
    // Only redraw every 3 frames for performance
    if (frame % 3 === 0) {
      const img = ctx.createImageData(w, h);
      const d   = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        d[i] = d[i+1] = d[i+2] = v;
        d[i+3] = 22;
      }
      ctx.putImageData(img, 0, 0);
    }
    frame++;
    requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  tick();
})();


/* ─────────────────────────────────────────────
   3. CUSTOM CURSOR — dot + lagging ring
   ───────────────────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('c-dot');
  const ring = document.getElementById('c-ring');
  if (!dot || !ring) return;
  if (window.matchMedia('(hover:none)').matches) return;

  let mx = 0, my = 0, rx = 0, ry = 0;
  const lag = 0.11;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  }, { passive: true });

  document.addEventListener('mousedown',  () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup',    () => document.body.classList.remove('cursor-click'));

  // Hover state on interactive elements
  const hoverEls = document.querySelectorAll('a, button, .artwork, .polaroid, .origin-card');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  function loop() {
    rx += (mx - rx) * lag;
    ry += (my - ry) * lag;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  }
  loop();
})();


/* ─────────────────────────────────────────────
   4. 3-D TILT on polaroids
   Mouse position → rotateX/Y via perspective
   ───────────────────────────────────────────── */
(function initTilt() {
  document.querySelectorAll('.polaroid').forEach(card => {
    const base = parseFloat(card.dataset.baseRotate || 0);

    card.addEventListener('mousemove', e => {
      const r   = card.getBoundingClientRect();
      const x   = (e.clientX - r.left) / r.width  - 0.5;
      const y   = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transition = 'box-shadow .4s ease';
      card.style.transform  =
        `rotate(${base}deg) rotateX(${-y * 14}deg) rotateY(${x * 14}deg) scale(1.04)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = `transform .6s cubic-bezier(0.34,1.56,0.64,1)`;
      card.style.transform  = `rotate(${base}deg)`;
    });
  });
})();


/* ─────────────────────────────────────────────
   5. MAGNETIC BUTTONS
   Elements gently pull toward cursor
   ───────────────────────────────────────────── */
(function initMagnetic() {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r    = el.getBoundingClientRect();
      const dx   = e.clientX - (r.left + r.width  / 2);
      const dy   = e.clientY - (r.top  + r.height / 2);
      el.style.transition = 'transform .1s ease';
      el.style.transform  = `translate(${dx * 0.28}px, ${dy * 0.28}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transition = `transform .55s cubic-bezier(0.34,1.56,0.64,1)`;
      el.style.transform  = '';
    });
  });
})();


/* ─────────────────────────────────────────────
   6. TEXT SCRAMBLE on [data-scramble] elements
   Random chars resolve to real text on hover
   ───────────────────────────────────────────── */
(function initScramble() {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%';

  document.querySelectorAll('[data-scramble]').forEach(el => {
    let interval = null;

    el.addEventListener('mouseenter', () => {
      const target = el.dataset.es
        ? (currentLang === 'es' ? el.dataset.es : el.dataset.en) || el.textContent
        : el.textContent;

      let iter = 0;
      clearInterval(interval);
      interval = setInterval(() => {
        el.textContent = target.split('').map((ch, i) => {
          if (ch === ' ') return ' ';
          if (i < Math.floor(iter)) return target[i];
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('');
        iter += 0.5;
        if (iter >= target.length) {
          el.textContent = target;
          clearInterval(interval);
        }
      }, 32);
    });

    el.addEventListener('mouseleave', () => clearInterval(interval));
  });
})();


/* ─────────────────────────────────────────────
   7. PAINT-WIPE HEADING REVEAL
   Colored bar sweeps over then away, revealing text
   ───────────────────────────────────────────── */
(function initPaintReveal() {
  const headings = document.querySelectorAll('.paint-reveal');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      obs.unobserve(el);

      // Phase 1: bar sweeps in
      el.classList.add('wiping');
      setTimeout(() => {
        // Phase 2: bar sweeps out (text already visible underneath)
        el.classList.add('wiped');
      }, 520);
    });
  }, { threshold: 0.4 });

  headings.forEach(h => obs.observe(h));
})();


/* ─────────────────────────────────────────────
   8. SCROLL REVEAL (general cards/sections)
   ───────────────────────────────────────────── */
(function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.js-reveal').forEach(el => obs.observe(el));
})();


/* ─────────────────────────────────────────────
   9. ANIMATED STAT COUNTERS
   Numbers count up when section enters view
   ───────────────────────────────────────────── */
(function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);

      entry.target.querySelectorAll('.stat-num[data-count]').forEach(el => {
        const target = parseInt(el.dataset.count, 10);
        if (isNaN(target)) return;

        const duration = 1200;
        const start    = performance.now();

        function step(now) {
          const progress = Math.min((now - start) / duration, 1);
          // Ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    });
  }, { threshold: 0.4 });

  const statSection = document.querySelector('.stat-row');
  if (statSection) obs.observe(statSection.closest('.about-text') || statSection);
})();


/* ─────────────────────────────────────────────
   10. PARALLAX — polaroids scroll at diff speeds
   ───────────────────────────────────────────── */
(function initParallax() {
  const items = [
    { el: document.querySelector('.p1'),    speed: -0.06 },
    { el: document.querySelector('.p2'),    speed:  0.04 },
    { el: document.querySelector('.p3'),    speed: -0.035 },
    { el: document.querySelector('.ab-p1'), speed:  0.04 },
    { el: document.querySelector('.ab-p2'), speed: -0.05 },
    { el: document.querySelector('.vp1'),   speed:  0.045 },
    { el: document.querySelector('.vp2'),   speed: -0.038 },
  ].filter(i => i.el);

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const sy = window.scrollY;
      items.forEach(({ el, speed }) => {
        const base = parseFloat(el.dataset.baseRotate || 0);
        const dy   = sy * speed;
        el.style.transform = `rotate(${base}deg) translateY(${dy}px)`;
      });
      ticking = false;
    });
  }, { passive: true });
})();


/* ─────────────────────────────────────────────
   11. STICKY NAV
   ───────────────────────────────────────────── */
(function initNav() {
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 55);
  }, { passive: true });
})();


/* ─────────────────────────────────────────────
   12. MARQUEE speed on hover handled via CSS
       (animation-play-state: paused)
   ───────────────────────────────────────────── */
