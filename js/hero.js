/* =============================================================================
   HERO.JS — Flex-Flux
   Hero section — canvas particules réseau + parallax + cursor spotlight
                + split text mot par mot + orchestration entrée
   Chargé sur la home uniquement via <script defer src="js/hero.js"></script>
   ============================================================================= */

(function () {
  'use strict';

  var hero = document.querySelector('.hero');
  if (!hero) return;

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. SPLIT TEXT — Découpage H1 mot par mot ────────────── */
  var title = hero.querySelector('.hero__title');

  if (title && !title.dataset.split) {
    title.dataset.split = 'true';

    // Récupérer chaque ligne (séparée par <br>) pour préserver la structure
    var html = title.innerHTML.trim();
    var lines = html.split(/<br\s*\/?>/i);

    title.innerHTML = '';
    var wordIndex = 0;

    lines.forEach(function (line, lineIdx) {
      var lineEl = document.createElement('span');
      lineEl.className = 'hero__title-line';

      // Nettoyer et splitter par espaces
      var words = line.replace(/<[^>]+>/g, '').trim().split(/\s+/);

      words.forEach(function (word, i) {
        var wordEl = document.createElement('span');
        wordEl.className = 'hero__word';
        wordEl.style.setProperty('--word-index', wordIndex);
        wordEl.textContent = word;
        lineEl.appendChild(wordEl);

        // Espace insécable rendu invisible — uniquement entre mots de la même ligne
        if (i < words.length - 1) {
          lineEl.appendChild(document.createTextNode(' '));
        }
        wordIndex++;
      });

      title.appendChild(lineEl);
    });
  }

  /* ── 2. ORCHESTRATION ENTRÉE ─────────────────────────────── */
  // Trigger après un repaint pour s'assurer que les transitions s'appliquent
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      hero.classList.add('is-ready');
    });
  });

  /* ── 3. CANVAS PARTICULES RÉSEAU ─────────────────────────── */
  var canvas = hero.querySelector('.hero__canvas');

  if (canvas && !prefersReduced) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    var animationId = null;
    var dpr = window.devicePixelRatio || 1;
    var width = 0;
    var height = 0;

    var CONFIG = {
      count: 42,
      maxLinkDistance: 140,
      speed: 0.28,
      nodeRadius: 2.2,
      colorBlue: 'rgba(58, 143, 199, ',     // --ff-blue-light
      colorGreen: 'rgba(181, 204, 24, ',    // --ff-pixel-green
      nodeOpacity: 0.55,
      lineOpacityMax: 0.18
    };

    function Particle() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * CONFIG.speed;
      this.vy = (Math.random() - 0.5) * CONFIG.speed;
      // ~80% bleu, ~20% vert pixel — accent rare
      this.color = Math.random() < 0.82 ? CONFIG.colorBlue : CONFIG.colorGreen;
    }

    Particle.prototype.update = function () {
      this.x += this.vx;
      this.y += this.vy;
      // Rebond sur les bords
      if (this.x < 0 || this.x > width)  this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    };

    Particle.prototype.draw = function () {
      ctx.beginPath();
      ctx.arc(this.x, this.y, CONFIG.nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = this.color + CONFIG.nodeOpacity + ')';
      ctx.fill();
    };

    function drawLinks() {
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONFIG.maxLinkDistance) {
            var opacity = (1 - dist / CONFIG.maxLinkDistance) * CONFIG.lineOpacityMax;
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(58, 143, 199, ' + opacity + ')';
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      for (var i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      drawLinks();
      animationId = requestAnimationFrame(animate);
    }

    function setupCanvas() {
      var rect = hero.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
    }

    function initParticles() {
      particles = [];
      for (var i = 0; i < CONFIG.count; i++) {
        particles.push(new Particle());
      }
    }

    function startCanvas() {
      setupCanvas();
      initParticles();
      animate();
    }

    function stopCanvas() {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    }

    // Resize avec debounce léger
    var resizeTimer = null;
    function handleResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        stopCanvas();
        startCanvas();
      }, 150);
    }

    // Pause si hero hors viewport (économie batterie/CPU)
    var heroVisible = true;
    var visibilityObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        heroVisible = entry.isIntersecting;
        if (heroVisible && !animationId) {
          animate();
        } else if (!heroVisible && animationId) {
          stopCanvas();
        }
      });
    }, { threshold: 0 });

    visibilityObserver.observe(hero);
    window.addEventListener('resize', handleResize, { passive: true });
    startCanvas();
  }

  /* ── 4. PARALLAX BACKGROUND ──────────────────────────────── */
  var bg = hero.querySelector('.hero__bg');

  if (bg && !prefersReduced) {
    var parallaxPending = false;
    var heroBottom = 0;

    function updateHeroBottom() {
      heroBottom = hero.offsetTop + hero.offsetHeight;
    }

    function applyParallax() {
      var scrollY = window.scrollY;
      // Ne calcule que si le hero est dans le viewport (perf)
      if (scrollY < heroBottom) {
        bg.style.transform = 'translate3d(0, ' + (scrollY * 0.3) + 'px, 0)';
      }
      parallaxPending = false;
    }

    function onScroll() {
      if (parallaxPending) return;
      parallaxPending = true;
      requestAnimationFrame(applyParallax);
    }

    updateHeroBottom();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateHeroBottom, { passive: true });
  }

  /* ── 5. SCROLL INDICATOR — masquage au scroll ────────────── */
  var scrollPending = false;
  function handleHeroScroll() {
    if (scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(function () {
      hero.classList.toggle('is-scrolled-past', window.scrollY > 50);
      scrollPending = false;
    });
  }
  window.addEventListener('scroll', handleHeroScroll, { passive: true });

  /* ── 6. CURSOR SPOTLIGHT (desktop only) ──────────────────── */
  var spotlight = hero.querySelector('.hero__spotlight');
  var hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (spotlight && hasFinePointer && !prefersReduced) {
    var mousePending = false;
    var mx = 0, my = 0;

    function updateSpotlight() {
      spotlight.style.setProperty('--mx', mx + 'px');
      spotlight.style.setProperty('--my', my + 'px');
      mousePending = false;
    }

    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
      if (mousePending) return;
      mousePending = true;
      requestAnimationFrame(updateSpotlight);
    }, { passive: true });
  }

}());