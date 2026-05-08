/* =============================================================================
   NAV.JS — Flex-Flux
   Navbar scroll glassmorphism + menu mobile + smooth scroll
   Chargé sur toutes les pages via <script src="js/nav.js"></script>
   (ou <script src="../js/nav.js"></script> depuis carrieres/)
   ============================================================================= */

(function () {
  'use strict';

  /* ── 1. Navbar scroll ────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let isScrolled = false;
  let rafPending = false;

  function handleScroll() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () {
      var shouldScroll = window.scrollY > 80;
      if (shouldScroll !== isScrolled) {
        navbar.classList.toggle('is-scrolled', shouldScroll);
        isScrolled = shouldScroll;
      }
      rafPending = false;
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // état initial au chargement

  /* ── 2. Menu mobile ──────────────────────────────────────── */
  var burgerBtn  = document.getElementById('burger-btn');
  var mobileMenu = document.getElementById('mobile-menu');

  if (!burgerBtn || !mobileMenu) return;

  var menuIsOpen = false;

  function openMenu() {
    menuIsOpen = true;
    mobileMenu.removeAttribute('hidden');
    // Force reflow pour déclencher la transition CSS
    void mobileMenu.offsetHeight;
    mobileMenu.classList.add('is-open');
    burgerBtn.setAttribute('aria-expanded', 'true');
    burgerBtn.setAttribute('aria-label', 'Fermer le menu');
    document.body.classList.add('menu-open');
    // Focus premier élément focusable
    setTimeout(function () {
      var first = mobileMenu.querySelector('a, button');
      if (first) first.focus();
    }, 60);
  }

  function closeMenu() {
    menuIsOpen = false;
    mobileMenu.classList.remove('is-open');
    burgerBtn.setAttribute('aria-expanded', 'false');
    burgerBtn.setAttribute('aria-label', 'Ouvrir le menu');
    document.body.classList.remove('menu-open');
    // Masquer après la transition (450ms)
    setTimeout(function () {
      if (!menuIsOpen) mobileMenu.setAttribute('hidden', '');
    }, 450);
    burgerBtn.focus();
  }

  burgerBtn.addEventListener('click', function () {
    if (menuIsOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Fermer sur Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuIsOpen) closeMenu();
  });

  // Fermer au resize desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1024 && menuIsOpen) closeMenu();
  });

  // Fermer au clic sur un lien du menu
  mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      setTimeout(closeMenu, 50);
    });
  });

  // Focus trap Tab / Shift+Tab
  document.addEventListener('keydown', function (e) {
    if (!menuIsOpen || e.key !== 'Tab') return;
    var focusables = Array.from(
      mobileMenu.querySelectorAll('a[href], button:not([disabled])')
    );
    if (!focusables.length) return;
    var first = focusables[0];
    var last  = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  /* ── 3. Smooth scroll avec offset navbar ─────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = anchor.getAttribute('href');
      if (id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var navHeight = parseInt(getComputedStyle(navbar).height, 10) || 72;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - navHeight - 16,
        behavior: 'smooth'
      });
    });
  });

  /* ── 4. Aria-current dynamique (lien actif) ──────────────── */
  var currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__nav-link, .mobile-menu__link').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && href.split('#')[0] === currentPath) {
      link.setAttribute('aria-current', 'page');
    }
  });

}());