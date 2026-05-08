/* =============================================================================
   CARRIERES.JS — Flex-Flux
   Filtres chips + search bar + scroll reveal + counter stats
   Chargé sur : carrieres/index.html
   ============================================================================= */

(function () {
  'use strict';

  /* ── 1. Scroll Reveal ────────────────────────────────────── */
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObs.observe(el);
  });

  /* ── 2. Filtres chips ────────────────────────────────────── */
  var chips   = document.querySelectorAll('.filter-chip');
  var cards   = document.querySelectorAll('.offre-card[data-cat]');
  var countEl = document.getElementById('results-count');

  function updateCount() {
    var visible = Array.from(cards).filter(function (c) {
      return !c.hidden;
    }).length;
    if (countEl) {
      countEl.textContent = visible + ' offre' + (visible > 1 ? 's' : '');
    }
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      // Désactiver tous les chips
      chips.forEach(function (c) {
        c.classList.remove('is-active');
        c.setAttribute('aria-pressed', 'false');
      });
      // Activer le chip cliqué
      chip.classList.add('is-active');
      chip.setAttribute('aria-pressed', 'true');

      var cat = chip.dataset.cat;

      // Filtrer les cards
      cards.forEach(function (card) {
        var match = cat === 'all' || card.dataset.cat === cat;
        card.hidden = !match;
      });

      updateCount();
    });
  });

  // Comptage initial
  updateCount();

  /* ── 3. Search bar ───────────────────────────────────────── */
  var searchBtn     = document.getElementById('search-btn');
  var filterMetier  = document.getElementById('filter-metier');
  var filterLieu    = document.getElementById('filter-lieu');
  var filterContrat = document.getElementById('filter-contrat');

  if (searchBtn) {
    searchBtn.addEventListener('click', function () {
      var metier  = filterMetier  ? filterMetier.value  : '';
      var lieu    = filterLieu    ? filterLieu.value    : '';
      var contrat = filterContrat ? filterContrat.value : '';

      cards.forEach(function (card) {
        var catMatch     = !metier  || card.dataset.cat === metier;
        var lieuMatch    = !lieu    || card.dataset.lieu === lieu;
        var contratMatch = !contrat || card.dataset.contrat === contrat;
        card.hidden = !(catMatch && lieuMatch && contratMatch);
      });

      // Réinitialiser les chips au filtre "Tout"
      chips.forEach(function (c) {
        c.classList.remove('is-active');
        c.setAttribute('aria-pressed', 'false');
      });
      var allChip = document.querySelector('.filter-chip[data-cat="all"]');
      if (allChip) {
        allChip.classList.add('is-active');
        allChip.setAttribute('aria-pressed', 'true');
      }

      updateCount();
    });
  }

}());