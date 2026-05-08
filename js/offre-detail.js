/* =============================================================================
   OFFRE-DETAIL.JS — Flex-Flux
   Page détail offre : scroll to form + drag & drop CV + validation formulaire
   Chargé sur : carrieres/offre-detail.html
   Dépend de : nav.js (déjà chargé avant)
   ============================================================================= */

(function () {
  'use strict';

  /* ── 1. Scroll vers le formulaire (bouton sidebar) ───────── */
  var applyBtn = document.getElementById('apply-btn');
  var navbar   = document.getElementById('navbar');

  if (applyBtn) {
    applyBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var formSection = document.getElementById('candidature-form-section');
      if (!formSection) return;
      var navHeight = navbar
        ? parseInt(getComputedStyle(navbar).height, 10)
        : 72;
      window.scrollTo({
        top: formSection.getBoundingClientRect().top + window.scrollY - navHeight - 20,
        behavior: 'smooth'
      });
      // Focus premier champ après scroll
      setTimeout(function () {
        var firstInput = formSection.querySelector('.cand-field__input');
        if (firstInput) firstInput.focus();
      }, 600);
    });
  }

  /* ── 2. Upload drag & drop CV ────────────────────────────── */
  var cvZone  = document.getElementById('cv-zone');
  var cvInput = document.getElementById('cv-upload');

  if (cvZone && cvInput) {
    var fileNameEl = cvZone.querySelector('.upload-zone__file-name');

    function applyFile(file) {
      if (!file) return;
      cvZone.classList.add('has-file');
      cvZone.classList.remove('has-error', 'is-dragover');
      if (fileNameEl) fileNameEl.textContent = file.name;
    }

    cvInput.addEventListener('change', function () {
      if (cvInput.files[0]) applyFile(cvInput.files[0]);
    });

    cvZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      cvZone.classList.add('is-dragover');
    });

    cvZone.addEventListener('dragleave', function () {
      cvZone.classList.remove('is-dragover');
    });

    cvZone.addEventListener('drop', function (e) {
      e.preventDefault();
      cvZone.classList.remove('is-dragover');
      var file = e.dataTransfer && e.dataTransfer.files[0];
      if (file) applyFile(file);
    });
  }

  /* ── 3. Validation formulaire candidature ────────────────── */
  var form      = document.getElementById('offre-form');
  var submitBtn = document.getElementById('offre-submit');
  var successEl = document.getElementById('offre-success');

  if (!form) return;

  var RULES = {
    prenom:    { required: true },
    nom:       { required: true },
    email:     { required: true, email: true },
    telephone: { required: true }
  };

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateField(input) {
    var wrapper = input.closest('.cand-field');
    if (!wrapper) return true;

    var rule    = RULES[input.name];
    var errEl   = wrapper.querySelector('.cand-field__error');
    var val     = input.value.trim();
    var valid   = true;
    var message = '';

    if (rule && rule.required && !val) {
      valid   = false;
      message = 'Ce champ est requis.';
    } else if (rule && rule.email && val && !EMAIL_RE.test(val)) {
      valid   = false;
      message = 'Adresse e-mail invalide.';
    }

    if (errEl) errEl.textContent = message;
    wrapper.classList.toggle('has-error',   !valid);
    wrapper.classList.toggle('has-success',  valid && !!val);

    if (!valid) {
      wrapper.classList.add('is-shaking');
      wrapper.addEventListener('animationend', function () {
        wrapper.classList.remove('is-shaking');
      }, { once: true });
    }

    return valid;
  }

  // Validation live sur blur + correction en temps réel
  form.querySelectorAll('.cand-field__input, .cand-field__textarea').forEach(function (input) {
    input.addEventListener('blur', function () { validateField(input); });
    input.addEventListener('input', function () {
      var wrapper = input.closest('.cand-field');
      if (wrapper && wrapper.classList.contains('has-error')) {
        validateField(input);
      }
    });
  });

  // Soumission
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var required     = form.querySelectorAll('.cand-field__input[aria-required], .cand-field__textarea[aria-required]');
    var allValid     = true;
    var firstInvalid = null;

    required.forEach(function (input) {
      if (!validateField(input)) {
        allValid = false;
        if (!firstInvalid) firstInvalid = input;
      }
    });

    // CV obligatoire
    if (cvZone && !cvZone.classList.contains('has-file')) {
      allValid = false;
      cvZone.classList.add('has-error');
    }

    if (!allValid) {
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // État loading
    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    // Simulation envoi — remplacer par fetch() en production
    setTimeout(function () {
      submitBtn.classList.remove('is-loading');
      form.setAttribute('hidden', '');
      if (successEl) {
        successEl.classList.add('is-visible');
        successEl.focus();
      }
    }, 2200);
  });

}());