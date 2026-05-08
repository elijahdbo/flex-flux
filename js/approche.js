/* =============================================================================
   APPROCHE.JS — Flex-Flux
   Section "Notre Approche" — déclencheur clip-path reveal au scroll
   Chargé sur la home uniquement via <script defer src="js/approche.js"></script>
   ============================================================================= */

(function () {
  'use strict';

  var approach = document.querySelector('.approach');
  if (!approach) return;

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Si reduced motion : on révèle immédiatement, pas d'animation
  if (prefersReduced) {
    approach.classList.add('is-revealed');
    return;
  }

  // Observer dédié — déclenchement plus tôt (rootMargin négatif fort)
  // pour que la révélation commence quand l'utilisateur arrive vraiment dessus
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        approach.classList.add('is-revealed');
        observer.unobserve(approach);
      }
    });
  }, {
    threshold: 0.25,
    rootMargin: '0px 0px -10% 0px'
  });

  observer.observe(approach);

}());