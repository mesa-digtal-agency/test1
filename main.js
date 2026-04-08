/* ==========================================
   LUMINA — Design Studio
   main.js  — Interactions & Animations
   ========================================== */

'use strict';

/* ---------- Utility ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/* ---------- Custom Cursor ---------- */
(function initCursor() {
  const cursor   = $('#cursor');
  const follower = $('#cursorFollower');
  if (!cursor || !follower) return;

  let mouseX = 0, mouseY = 0;
  let followX = 0, followY = 0;
  let rafId;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  function animateFollower() {
    followX += (mouseX - followX) * 0.12;
    followY += (mouseY - followY) * 0.12;
    follower.style.left = followX + 'px';
    follower.style.top  = followY + 'px';
    rafId = requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Hover states for interactive elements
  const interactives = 'a, button, [role="button"], input, textarea, .project-card, .service-item';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactives)) {
      cursor.classList.add('cursor--hover');
      follower.classList.add('cursor-follower--hover');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactives)) {
      cursor.classList.remove('cursor--hover');
      follower.classList.remove('cursor-follower--hover');
    }
  });

  // Click pulse
  document.addEventListener('mousedown', () => cursor.classList.add('cursor--click'));
  document.addEventListener('mouseup',   () => cursor.classList.remove('cursor--click'));

  // Hide when leaving window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    follower.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    follower.style.opacity = '1';
  });
})();

/* ---------- Nav scroll behaviour ---------- */
(function initNav() {
  const nav = $('#nav');
  if (!nav) return;

  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ---------- Mobile menu ---------- */
(function initMobileMenu() {
  const burger = $('#burger');
  const menu   = $('#mobileMenu');
  if (!burger || !menu) return;

  function toggle() {
    const open = burger.classList.toggle('open');
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    burger.setAttribute('aria-expanded', open);
  }

  function close() {
    burger.classList.remove('open');
    menu.classList.remove('open');
    document.body.style.overflow = '';
    burger.setAttribute('aria-expanded', 'false');
  }

  burger.addEventListener('click', toggle);
  $$('.mobile-link', menu).forEach(link => link.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

/* ---------- Scroll-reveal (IntersectionObserver) ---------- */
(function initScrollReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    $$('.scroll-reveal').forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  $$('.scroll-reveal').forEach(el => observer.observe(el));
})();

/* ---------- Counter animation ---------- */
(function initCounters() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);

      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      if (isNaN(target)) return;

      if (prefersReduced) { el.textContent = target; return; }

      const duration = 1800;
      const start    = performance.now();

      function update(now) {
        const elapsed  = now - start;
        const progress = clamp(elapsed / duration, 0, 1);
        // Ease-out-expo
        const eased    = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    });
  }, { threshold: 0.5 });

  $$('[data-target]').forEach(el => observer.observe(el));
})();

/* ---------- Parallax blobs on mouse move ---------- */
(function initParallax() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const blobs = $$('.blob');
  if (!blobs.length) return;

  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    blobs.forEach((blob, i) => {
      const depth = (i + 1) * 18;
      blob.style.transform = `translate(${dx * depth}px, ${dy * depth}px)`;
    });
  });
})();

/* ---------- Project card tilt ---------- */
(function initTilt() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  $$('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;  // -0.5 to 0.5
      const y = (e.clientY - rect.top)  / rect.height - 0.5;

      card.style.transform = `
        perspective(800px)
        rotateX(${-y * 8}deg)
        rotateY(${x * 8}deg)
        translateY(-8px)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ---------- Smooth anchor scrolling ---------- */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ---------- Contact form ---------- */
(function initForm() {
  const form    = $('#contactForm');
  const success = $('#formSuccess');
  if (!form) return;

  function validate(form) {
    let valid = true;

    $$('[required]', form).forEach(field => {
      const group = field.closest('.form__group');
      const empty = !field.value.trim();
      const emailBad = field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
      const hasError = empty || emailBad;

      group.classList.toggle('error', hasError);
      if (hasError) valid = false;
    });

    return valid;
  }

  // Live clear errors
  $$('[required]', form).forEach(field => {
    field.addEventListener('input', () => {
      field.closest('.form__group').classList.remove('error');
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate(form)) return;

    const btn = $('button[type="submit"]', form);
    btn.classList.add('loading');
    btn.disabled = true;

    // Simulate async submit
    await new Promise(r => setTimeout(r, 1800));

    btn.classList.remove('loading');
    btn.style.display = 'none';
    success.classList.add('show');
    form.reset();
  });
})();

/* ---------- Page-load progress bar ---------- */
(function initPageProgress() {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed; top: 0; left: 0; height: 3px;
    width: 0%; background: var(--c-accent);
    z-index: 9999; transition: width 0.2s ease;
    pointer-events: none;
  `;
  document.body.appendChild(bar);

  let progress = 0;
  const interval = setInterval(() => {
    progress = Math.min(progress + Math.random() * 15, 85);
    bar.style.width = progress + '%';
  }, 120);

  window.addEventListener('load', () => {
    clearInterval(interval);
    bar.style.width = '100%';
    setTimeout(() => { bar.style.opacity = '0'; bar.style.transition += ', opacity 0.4s'; }, 200);
    setTimeout(() => bar.remove(), 700);
  });
})();

/* ---------- Active nav link highlight ---------- */
(function initActiveSections() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav__links a[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${id}` ? 'var(--c-text)' : '';
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
})();

/* ---------- Button ripple effect ---------- */
(function initRipple() {
  $$('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect   = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size   = Math.max(rect.width, rect.height) * 2;
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px; height: ${size}px;
        left: ${e.clientX - rect.left - size/2}px;
        top: ${e.clientY - rect.top - size/2}px;
        background: rgba(255,255,255,0.2);
        border-radius: 50%;
        transform: scale(0);
        pointer-events: none;
        animation: rippleAnim 0.55s var(--ease-out-expo) forwards;
      `;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Inject ripple keyframes once
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rippleAnim {
      to { transform: scale(1); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();
