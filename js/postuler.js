/* =============================================================================
   POSTULER.JS — Flex-Flux
   Page candidature spontanée : drag & drop CV + validation formulaire
   Chargé sur : carrieres/postuler.html
   Dépend de : nav.js (déjà chargé avant)
   ============================================================================= */

(function () {
  'use strict';

  /* ── 1. Upload drag & drop CV ────────────────────────────── */
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

  /* ── 2. Validation formulaire ────────────────────────────── */
  var form      = document.getElementById('postuler-form');
  var submitBtn = document.getElementById('postuler-submit');
  var successEl = document.getElementById('postuler-success');

  if (!form) return;

  var RULES = {
    prenom:    { required: true },
    nom:       { required: true },
    email:     { required: true, email: true },
    telephone: { required: true },
    message:   { required: true }
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

  // Validation live
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