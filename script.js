/* ===================================================================
   Portfolio – script.js
   Interactive behaviors: particles, cursor glow, scroll reveals,
   navbar hide/show, hamburger menu, stat counter animation.
   =================================================================== */

(function () {
  'use strict';

  // ── Cursor Glow ──────────────────────────────────────────────────
  const cursorGlow = document.querySelector('.cursor-glow');
  if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', (e) => {
      requestAnimationFrame(() => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
      });
    });
  }

  // ── Particle Background ──────────────────────────────────────────
  const canvas = document.getElementById('particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 60;
    const CONNECTION_DISTANCE = 120;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.1,
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.12;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(109, 93, 252, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(109, 93, 252, ${p.opacity})`;
        ctx.fill();

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      requestAnimationFrame(drawParticles);
    }

    // Respect reduced motion preference
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      resizeCanvas();
      createParticles();
      drawParticles();
      window.addEventListener('resize', () => {
        resizeCanvas();
        createParticles();
      });
    }
  }

  // ── Navbar hide/show on scroll ───────────────────────────────────
  const navbar = document.querySelector('.navbar');
  let lastScroll = 0;
  const SCROLL_THRESHOLD = 80;

  window.addEventListener(
    'scroll',
    () => {
      const currentScroll = window.scrollY;

      if (currentScroll > SCROLL_THRESHOLD) {
        if (currentScroll > lastScroll) {
          navbar.classList.add('hidden');
        } else {
          navbar.classList.remove('hidden');
        }
      } else {
        navbar.classList.remove('hidden');
      }

      lastScroll = currentScroll;
    },
    { passive: true }
  );

  // ── Mobile Hamburger Menu ────────────────────────────────────────
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isActive = hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      mobileMenu.setAttribute('aria-hidden', !isActive);
      hamburger.setAttribute('aria-expanded', isActive);
      document.body.style.overflow = isActive ? 'hidden' : '';
    });

    // Close menu on link click
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        mobileMenu.setAttribute('aria-hidden', 'true');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // ── Stat Counter Animation ───────────────────────────────────────
  function animateCounters() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    statNumbers.forEach((el) => {
      const target = parseInt(el.getAttribute('data-target'), 10);
      const duration = 1600; // ms
      const startTime = performance.now();

      function updateCount(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);

        el.textContent = current;

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        }
      }

      requestAnimationFrame(updateCount);
    });
  }

  // Trigger counters when hero stats come into view
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    statsObserver.observe(heroStats);
  }

  // ── Scroll Reveal Fallback (IntersectionObserver) ────────────────
  // Only activate if native scroll-driven animations are NOT supported
  if (
    !CSS.supports(
      '(animation-timeline: view()) and (animation-range: entry)'
    )
  ) {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach((el) => {
      el.classList.add('scroll-reveal-fallback');
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach((el) => observer.observe(el));
  }

  // ── Smooth scroll for anchor links ───────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ── Active nav link highlight on scroll ──────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll(
    '.nav-links a:not(.nav-resume-btn)'
  );

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.style.color =
              link.getAttribute('href') === '#' + entry.target.id
                ? 'var(--accent-light)'
                : '';
          });
        }
      });
    },
    { threshold: 0.3 }
  );

  sections.forEach((section) => sectionObserver.observe(section));
})();
