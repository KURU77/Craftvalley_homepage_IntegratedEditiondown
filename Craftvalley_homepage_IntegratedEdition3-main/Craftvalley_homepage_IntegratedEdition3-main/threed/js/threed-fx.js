// ================================================================
// CRAFTVALLEY 3D — Apple-style scroll & interaction effects
// ================================================================

(function () {
  'use strict';

  // ── Utilities ─────────────────────────────────────────────────
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function map(v, a, b, c, d) { return c + (d - c) * ((v - a) / (b - a)); }

  var raf = requestAnimationFrame.bind(window);
  var mouse = { x: 0, y: 0, lx: 0, ly: 0 };
  var scrollY = 0;
  var ticking = false;

  // ── Loader ────────────────────────────────────────────────────
  window.addEventListener('load', function () {
    var loader = document.getElementById('loader');
    if (!loader) return;
    setTimeout(function () {
      loader.classList.add('hidden');
      startHeroReveal();
    }, 600);
  });

  // ── Custom cursor ─────────────────────────────────────────────
  var cursor = document.getElementById('cursor');
  var trail  = document.getElementById('cursor-trail');

  if (cursor && window.matchMedia('(pointer:fine)').matches) {
    var trailX = 0, trailY = 0;
    document.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX; mouse.y = e.clientY;
      cursor.style.left = e.clientX + 'px';
      cursor.style.top  = e.clientY + 'px';
    });
    function animTrail() {
      trailX = lerp(trailX, mouse.x, 0.12);
      trailY = lerp(trailY, mouse.y, 0.12);
      if (trail) {
        trail.style.left = trailX + 'px';
        trail.style.top  = trailY + 'px';
      }
      raf(animTrail);
    }
    animTrail();

    document.querySelectorAll('a, button').forEach(function (el) {
      el.addEventListener('mouseenter', function () { document.body.classList.add('cursor-hover'); });
      el.addEventListener('mouseleave', function () { document.body.classList.remove('cursor-hover'); });
    });
  }

  // ── Hero entrance animations ──────────────────────────────────
  function startHeroReveal() {
    // Badge
    var badge = document.querySelector('.hero-badge');
    if (badge) setTimeout(function () { badge.classList.add('visible'); }, 100);

    // Split chars for Japanese tag
    var tag = document.querySelector('.hero-ja-tag');
    if (tag) {
      var text = tag.textContent;
      tag.innerHTML = '';
      text.split('').forEach(function (ch, i) {
        var span = document.createElement('span');
        span.className = 'char';
        span.textContent = ch === ' ' ? ' ' : ch;
        span.style.transitionDelay = (0.05 + i * 0.03) + 's';
        tag.appendChild(span);
      });
      setTimeout(function () {
        tag.querySelectorAll('.char').forEach(function (c) { c.classList.add('visible'); });
      }, 200);
    }

    // Title lines
    var lines = document.querySelectorAll('.hero-title-3d .line-inner');
    lines.forEach(function (line, i) {
      setTimeout(function () { line.classList.add('visible'); }, 400 + i * 120);
    });

    // Sub + CTAs
    var subs = document.querySelectorAll('.hero-sub, .hero-ctas');
    subs.forEach(function (el) {
      setTimeout(function () { el.classList.add('visible'); }, 900);
    });

    // Float badges
    var badges = document.querySelectorAll('.float-badge');
    badges.forEach(function (b, i) {
      setTimeout(function () { b.classList.add('visible'); }, 1100 + i * 180);
    });

    // Stats band
    var band = document.querySelector('.hero-stats-band');
    if (band) setTimeout(function () { band.classList.add('visible'); }, 1000);

    // Start counters when stats become visible
    setTimeout(startCounters, 1200);
  }

  // ── Counter animation ─────────────────────────────────────────
  function startCounters() {
    document.querySelectorAll('.counter').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-target'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = 1400;
      var start = performance.now();
      function tick(now) {
        var progress = clamp((now - start) / duration, 0, 1);
        // Ease out cubic
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) raf(tick);
      }
      raf(tick);
    });
  }

  // ── Mouse-tracking 3D tilt on hero showcase ───────────────────
  var stage = document.getElementById('showcaseStage');
  var heroSection = document.getElementById('hero');

  if (stage && heroSection) {
    var tiltX = 0, tiltY = 0, tiltTargetX = 0, tiltTargetY = 0;
    var maxTilt = 14;

    document.addEventListener('mousemove', function (e) {
      var rect = heroSection.getBoundingClientRect();
      if (e.clientY < rect.top || e.clientY > rect.bottom) return;
      var cx = rect.left + rect.width / 2;
      var cy = rect.top  + rect.height / 2;
      tiltTargetX = map(e.clientX, rect.left, rect.right, maxTilt, -maxTilt);
      tiltTargetY = map(e.clientY, rect.top,  rect.bottom, -maxTilt, maxTilt);
    });

    heroSection.addEventListener('mouseleave', function () {
      tiltTargetX = 0; tiltTargetY = 0;
    });

    function animTilt() {
      tiltX = lerp(tiltX, tiltTargetX, 0.07);
      tiltY = lerp(tiltY, tiltTargetY, 0.07);
      stage.style.transform =
        'perspective(800px) rotateY(' + tiltX + 'deg) rotateX(' + tiltY + 'deg)';
      raf(animTilt);
    }
    animTilt();
  }

  // ── Parallax bg layers on mouse ───────────────────────────────
  var bgLayers = document.querySelectorAll('[data-depth]');
  document.addEventListener('mousemove', function (e) {
    var cx = window.innerWidth  / 2;
    var cy = window.innerHeight / 2;
    bgLayers.forEach(function (layer) {
      var depth = parseFloat(layer.getAttribute('data-depth'));
      var dx = (e.clientX - cx) * depth;
      var dy = (e.clientY - cy) * depth;
      layer.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
    });
  });

  // ── Scroll-driven cinematic section ──────────────────────────
  var cinematicSection = document.getElementById('cinematic');
  var cinPanels = document.querySelectorAll('.cin-panel');
  var cinDots   = document.querySelectorAll('.cin-dot');
  var panelCount = cinPanels.length;
  var currentPanel = 0;

  function updateCinematic() {
    if (!cinematicSection) return;
    var rect = cinematicSection.getBoundingClientRect();
    var sectionH = cinematicSection.offsetHeight;
    var progress = clamp(-rect.top / (sectionH - window.innerHeight), 0, 1);
    var panel = Math.floor(progress * panelCount);
    panel = clamp(panel, 0, panelCount - 1);

    if (panel !== currentPanel) {
      cinPanels[currentPanel].classList.remove('active');
      cinDots[currentPanel] && cinDots[currentPanel].classList.remove('active');
      currentPanel = panel;
      cinPanels[currentPanel].classList.add('active');
      cinDots[currentPanel] && cinDots[currentPanel].classList.add('active');
    }
  }

  // Dot click navigation
  cinDots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      if (!cinematicSection) return;
      var sectionH = cinematicSection.offsetHeight;
      var targetProgress = i / panelCount + 0.01;
      var targetScroll = cinematicSection.offsetTop + targetProgress * (sectionH - window.innerHeight);
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    });
  });

  // ── Scroll parallax on hero ───────────────────────────────────
  function updateHeroParallax() {
    var sy = window.scrollY;
    var heroEl = document.getElementById('hero');
    if (!heroEl) return;
    var heroH = heroEl.offsetHeight;
    if (sy > heroH) return;
    var prog = sy / heroH;

    // Background layers scroll slower
    bgLayers.forEach(function (layer) {
      var depth = parseFloat(layer.getAttribute('data-depth'));
      var currentTransform = layer.style.transform || '';
      // Keep mouse translate, add scroll offset
      layer.setAttribute('data-scroll-y', (-sy * depth * 0.4).toFixed(2));
    });

    // Hero copy fades and rises as scroll
    var copyEl = document.querySelector('.hero-copy');
    if (copyEl) {
      var fade = clamp(1 - prog * 2.5, 0, 1);
      var rise = -sy * 0.25;
      copyEl.style.opacity = fade;
      copyEl.style.transform = 'translateY(' + rise + 'px)';
    }

    // Showcase sinks slower
    var showcaseEl = document.querySelector('.hero-showcase');
    if (showcaseEl) {
      var rise2 = -sy * 0.12;
      showcaseEl.style.transform = 'translateY(' + rise2 + 'px)';
    }
  }

  // ── Depth reveal with IntersectionObserver ────────────────────
  function initDepthReveal() {
    var revealEls = document.querySelectorAll('.depth-reveal');
    if (!revealEls.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var idx = Array.from(revealEls).indexOf(el);
          setTimeout(function () { el.classList.add('visible'); }, 60);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  }

  // ── Producer/Product card 3D tilt on hover ────────────────────
  function initCardTilt() {
    var cards = document.querySelectorAll('.producer-card, .product-card, .news-card');
    cards.forEach(function (card) {
      var tx = 0, ty = 0, ttx = 0, tty = 0;
      var rafId;

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var cx = rect.left + rect.width  / 2;
        var cy = rect.top  + rect.height / 2;
        ttx = map(e.clientX, rect.left, rect.right, 6, -6);
        tty = map(e.clientY, rect.top,  rect.bottom, -6, 6);
      });

      card.addEventListener('mouseenter', function () {
        cancelAnimationFrame(rafId);
        function animate() {
          tx = lerp(tx, ttx, 0.1);
          ty = lerp(ty, tty, 0.1);
          card.style.transform = 'perspective(600px) rotateY(' + tx + 'deg) rotateX(' + ty + 'deg) translateY(-8px)';
          card.style.boxShadow = '0 24px 60px rgba(0,0,0,.5), 0 0 0 1px rgba(233,69,96,.2)';
          rafId = raf(animate);
        }
        animate();
      });

      card.addEventListener('mouseleave', function () {
        ttx = 0; tty = 0;
        cancelAnimationFrame(rafId);
        function reset() {
          tx = lerp(tx, 0, 0.15);
          ty = lerp(ty, 0, 0.15);
          card.style.transform = 'perspective(600px) rotateY(' + tx + 'deg) rotateX(' + ty + 'deg) translateY(0)';
          card.style.boxShadow = '';
          if (Math.abs(tx) > 0.01 || Math.abs(ty) > 0.01) rafId = raf(reset);
        }
        reset();
      });
    });
  }

  // ── Stagger reveal for grid items ─────────────────────────────
  function initGridStagger() {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var grid = entry.target;
          var items = grid.querySelectorAll('.producer-card, .product-card, .news-card, .event-item');
          items.forEach(function (item, i) {
            setTimeout(function () {
              item.style.opacity = '1';
              item.style.transform = 'translateZ(0) translateY(0)';
            }, i * 80);
          });
          observer.unobserve(grid);
        }
      });
    }, { threshold: 0.05 });

    document.querySelectorAll('.producers-grid, .products-grid, .news-grid, .event-list').forEach(function (grid) {
      observer.observe(grid);
    });
  }

  // ── Scroll event aggregation ──────────────────────────────────
  window.addEventListener('scroll', function () {
    scrollY = window.scrollY;
    if (!ticking) {
      raf(function () {
        updateCinematic();
        updateHeroParallax();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // ── MutationObserver: re-init tilt after JS populates grids ───
  var gridObserver = new MutationObserver(function () {
    setTimeout(function () {
      initCardTilt();
      initGridStagger();
    }, 50);
  });

  ['producers-grid', 'products-grid', 'news-grid', 'upcoming-events-list', 'past-events-list'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) gridObserver.observe(el, { childList: true });
  });

  // ── Init ──────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    initDepthReveal();
    initCardTilt();
    updateCinematic();

    // Preload: apply initial hidden state to grid items
    document.querySelectorAll('.producer-card, .product-card, .news-card, .event-item').forEach(function (item) {
      item.style.opacity    = '0';
      item.style.transform  = 'translateZ(-40px) translateY(24px)';
      item.style.transition = 'opacity .6s ease, transform .6s ease, box-shadow .3s ease';
    });
  });

})();
