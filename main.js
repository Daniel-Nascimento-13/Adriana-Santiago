/* ==========================================
   ADRIANA SANTIAGO MULTIMARCAS — LÓGICA
   ==========================================
   Vanilla JS. Sem frameworks.
   WhatsApp / Instagram ficam no HTML (href),
   este arquivo apenas controla comportamento.
   ========================================== */

(function () {
  'use strict';


  /* ==========================================
     SELETORES GLOBAIS
     ========================================== */

  const intro       = document.getElementById('intro');
  const main        = document.getElementById('main-content');
  const navbar      = document.getElementById('navbar');
  const hamburger   = document.getElementById('hamburger');
  const navLinks    = document.getElementById('nav-links');
  const navItems    = document.querySelectorAll('.nav-item');
  const reduzMovim  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ==========================================
     INTRO — LOGO DE ABERTURA
     ==========================================
     Logo estática por 2s e dissolve para o hero.
     Respeita prefers-reduced-motion (não exibe).
     ========================================== */

  let revealed = false;
  const DURACAO_INTRO = 2000; // ms — tempo da logo em tela

  function revelarMain() {
    if (revealed) return;
    revealed = true;

    intro.classList.add('fade-out');
    main.classList.add('visible');
    document.body.style.overflow = '';
    window.scrollTo({ top: 0, behavior: 'instant' });

    setTimeout(function () {
      initReveal();
      initDivisores();
    }, 300);
  }

  if (reduzMovim) {
    // SEM ABERTURA PARA QUEM PREFERE MENOS MOVIMENTO
    intro.style.display = 'none';
    main.classList.add('visible');
    revealed = true;
    initReveal();
    initDivisores();
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

  // DIVISORES — ANIMA AS LINHAS DOURADAS
  function initDivisores() {
    const divs = document.querySelectorAll('.divisor');
    if (!divs.length || !('IntersectionObserver' in window)) {
      divs.forEach(function (d) { d.classList.add('animado'); });
      return;
    }
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('animado');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });
    divs.forEach(function (d) { obs.observe(d); });
  }


  /* ==========================================
     MENU PRINCIPAL
     ========================================== */

  // FUNDO AO DESCER
  window.addEventListener('scroll', function () {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // HAMBURGUER — ABRE/FECHA
  hamburger.addEventListener('click', function () {
    const aberto = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', aberto);
    hamburger.setAttribute('aria-expanded', aberto);
    document.body.style.overflow = aberto ? 'hidden' : '';
  });

  // FECHA AO CLICAR EM UM ITEM
  navItems.forEach(function (item) {
    item.addEventListener('click', function () {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    });
  });


  /* ==========================================
     SEÇÃO 1 — HERO (PARALLAX LEVE)
     ==========================================
     Move o fundo um pouco mais devagar que o
     scroll. Usa requestAnimationFrame — nunca
     loop ocioso.
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
     SEÇÃO 2 — MANIFESTO (SLIDESHOW KEN BURNS)
     ========================================== */

  function initSlideshow() {
    const slides = document.querySelectorAll('#manifesto .slide');
    if (slides.length < 2) return;

    let atual = 0;
    setInterval(function () {
      slides[atual].classList.remove('ativo');
      atual = (atual + 1) % slides.length;
      slides[atual].classList.add('ativo');
    }, 4500);
  }

  initSlideshow();


  /* ==========================================
     SEÇÃO 3 — A HISTÓRIA (CARROSSEL + LOOP)
     ========================================== */

  function initHistoria() {
    const track = document.getElementById('historiaTrack');
    if (!track) return;

    const slides = Array.from(track.children);
    const total  = slides.length;
    const dots    = document.querySelectorAll('.historia-dot');
    let atual     = 0;
    let bloqueado = false;
    let timer;

    // LARGURA: cada slide ocupa 100% da viewport do track
    slides.forEach(function (s) { s.style.width = '100%'; });
    track.style.width = (total * 100) + '%';
    slides.forEach(function (s) { s.style.width = (100 / total) + '%'; });

    function irPara(idx) {
      atual = (idx + total) % total;
      track.style.transform = 'translateX(-' + (atual * (100 / total)) + '%)';
      dots.forEach(function (d, i) { d.classList.toggle('on', i === atual); });
    }

    dots.forEach(function (d, i) {
      d.addEventListener('click', function () {
        irPara(i);
        reiniciarAuto();
      });
    });

    function reiniciarAuto() {
      clearInterval(timer);
      timer = setInterval(function () { if (!bloqueado) irPara(atual + 1); }, 5500);
    }

    // SUPORTE A SWIPE (TOUCH)
    let x0 = null;
    track.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) { irPara(atual + (dx < 0 ? 1 : -1)); reiniciarAuto(); }
      x0 = null;
    }, { passive: true });

    irPara(0);
    reiniciarAuto();
  }

  initHistoria();


  /* ==========================================
     SEÇÃO 5 — COLEÇÕES (MARQUEE)
     ========================================== */

  const marqueeItens = [
    'Há quase 20 anos',
    'Moda feminina & festa',
    'Multimarcas selecionadas',
    'Atendimento personalizado',
    'Elegância em cada detalhe',
    'Uma experiência, não apenas uma loja',
  ];

  const marqueeTrack = document.getElementById('marqueeTrack');
  if (marqueeTrack) {
    // DUPLICA OS ITENS PARA LOOP CONTÍNUO
    [].concat(marqueeItens, marqueeItens).forEach(function (texto) {
      const item = document.createElement('span');
      item.className = 'marquee-item';
      item.innerHTML = '<span>' + texto + '</span><i>A</i>';
      marqueeTrack.appendChild(item);
    });
  }


})();