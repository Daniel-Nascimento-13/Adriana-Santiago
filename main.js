
/* ==========================================
   ADRIANA SANTIAGO MULTIMARCAS — LÓGICA
   ========================================== */

(function () {
  'use strict';


  /* ==========================================
     SELETORES GLOBAIS
     ========================================== */

  const intro      = document.getElementById('intro');
  const main       = document.getElementById('main-content');
  const navbar     = document.getElementById('navbar');
  const hamburger  = document.getElementById('hamburger');
  const navLinks   = document.getElementById('nav-links');
  const navItems   = document.querySelectorAll('.nav-item');
  const reduzMovim = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ==========================================
     SEÇÃO 1 — INTRO (LOGO DE ABERTURA)

     LOGO ESTÁTICA POR 2S E DISSOLVE PARA O HERO.
     RESPEITA PREFERS-REDUCED-MOTION.
     ========================================== */
    
  let revealed = false;
  const DURACAO_INTRO = 2000;

  function revelarMain() {
    if (revealed) return;
    revealed = true;

    intro.classList.add('fade-out');
    main.classList.add('visible');
    document.body.style.overflow = '';
    window.scrollTo({ top: 0, behavior: 'instant' });

    setTimeout(function () {
      initReveal();
    }, 300);
  }

  if (reduzMovim) {
    intro.style.display = 'none';
    main.classList.add('visible');
    revealed = true;
    initReveal();
  } else {
    document.body.style.overflow = 'hidden';
    setTimeout(revelarMain, DURACAO_INTRO);
  }


  /* ==========================================
     REVEAL — APARECE AO ENTRAR NA VIEWPORT
     ========================================== */

  function initReveal() {
    const elementos = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window)) {
      elementos.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elementos.forEach(function (el) { obs.observe(el); });
  }


  /* ==========================================
     MENU PRINCIPAL
     ========================================== */

  window.addEventListener('scroll', function () {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  hamburger.addEventListener('click', function () {
    const aberto = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', aberto);
    hamburger.setAttribute('aria-expanded', aberto);
    document.body.style.overflow = aberto ? 'hidden' : '';
  });

  navItems.forEach(function (item) {
    item.addEventListener('click', function () {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    });
  });


  /* ==========================================
     SEÇÃO 2 — HERO (PARALLAX LEVE)
     ========================================== */

  const heroBg = document.querySelector('.hero-bg');
  if (heroBg && !reduzMovim) {
    let ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          const y = window.scrollY;
          if (y < window.innerHeight) {
            heroBg.style.transform = 'translateY(' + (y * 0.18) + 'px) scale(1.05)';
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }


  /* ==========================================
     SEÇÃO 4 — NOSSA HISTÓRIA (CARROSSEL INFINITO + SWIPE)
     ========================================== */

  function initHistoria() {
    const track = document.getElementById('historiaTrack');
    if (!track) return;

    const originalSlides = Array.from(track.children);
    const totalOrig = originalSlides.length;
    const dots = document.querySelectorAll('.historia-dot');
    
    let atual = 0; // ÍNDICE BASEADO NOS SLIDES ORIGINAIS (0, 1, 2)
    let timer;
    let emTransicao = false;

    // 1. CRIAÇÃO DOS CLONES PARA O LOOP PERFEITO
    const primeiroClone = originalSlides[0].cloneNode(true);
    const ultimoClone = originalSlides[totalOrig - 1].cloneNode(true);

    // INJETA OS CLONES NAS EXTREMIDADES DO TRACK
    track.appendChild(primeiroClone);
    track.insertBefore(ultimoClone, track.firstElementChild);

    const todosSlides = Array.from(track.children);
    const totalElementos = todosSlides.length; // 5 ELEMENTOS NO TOTAL

    // 2. AJUSTE DINÂMICO DAS LARGURAS
    track.style.width = (totalElementos * 100) + '%';
    todosSlides.forEach(function (s) { 
      s.style.width = (100 / totalElementos) + '%'; 
    });

    // CURVA DE ANIMAÇÃO REFINADA (PREMIUM TIMING) PARA O DESLIZAMENTO
    const TIMING_TRANSICAO = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';

    // 3. FUNÇÃO DE MOVIMENTAÇÃO PRINCIPAL
    function moverPara(idx, comTransicao) {
      atual = idx;
      
      if (comTransicao) {
        track.style.transition = TIMING_TRANSICAO;
      } else {
        track.style.transition = 'none';
      }

      // O DESLOCAMENTO REAL SOMA +1 PARA PULAR O "ULTIMOCLONE" QUE ESTÁ NA POSIÇÃO 0
      track.style.transform = 'translateX(-' + ((atual + 1) * (100 / totalElementos)) + '%)';

      // ATUALIZA OS DOTS SIMULANDO O COMPORTAMENTO CIRCULAR
      let dotAtivo = (atual + totalOrig) % totalOrig;
      dots.forEach(function (d, i) { 
        d.classList.toggle('on', i === dotAtivo); 
      });
    }

    // 4. RESET INVISÍVEL (O TRUQUE DO LOOP INFINITO)
    track.addEventListener('transitionend', function () {
      emTransicao = false;

      // SE PASSOU DO ÚLTIMO ORIGINAL (ESTÁ VISUALIZANDO O CLONE DO PRIMEIRO)
      if (atual >= totalOrig) {
        moverPara(0, false); // SALTA INSTANTANEAMENTE PARA O SLIDE 0 REAL (SEM TRANSIÇÃO)
      }
      // SE RECUOU PARA ANTES DO PRIMEIRO ORIGINAL (ESTÁ VISUALIZANDO O CLONE DO ÚLTIMO)
      else if (atual < 0) {
        moverPara(totalOrig - 1, false); // SALTA INSTANTANEAMENTE PARA O ÚLTIMO SLIDE REAL
      }
    });

    // 5. GERENCIAMENTO DE TEMPO (AUTOPLAY)
    function avancar() {
      if (emTransicao) return;
      emTransicao = true;
      moverPara(atual + 1, true);
    }

    function reiniciarAuto() {
      clearInterval(timer);
      timer = setInterval(avancar, 5500);
    }

    function pararAuto() {
      clearInterval(timer);
    }

    // 6. CLIQUES NOS DOTS
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () {
        if (emTransicao) return;
        emTransicao = true;
        moverPara(i, true);
        reiniciarAuto();
      });
    });

    // 7. LÓGICA DE SWIPE TOUCH
    var x0 = null;
    track.addEventListener('touchstart', function (e) { 
      x0 = e.touches[0].clientX; 
    }, { passive: true });

    track.addEventListener('touchend', function (e) {
      if (x0 === null || emTransicao) return;
      var dx = e.changedTouches[0].clientX - x0;
      
      if (Math.abs(dx) > 45) {
        emTransicao = true;
        if (dx < 0) {
          moverPara(atual + 1, true); // ARRASTA PARA A ESQUERDA -> AVANÇA
        } else {
          moverPara(atual - 1, true); // ARRASTA PARA A DIREITA -> RECUA
        }
        reiniciarAuto();
      }
      x0 = null;
    }, { passive: true });

    // POSIÇÃO INICIAL (EXIBE O SLIDE 0 REAL, OMITINDO O CLONE INICIAL)
    moverPara(0, false);

    // 8. INTERSECTION OBSERVER (ATIVA APENAS NA TELA)
    const secaoHistoria = document.getElementById('historia');
    if (secaoHistoria && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            reiniciarAuto();
          } else {
            pararAuto();
          }
        });
      }, { threshold: 0.3 });

      observer.observe(secaoHistoria);
    } else {
      reiniciarAuto();
    }
  }

  initHistoria();


  /* ==========================================
     SEÇÃO 5 — POR QUE AQUI (SLIDESHOW KEN BURNS)
     ========================================== */

  function initSlideshow() {
    var slides = document.querySelectorAll('#loja .slide');
    if (slides.length < 2) return;

    var atual = 0;
    setInterval(function () {
      slides[atual].classList.remove('ativo');
      atual = (atual + 1) % slides.length;
      slides[atual].classList.add('ativo');
    }, 4500);
  }

  initSlideshow();


})();