(function () {
  'use strict';

  // Détecte si on est sur GitHub Pages ou en local
  var isGitHubPages = window.location.hostname === 'elijahdbo.github.io';
  var base = isGitHubPages ? '/flex-flux/' : '/';

  // Stocke la base pour pouvoir l'utiliser ailleurs si besoin
  window.FF_BASE = base;

}());