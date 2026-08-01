/* ============================================
   Akinae Studio — Unified Interactions
   akinae.js
   Zero dependencies — 100% vanilla JS
   ============================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  /* ============================================
     ANALYTICS — WhatsApp and contact intent
     ============================================ */
  (function () {
    window.dataLayer = window.dataLayer || [];

    function cleanText(value) {
      return (value || '').replace(/\s+/g, ' ').trim().slice(0, 120);
    }

    function getCtaLocation(link) {
      if (link.classList.contains('wa-float')) return 'floating_whatsapp';
      if (link.closest('nav')) return 'navigation';
      if (link.closest('.hero-home__cta')) return 'hero_home';
      if (link.closest('.cta-final')) return 'final_cta';
      if (link.closest('.blog-post__cta')) return 'blog_post_cta';
      if (link.closest('.blog-cta-mid')) return 'blog_mid_cta';
      if (link.closest('.proj-cta-red')) return 'case_study_cta';
      if (link.closest('.proj-funnel')) return 'case_study_result';
      if (link.closest('.price-card')) return 'pricing_card';
      if (link.closest('.contacto-info')) return 'contact_info';
      if (link.closest('.footer')) return 'footer';
      return 'content';
    }

    function pushEvent(eventName, params) {
      window.dataLayer.push(Object.assign({ event: eventName }, params));
    }

    document.addEventListener('click', function (event) {
      var link = event.target.closest && event.target.closest('a[href*="wa.me/"]');
      if (!link) return;

      pushEvent('whatsapp_click', {
        page_path: window.location.pathname,
        page_title: document.title,
        cta_location: link.getAttribute('data-section') || getCtaLocation(link),
        cta_text: cleanText(link.textContent) || cleanText(link.getAttribute('aria-label')),
        cta_label: link.getAttribute('data-cta') || '',
        plan: link.getAttribute('data-plan') || '',
        link_url: link.href
      });
    }, true);

    var contactForm = document.querySelector('form[action*="formspree.io"]');
    if (!contactForm) return;

    var formStarted = false;
    contactForm.addEventListener('focusin', function () {
      if (formStarted) return;
      formStarted = true;
      pushEvent('contact_form_start', {
        page_path: window.location.pathname,
        page_title: document.title,
        form_action: contactForm.action
      });
    });

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      pushEvent('contact_form_submit', {
        page_path: window.location.pathname,
        page_title: document.title,
        form_action: contactForm.action
      });

      var data = new FormData(contactForm);
      fetch(contactForm.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      }).then(function (response) {
        if (response.ok) {
          pushEvent('contact_form_success', {
            page_path: window.location.pathname,
            page_title: document.title,
            form_action: contactForm.action
          });
          contactForm.reset();
          var btn = contactForm.querySelector('button[type="submit"]');
          var note = contactForm.querySelector('.post-form-note');
          if (btn) { btn.textContent = '¡Mensaje enviado! Te responderemos pronto.'; btn.disabled = true; }
          if (note) { note.textContent = 'Gracias por escribirnos. Revisa tu WhatsApp o email en las próximas horas.'; }
        } else {
          var btn2 = contactForm.querySelector('button[type="submit"]');
          if (btn2) { btn2.textContent = 'Error. Intenta por WhatsApp.'; }
        }
      }).catch(function () {
        var btn3 = contactForm.querySelector('button[type="submit"]');
        if (btn3) { btn3.textContent = 'Error de conexión. Escríbenos por WhatsApp.'; }
        contactForm.removeAttribute('data-submitting');
        contactForm.submit();
      });
    });
  })();

  /* ============================================
     NAV — scroll effect + progress bar
     ============================================ */
  (function () {
    var nav = document.getElementById('navbar');
    if (!nav) return;
    var progressTicking = false;

    function updateScrollProgress() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      nav.style.setProperty('--scroll-progress', pct + '%');
      progressTicking = false;
    }

    window.addEventListener('scroll', function () {
      var current = window.pageYOffset || document.documentElement.scrollTop;
      if (current > 50) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');

      if (!progressTicking) {
        window.requestAnimationFrame(updateScrollProgress);
        progressTicking = true;
      }
    }, { passive: true });

    updateScrollProgress();
  })();

  /* ============================================
     MOBILE MENU TOGGLE + OVERLAY
     ============================================ */
  (function () {
    var menuToggle = document.querySelector('.menu-toggle');
    var overlay = document.querySelector('.mobile-overlay');
    if (!menuToggle || !overlay) return;
    var scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    menuToggle.addEventListener('click', function () {
      if (window.innerWidth >= 1024) {
        var wrap = document.querySelector('.nav-cta-wrap');
        var wrapRect = wrap.getBoundingClientRect();
        overlay.style.width = wrapRect.width + 'px';
        overlay.style.left = wrapRect.left + 'px';
        overlay.style.right = 'auto';
      } else {
        overlay.style.left = '';
        overlay.style.right = '';
        overlay.style.width = '';
      }
      var isOpen = overlay.classList.toggle('open');
      this.classList.toggle('open');
      this.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
      document.body.style.paddingRight = isOpen ? scrollbarWidth + 'px' : '';
      document.body.classList.toggle('menu-open', isOpen);
    });

    function closeMenu() {
      overlay.classList.remove('open');
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.classList.remove('menu-open');
    }

    overlay.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function (e) {
      if (!overlay.classList.contains('open')) return;
      if (!overlay.contains(e.target) && !menuToggle.contains(e.target)) {
        closeMenu();
      }
    });
  })();

  /* ============================================
     REVEAL — IntersectionObserver
     ============================================ */
  (function () {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (!entry.target.style.getPropertyValue('--i')) {
            var sibs = Array.prototype.slice.call(entry.target.parentElement.children);
            var i = sibs.indexOf(entry.target);
            if (i > 0) entry.target.style.setProperty('--i', Math.min(i, 4));
          }
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(function (el) { obs.observe(el); });

    var metRev = document.querySelector('.metodologia-reveal.reveal');
    if (metRev) {
      setTimeout(function () { metRev.classList.add('visible'); }, 200);
    }
  })();

  /* ============================================
     COUNTERS — stat numbers
     ============================================ */
  (function () {
    var els = document.querySelectorAll('.result-stat__num[data-count-target], .proj-stat-num[data-count-target]');
    if (!els.length) return;

    function animate(el) {
      var target = parseFloat(el.getAttribute('data-count-target'));
      var isPercent = (el.textContent || '').indexOf('%') > -1;
      var isFloat = target % 1 !== 0;
      var originalHTML = el.innerHTML;
      var duration = 1600;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = eased * target;
        var display;
        if (isFloat) display = current.toFixed(1);
        else display = Math.floor(current).toString();
        el.textContent = display;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.innerHTML = originalHTML;
        }
      }
      window.requestAnimationFrame(step);
    }

    if (reduceMotion || !('IntersectionObserver' in window)) return;

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    els.forEach(function (el) { obs.observe(el); });
  })();

  /* ============================================
     TABS — Sectores / generic
     ============================================ */
  (function () {
    var tabBtns = document.querySelectorAll('.tab-btn');
    var tabPanels = document.querySelectorAll('.tab-panel');
    if (!tabBtns.length) return;

    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tabId = this.getAttribute('data-tab');
        tabBtns.forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        tabPanels.forEach(function (p) { p.classList.remove('active'); });
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');
        var panel = document.getElementById('tab-' + tabId);
        if (panel) panel.classList.add('active');
      });
    });
  })();

  /* ============================================
     FAQ — Accordion
     ============================================ */
  (function () {
    var faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    faqItems.forEach(function (item) {
      var btn = item.querySelector('.faq-item__q');
      var answer = item.querySelector('.faq-item__a');
      if (!btn || !answer) return;

      btn.addEventListener('click', function () {
        var isOpen = btn.getAttribute('aria-expanded') === 'true';
        faqItems.forEach(function (other) {
          var otherBtn = other.querySelector('.faq-item__q');
          var otherAnswer = other.querySelector('.faq-item__a');
          if (otherBtn && otherAnswer) {
            otherBtn.setAttribute('aria-expanded', 'false');
            otherAnswer.style.maxHeight = null;
          }
        });
        if (!isOpen) {
          btn.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });
  })();

  /* ============================================
     BUTTONS — subtle hover (CSS-driven)
     ============================================ */
  /* Magnetic buttons removed — using CSS translateY hover instead */

  /* ============================================
     SMOOTH ANCHOR SCROLL
     ============================================ */
  (function () {
    var links = document.querySelectorAll('a[href^="#"]');
    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (!href || href === '#' || href.length < 2) return;
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        var navH = 80;
        var rect = target.getBoundingClientRect();
        var top = window.pageYOffset + rect.top - navH;
        if ('scrollTo' in window) {
          window.scrollTo({ top: top, behavior: 'smooth' });
        } else {
          window.scrollTo(0, top);
        }
      });
    });
  })();

  /* ============================================
     PARALLAX — hero frame (lightweight, no GSAP)
     ============================================ */
  // Removed: parallax translateY on scroll was causing unwanted image movement.

  /* ============================================
     PROJECT PAGE — back button + progress bar
     ============================================ */
  (function () {
    // Back button
    var hero = document.getElementById('proj-hero-full-top');
    var backBtn = document.getElementById('proj-back-float');
    if (hero && backBtn && 'IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) backBtn.classList.remove('visible');
          else backBtn.classList.add('visible');
        });
      }, { threshold: 0, rootMargin: '-80px 0px 0px 0px' });
      obs.observe(hero);
    } else if (backBtn) {
      backBtn.classList.add('visible');
    }

    // Progress bar
    var fill = document.getElementById('next-progress-fill');
    if (fill) {
      var section = fill.closest('.proj-next');
      if (section) {
        var ticking = false;
        window.addEventListener('scroll', function () {
          if (!ticking) {
            requestAnimationFrame(function () {
              var rect = section.getBoundingClientRect();
              var windowH = window.innerHeight;
              var progress = 1 - (rect.bottom / (windowH + rect.height));
              progress = Math.max(0, Math.min(1, progress));
              fill.style.width = Math.round(progress * 100) + '%';
              ticking = false;
            });
            ticking = true;
          }
        }, { passive: true });
      }
    }
  })();

  /* ============================================
     CURATED PROJECTS — thumbnail follow
     ============================================ */
  (function () {
    var section = document.querySelector('.curated-projects');
    if (!section) return;

    var thumb = section.querySelector('.project-thumb');
    var thumbImg = thumb ? thumb.querySelector('img') : null;
    var rows = section.querySelectorAll('.project-row');
    if (!thumb || !thumbImg || !rows.length) return;

    var targetX = 0, targetY = 0, currentX = 0, currentY = 0;
    var rafId = null, thumbActive = false;

    function animateThumb() {
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;
      thumb.style.left = currentX + 'px';
      thumb.style.top = currentY + 'px';
      if (thumbActive) rafId = requestAnimationFrame(animateThumb);
      else rafId = null;
    }

    function showThumb(e, src) {
      targetX = e.clientX + 40;
      targetY = e.clientY - 110;
      if (currentX === 0 && currentY === 0) { currentX = targetX; currentY = targetY; }
      if (thumbImg.getAttribute('src') !== src) thumbImg.setAttribute('src', src);
      if (!thumbActive) {
        thumbActive = true;
        document.body.classList.add('curated-thumb-active');
        if (!rafId) animateThumb();
      }
    }

    function moveThumb(e) { targetX = e.clientX + 40; targetY = e.clientY - 110; }

    function hideThumb() {
      if (!thumbActive) return;
      thumbActive = false;
      document.body.classList.remove('curated-thumb-active');
    }

    rows.forEach(function (row) {
      var src = row.getAttribute('data-thumb');
      row.addEventListener('mouseenter', function (e) { showThumb(e, src); });
      row.addEventListener('mousemove', moveThumb);
      row.addEventListener('mouseleave', hideThumb);
    });

    if (!reduceMotion && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); }
        });
      }, { threshold: 0.1 });
      rows.forEach(function (row) { io.observe(row); });
    } else {
      rows.forEach(function (row) { row.classList.add('visible'); });
    }
  })();

  /* ============================================
     TESTIMONIAL CAROUSEL DOTS
     ============================================ */
  (function () {
    var grids = document.querySelectorAll('.testimonios-grid, .planes-testimonios-grid');
    if (!grids.length) return;

    grids.forEach(function (grid) {
      var container = grid.parentElement;
      var dots = container.querySelectorAll('.carousel-dot');
      if (!dots.length) return;

      function updateDots() {
        var card = grid.children[0];
        if (!card) return;
        var gap = 16;
        var cardWidth = card.offsetWidth + gap;
        var index = Math.round(grid.scrollLeft / cardWidth);
        index = Math.max(0, Math.min(index, dots.length - 1));
        dots.forEach(function (d, i) {
          d.classList.toggle('active', i === index);
          d.setAttribute('aria-selected', i === index);
        });
      }

      grid.addEventListener('scroll', function () {
        window.requestAnimationFrame(updateDots);
      });

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          var index = parseInt(this.getAttribute('data-index'));
          var card = grid.children[index];
          if (card) card.scrollIntoView({ behavior: 'smooth', inline: 'start' });
        });
      });

      updateDots();
    });
  })();

})();
