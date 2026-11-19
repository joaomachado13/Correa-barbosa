import { initFormInteractions, initGuidedForms } from './forms.js?v=8';

document.documentElement.classList.add('js-enabled');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let pageController = new AbortController();
let pageCleanup = [];

function onPage(target, event, callback, options = {}) {
  target.addEventListener(event, callback, { ...options, signal: pageController.signal });
}

/**
 * CBE — CORRÊA BARBOSA ENGENHARIA
 * main.js — Lógica de Interatividade Pura (Sem Frameworks)
 */

// Instância Global do Smooth Scroll e Swup
let lenisInstance = null;
let swupInstance = null;
let stopSmoothScroll = () => {};

document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initSplashOla();
  initPageScripts();
  initSwupTransitions();
});

/**
 * Inicializa todos os módulos interativos da página ativa
 */
function initPageScripts() {
  pageController.abort();
  pageCleanup.forEach(cleanup => cleanup());
  pageCleanup = [];
  pageController = new AbortController();
  initMobileMenu();
  initHeroEntranceAnimation();
  initHeroMouseTilt();
  initFloatingWhatsAppWidget();
  initCatalogFilters();
  initOrcamentoFlows();
  initGuidedForms();
  initFormInteractions();
  initMouseRevealEffect();
  initPartnersMarqueeSpeed();
  initFlipCards();
  initCardActionPreselect();
  initSocialLinks();
  initDepthCarousel();
  initFaqAccordion();
  updateActiveNavigation();
}

/**
 * 1. Splash de Entrada — Animação "Olá"
 */
function initSplashOla() {
  const splash = document.getElementById('cbe-splash-screen');
  if (!splash) return;
  let seen = false;
  try { seen = sessionStorage.getItem('cbe_splash_seen') === 'true'; } catch { /* Storage may be disabled. */ }
  if (seen || motionPreference.matches) {
    splash.remove();
    return;
  }
  splash.classList.add('splash-active');
  const finish = () => {
    splash.remove();
    try { sessionStorage.setItem('cbe_splash_seen', 'true'); } catch { /* Keep navigation usable. */ }
    document.dispatchEvent(new CustomEvent('splashComplete'));
  };
  const timeout = setTimeout(finish, 900);
  splash.addEventListener('click', () => { clearTimeout(timeout); finish(); }, { once: true });
}

/**
 * Animação de Entrada do Hero Sincronizada com o Splash (GSAP)
 */
function initHeroEntranceAnimation() {
  const heroContent = document.querySelector('.hero-content');
  const heroImg = document.querySelector('.hero-bg-photo') || document.querySelector('.hero-quadro-full-img') || document.querySelector('.hero-quadro-img');
  if (!heroContent || !heroImg || typeof gsap === 'undefined' || motionPreference.matches) return;

  const hasSplash = document.getElementById('cbe-splash-screen');
  const isSplashActive = hasSplash?.classList.contains('splash-active');

  function triggerAnimation() {
    const elementsToAnimate = [
      heroContent.querySelector('.section-subtitle'),
      heroContent.querySelector('.hero-title'),
      heroContent.querySelector('.hero-description'),
      heroContent.querySelector('.hero-actions')
    ].filter(Boolean);

    pageCleanup.push(() => gsap.killTweensOf([...elementsToAnimate, heroImg]));
    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' }
    });

    // Texto entrando com stagger de 0.15s
    tl.fromTo(elementsToAnimate,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 }
    );

    // Imagem do Quadro Elétrico entrando com fade-in + leve scale (0.95 -> 1) e deslocamento de 20px -> 0, duração 1.0s
    tl.fromTo(heroImg,
      { opacity: 0, scale: 0.95, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 1.0 },
      "-=0.65"
    );

    // Micro-interação no scroll leve com ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.to(heroImg, {
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2
        },
        y: 20,
        ease: 'none'
      });
    }
  }

  if (isSplashActive) {
    document.addEventListener('splashComplete', () => {
      setTimeout(triggerAnimation, 120);
    }, { once: true });
  } else {
    setTimeout(triggerAnimation, 60);
  }
}

let revealAnimCounter = 0;
const REVEAL_TYPES = ['circle', 'square', 'gradient'];

document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (link && link.href && (link.href.startsWith(window.location.origin) || !link.getAttribute('href')?.startsWith('http'))) {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    document.documentElement.style.setProperty('--click-x', x.toFixed(3));
    document.documentElement.style.setProperty('--click-y', y.toFixed(3));

    if (!link.dataset.swupAnimation) {
      const chosen = REVEAL_TYPES[revealAnimCounter % REVEAL_TYPES.length];
      revealAnimCounter++;
      link.dataset.swupAnimation = chosen;
    }
  }
});

/**
 * 2. Transições Reveal Oficiais via Swup.js (Circle, Square, Gradient)
 */
function initSwupTransitions() {
  if (typeof Swup === 'undefined') return;

  swupInstance = new Swup({
    containers: ['#swup'],
    animateHistoryBrowsing: true,
    animationSelector: motionPreference.matches ? false : '[class*="transition-"]'
  });

  swupInstance.hooks.on('visit:start', (visit) => {
    const triggerEl = visit.trigger.el;
    const animType = triggerEl?.dataset?.swupAnimation || REVEAL_TYPES[revealAnimCounter % REVEAL_TYPES.length];
    document.documentElement.classList.remove('to-circle', 'to-square', 'to-gradient');
    document.documentElement.classList.add(`to-${animType}`);
  });

  swupInstance.hooks.on('visit:end', () => {
    document.documentElement.classList.remove('to-circle', 'to-square', 'to-gradient');
  });

  swupInstance.hooks.on('page:view', () => {
    // 1. Reseta o scroll para o topo de forma instantânea
    if (lenisInstance) {
      lenisInstance.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    // 2. Limpa ScrollTriggers anteriores
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    }

    // 3. Reinicia scripts e interatividades da nova página
    initPageScripts();

    document.getElementById('swup')?.focus({ preventScroll: true });
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();

    // 4. Recalcula triggers do GSAP
  });
}

/**
 * Atualiza o link ativo no menu de navegação
 */
function updateActiveNavigation() {
  const quoteHref = document.getElementById('swup')?.dataset.quoteHref || 'contato.html#contact-engineering-form';
  document.querySelectorAll('.site-header [data-quote-link]').forEach(link => {
    link.setAttribute('href', quoteHref);
  });
  const leaf = window.location.pathname.split('/').filter(Boolean).pop();
  const currentPath = !leaf ? 'index.html' : leaf.endsWith('.html') ? leaf : `${leaf}.html`;
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html') || (href === 'solucoes.html' && document.querySelector('[data-areas-page]'))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Inicializa o Scroll Suave (Smooth Scrolling de Alto Desempenho) integrado ao GSAP
 */
function initSmoothScroll() {
  stopSmoothScroll();
  lenisInstance = null;
  if (typeof Lenis === 'undefined' || motionPreference.matches) return;
  const instance = new Lenis({
    duration: 1.25,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical', smoothWheel: true, wheelMultiplier: 0.95,
    touchMultiplier: 1.8
  });
  lenisInstance = instance;
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    instance.on('scroll', ScrollTrigger.update);
    const tick = time => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    stopSmoothScroll = () => { gsap.ticker.remove(tick); instance.destroy(); };
  } else {
    let frame;
    const tick = time => { instance.raf(time); frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick);
    stopSmoothScroll = () => { cancelAnimationFrame(frame); instance.destroy(); };
  }
}

/**
 * Força a velocidade extremamente lenta e suave no carrossel de parceiros
 */
function initPartnersMarqueeSpeed() {
  const tracks = document.querySelectorAll('.partners-track');
  tracks.forEach(track => {
    track.style.setProperty('animation-duration', '280s', 'important');
    track.style.setProperty('animation-timing-function', 'linear', 'important');
    track.style.setProperty('animation-iteration-count', 'infinite', 'important');
  });
}

/**
 * Efeito Mouse Reveal / Spotlight nos cards de Parceiros
 */
function initMouseRevealEffect() {
  const partnerCards = document.querySelectorAll('.partner-card');
  partnerCards.forEach(card => {
    onPage(card, 'mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/**
 * Menu Mobile com Drawer Animado, Backdrop e Bloqueio de Scroll
 */
function initMobileMenu() {
  const toggle = document.getElementById('mobile-toggle-btn');
  const menu = document.getElementById('main-nav-menu');
  if (!toggle || !menu) return;
  let backdrop = document.getElementById('mobile-nav-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'mobile-nav-backdrop';
    backdrop.className = 'mobile-nav-backdrop';
    document.body.append(backdrop);
  }
  const background = [document.getElementById('swup'), document.querySelector('footer'), document.getElementById('whatsapp-widget')].filter(Boolean);
  const isOpen = () => menu.classList.contains('mobile-open');
  function close(restoreFocus = false) {
    menu.classList.remove('mobile-open');
    toggle.classList.remove('is-active');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir Menu');
    backdrop.classList.remove('is-visible');
    background.forEach(element => { element.inert = false; });
    document.body.style.overflow = '';
    if (restoreFocus) toggle.focus();
  }
  function open() {
    menu.classList.add('mobile-open');
    toggle.classList.add('is-active');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar Menu');
    backdrop.classList.add('is-visible');
    background.forEach(element => { element.inert = true; });
    document.body.style.overflow = 'hidden';
    menu.querySelector('a')?.focus();
  }
  onPage(toggle, 'click', () => isOpen() ? close(true) : open());
  onPage(backdrop, 'click', () => close(true));
  onPage(menu, 'click', event => { if (event.target.closest('a')) close(); });
  onPage(document, 'keydown', event => {
    if (!isOpen()) return;
    if (event.key === 'Escape') { event.preventDefault(); close(true); }
    if (event.key === 'Tab') {
      const controls = [...menu.querySelectorAll('a[href]'), toggle].filter(el => el.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  onPage(window, 'resize', () => { if (window.innerWidth > 992) close(); });
  pageCleanup.push(() => close());
}

/**
 * Filtros do Catálogo de Quadros Elétricos (Abas e Cards de Famílias)
 */
function initCatalogFilters() {
  const filterBtns = document.querySelectorAll('.filter-tab-btn, .catalog-filter-btn');
  const catalogCards = document.querySelectorAll('.catalog-card, .cbe-compact-card');

  if (!filterBtns.length && !catalogCards.length) return;

  function applyFilter(filterValue) {
    filterBtns.forEach(b => {
      if (b.getAttribute('data-filter') === filterValue) {
        b.classList.add('active');
        b.setAttribute('aria-pressed', 'true');
      } else {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      }
    });

    catalogCards.forEach(card => {
      const category = card.getAttribute('data-category') || '';
      const categoryList = category.split(/\s+/);
      if (filterValue === 'all' || categoryList.includes(filterValue) || category === filterValue) {
        card.style.display = '';
        card.style.opacity = '1';
      } else {
        card.style.display = 'none';
        card.style.opacity = '0';
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.setAttribute('aria-pressed', String(btn.classList.contains('active')));
    onPage(btn, 'click', () => {
      const filterValue = btn.getAttribute('data-filter');
      applyFilter(filterValue);
    });
  });

  // Interatividade nos Cards de Famílias do Topo
  const familyCards = document.querySelectorAll('.family-guide-card');
  familyCards.forEach(card => {
    const action = card.querySelector('.family-action-link');
    if (!action) return;
    onPage(action, 'click', () => {
      const explicitCat = card.getAttribute('data-category-target');
      const text = card.innerText.toLowerCase();
      let targetCat = explicitCat || 'all';
      if (!explicitCat) {
        if (text.includes('comando') || text.includes('automação')) targetCat = 'comando';
        else if (text.includes('ccm') || text.includes('acionamento')) targetCat = 'ccm';
        else if (text.includes('qgbt') || text.includes('distribuição')) targetCat = 'distribuicao';
        else if (text.includes('especia') || text.includes('barramento')) targetCat = 'especiais';
      }

      applyFilter(targetCat);

      const targetGrid = document.querySelector('.cbe-compact-grid, #catalogo');
      if (targetGrid) {
        if (lenisInstance) {
          lenisInstance.scrollTo(targetGrid, { offset: -90 });
        } else {
          targetGrid.scrollIntoView({ behavior: motionPreference.matches ? 'instant' : 'smooth' });
        }
      }
    });
  });
}

/**
 * Seleção dos 2 Caminhos de Orçamento (Técnico / Guiado)
 */
function initOrcamentoFlows() {
  const optionCards = document.querySelectorAll('.orcamento-option-card');
  const flowTecnico = document.getElementById('flow-tecnico');
  const flowGuiado = document.getElementById('flow-guiado');

  if (!optionCards.length || !flowTecnico || !flowGuiado) return;

  optionCards.forEach(card => {
    onPage(card, 'click', () => {
      optionCards.forEach(c => { c.classList.remove('active'); c.setAttribute('aria-pressed', 'false'); });
      card.classList.add('active');
      card.setAttribute('aria-pressed', 'true');

      const selectedFlow = card.getAttribute('data-flow');

      if (selectedFlow === 'tecnico') {
        flowTecnico.classList.add('active');
        flowGuiado.classList.remove('active');
      } else {
        flowGuiado.classList.add('active');
        flowTecnico.classList.remove('active');
      }
    });
  });
}

/**
 * Flip Cards 3D — Interatividade e Alternância por Clique/Toque
 */
function initFlipCards() {
  document.querySelectorAll('.cbe-compact-card').forEach((card, index) => {
    const front = card.querySelector('.cbe-compact-front');
    const back = card.querySelector('.cbe-compact-back');
    const open = card.querySelector('.cbe-flip-cue');
    const close = card.querySelector('.flip-return');
    if (!front || !back || !open || !close) return;
    back.id = `card-specifications-${index}`;
    open.setAttribute('aria-controls', back.id);
    open.setAttribute('aria-label', `Ver especificações: ${card.querySelector('.panel-title').textContent}`);
    function flip(expanded) {
      card.classList.toggle('is-flipped', expanded);
      open.setAttribute('aria-expanded', String(expanded));
      front.inert = expanded;
      back.inert = !expanded;
      front.setAttribute('aria-hidden', String(expanded));
      back.setAttribute('aria-hidden', String(!expanded));
      (expanded ? close : open).focus({ preventScroll: true });
    }
    onPage(open, 'click', () => flip(true));
    onPage(close, 'click', () => flip(false));
    onPage(back, 'keydown', event => { if (event.key === 'Escape') flip(false); });
    onPage(card, 'click', event => {
      if (!event.target.closest('button,a')) flip(!card.classList.contains('is-flipped'));
    });
  });
}

/**
 * Widget Flutuante de WhatsApp — Alternância e Ações Rápidas
 */
function initFloatingWhatsAppWidget() {
  const widget = document.getElementById('whatsapp-widget');
  const trigger = document.getElementById('toggle-whatsapp-widget');
  const close = document.getElementById('close-whatsapp-card');
  if (!widget || !trigger) return;
  function setOpen(open, restore = false) {
    widget.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
    if (open) close?.focus();
    else if (restore) trigger.focus();
  }
  onPage(trigger, 'click', () => setOpen(!widget.classList.contains('is-open')));
  if (close) onPage(close, 'click', () => setOpen(false, true));
  onPage(document, 'click', event => { if (!widget.contains(event.target)) setOpen(false); });
  onPage(document, 'keydown', event => {
    if (event.key === 'Escape' && widget.classList.contains('is-open')) setOpen(false, true);
  });
  pageCleanup.push(() => setOpen(false));
}

/**
 * Pré-seleção inteligente de categorias ao solicitar orçamento a partir dos cards
 */
function initCardActionPreselect() {
  // 1. Clique interno nos botões de orçamento dentro dos cards (na Home)
  const cardCtaBtns = document.querySelectorAll('.card-orcamento-btn, .back-action-btn');
  const selectCtaHome = document.getElementById('tipo_cta');

  cardCtaBtns.forEach(btn => {
    onPage(btn, 'click', (e) => {
      const card = btn.closest('.cbe-compact-card, .catalog-card, .expository-plate');
      const tipo = btn.getAttribute('data-tipo') || (card ? card.getAttribute('data-category') : '');
      const href = btn.getAttribute('href') || '';

      if (href.startsWith('#orcamento') && selectCtaHome) {
        e.preventDefault();
        if (tipo) {
          applyCategoryToSelect(selectCtaHome, tipo);
        }
        const orcamentoSection = document.getElementById('orcamento');
        if (orcamentoSection) {
          if (lenisInstance) {
            lenisInstance.scrollTo(orcamentoSection, { offset: -40 });
          } else {
            orcamentoSection.scrollIntoView({ behavior: motionPreference.matches ? 'instant' : 'smooth' });
          }
        }
      }
    });
  });

  // 2. Leitura de parâmetros de URL em orcamento.html (?tipo=... ou ?modelo=...)
  const urlParams = new URLSearchParams(window.location.search);
  const tipoParam = urlParams.get('tipo') || urlParams.get('modelo') || urlParams.get('categoria');
  if (tipoParam) {
    const tecSelect = document.getElementById('tec_tipo_quadro');
    const ctaSelect = document.getElementById('tipo_cta');
    if (tecSelect) applyCategoryToSelect(tecSelect, tipoParam);
    if (ctaSelect) applyCategoryToSelect(ctaSelect, tipoParam);
  }
}

/**
 * Mapeia e seleciona a opção correta no select de orçamento
 */
function applyCategoryToSelect(selectEl, categoryCode) {
  if (!selectEl) return;
  const val = categoryCode.toLowerCase();

  for (let i = 0; i < selectEl.options.length; i++) {
    const opt = selectEl.options[i];
    const optVal = opt.value.toLowerCase();
    const optText = opt.text.toLowerCase();

    if (
      (val.includes('ccm') && optVal.includes('ccm')) ||
      (val.includes('distribuicao') && (optVal.includes('qgbt') || optVal.includes('qdf'))) ||
      (val.includes('comando') && optVal.includes('comando')) ||
      (val.includes('acionamento') && optVal.includes('acionamento')) ||
      (val.includes('especia') && optVal.includes('especia')) ||
      optVal === val ||
      optText.includes(val)
    ) {
      selectEl.selectedIndex = i;
      selectEl.style.borderColor = '#EC3237';
      setTimeout(() => {
        selectEl.style.borderColor = '';
      }, 1500);
      break;
    }
  }
}

/**
 * Simulação de profundidade e Mouse-Tilt 3D na Fotografia do Hero da Home
 */
function initHeroMouseTilt() {
  const heroSection = document.querySelector('.hero-section');
  const heroImg = document.getElementById('hero-main-img') || document.querySelector('.hero-bg-photo');
  if (!heroSection || !heroImg) return;

  if (window.innerWidth <= 900 || motionPreference.matches) return;

  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;
  let isHovering = false;
  let rafId = null;
  pageCleanup.push(() => { if (rafId) cancelAnimationFrame(rafId); });

  onPage(heroSection, 'mouseenter', () => {
    isHovering = true;
    if (!rafId) updateTilt();
  });

  onPage(heroSection, 'mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  onPage(heroSection, 'mouseleave', () => {
    isHovering = false;
    mouseX = 0;
    mouseY = 0;
  });

  function updateTilt() {
    currentX += (mouseX - currentX) * 0.08;
    currentY += (mouseY - currentY) * 0.08;

    const tiltX = currentY * -4;
    const tiltY = currentX * 5;
    const moveX = currentX * 12;
    const moveY = currentY * 8;

    heroImg.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translate3d(${moveX.toFixed(1)}px, ${moveY.toFixed(1)}px, 0px) scale(1.03)`;

    if (isHovering || Math.abs(currentX) > 0.001 || Math.abs(currentY) > 0.001) {
      rafId = requestAnimationFrame(updateTilt);
    } else {
      heroImg.style.transform = '';
      rafId = null;
    }
  }
}

/**
 * 13. Redes Sociais Isométricas — Configuração de Interação
 */
function initSocialLinks() {
  // O link HTML <a> nativo já cuida da abertura única em nova aba com target="_blank".
}

/**
 * 14. DepthCarousel — Carrossel 3D de Profundidade com Cases Reais e Hover
 */
function initDepthCarousel() {
  const stage = document.querySelector('.depth-carousel-stage');
  const cards = Array.from(document.querySelectorAll('.depth-card'));
  const prevBtn = document.querySelector('.depth-prev-btn');
  const nextBtn = document.querySelector('.depth-next-btn');
  const indicatorsContainer = document.querySelector('.depth-indicators');

  if (!stage || !cards.length) return;

  let activeIndex = 0;
  const total = cards.length;
  const depth = 220; // translateZ step
  const spread = 75; // translateX step %
  const falloff = 0.2; // scale falloff
  const maxBlur = 11; // blur px step
  let isAutoplay = !motionPreference.matches;
  let autoplayTimer = null;
  const pauseBtn = document.querySelector('.depth-pause-btn');
  if (pauseBtn) {
    pauseBtn.textContent = isAutoplay ? 'Pausar' : 'Reproduzir';
    pauseBtn.setAttribute('aria-pressed', String(!isAutoplay));
    onPage(pauseBtn, 'click', () => {
      isAutoplay = !isAutoplay;
      pauseBtn.textContent = isAutoplay ? 'Pausar' : 'Reproduzir';
      pauseBtn.setAttribute('aria-pressed', String(!isAutoplay));
      clearInterval(autoplayTimer);
      if (isAutoplay) startAutoplay();
    });
  }
  pageCleanup.push(() => clearInterval(autoplayTimer));

  // Cria indicadores de paginação
  if (indicatorsContainer) {
    indicatorsContainer.innerHTML = '';
    cards.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.className = `depth-dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Ir para o Case ${idx + 1}`);
      onPage(dot, 'click', () => {
        goToIndex(idx);
        resetAutoplay();
      });
      indicatorsContainer.appendChild(dot);
    });
  }

  function updateCards() {
    const dots = document.querySelectorAll('.depth-dot');

    cards.forEach((card, index) => {
      // Calcula o deslocamento relativo cíclico mais curto
      let offset = index - activeIndex;
      if (offset > total / 2) offset -= total;
      if (offset < -total / 2) offset += total;

      const absOffset = Math.abs(offset);
      const isVisible = absOffset <= 3;

      if (!isVisible) {
        card.style.opacity = '0';
        card.style.pointerEvents = 'none';
        card.style.transform = `translateX(${offset * 120}%) translateZ(-800px) scale(0.5)`;
        card.style.filter = 'blur(16px)';
        card.style.zIndex = '0';
        return;
      }

      // Parâmetros de profundidade 3D
      const translateX = offset * spread;
      const translateZ = -absOffset * depth;
      const scale = Math.max(0.6, 1 - absOffset * falloff);
      const opacity = absOffset === 0 ? 1 : Math.max(0.25, 1 - absOffset * 0.26);
      const blurVal = absOffset * (maxBlur / 2.5);
      const zIndex = 100 - absOffset * 10;

      card.style.opacity = opacity.toFixed(2);
      card.style.pointerEvents = isVisible ? 'auto' : 'none';
      card.style.zIndex = zIndex;
      card.style.transform = `translateX(${translateX}%) translateZ(${translateZ}px) scale(${scale})`;
      card.style.filter = blurVal > 0.5 ? `blur(${blurVal.toFixed(1)}px)` : 'none';

      card.setAttribute('aria-hidden', String(absOffset !== 0));
      if (absOffset === 0) {
        card.classList.add('active-card');
      } else {
        card.classList.remove('active-card');
      }
    });

    if (dots.length) {
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === activeIndex);
        dot.setAttribute('aria-current', String(idx === activeIndex));
      });
    }
  }

  function goToIndex(index) {
    activeIndex = (index + total) % total;
    updateCards();
  }

  function nextCard() {
    goToIndex(activeIndex + 1);
  }

  function prevCard() {
    goToIndex(activeIndex - 1);
  }

  if (prevBtn) {
    onPage(prevBtn, 'click', () => {
      prevCard();
      resetAutoplay();
    });
  }

  if (nextBtn) {
    onPage(nextBtn, 'click', () => {
      nextCard();
      resetAutoplay();
    });
  }

  // Clique direto no card para centralizá-lo
  cards.forEach((card, idx) => {
    onPage(card, 'click', () => {
      if (idx !== activeIndex) {
        goToIndex(idx);
        resetAutoplay();
      }
    });
  });

  // Autoplay suave com pausa em hover
  function startAutoplay() {
    if (!isAutoplay || !stage.isConnected) return;
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(() => {
      nextCard();
    }, 4000);
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  onPage(stage, 'mouseenter', () => {
    clearInterval(autoplayTimer);
  });

  onPage(stage, 'mouseleave', () => {
    startAutoplay();
  });

  onPage(stage, 'focusin', () => clearInterval(autoplayTimer));
  onPage(stage, 'focusout', () => startAutoplay());

  // Suporte a swipe no mobile
  let touchStartX = 0;
  let touchEndX = 0;

  onPage(stage, 'touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  onPage(stage, 'touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextCard();
      } else {
        prevCard();
      }
      resetAutoplay();
    }
  }, { passive: true });

  updateCards();
  startAutoplay();
}

/**
 * 15. FAQ Accordion — Expansão Suave das Perguntas Técnicas
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach((item, index) => {
    const btn = item.querySelector('.faq-question-btn');
    const collapse = item.querySelector('.faq-answer-collapse');
    if (!btn || !collapse) return;

    // O primeiro item inicia expandido
    if (index === 0) {
      item.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
      collapse.style.maxHeight = collapse.scrollHeight + 'px';
    } else {
      btn.setAttribute('aria-expanded', 'false');
      collapse.style.maxHeight = '0px';
    }

    onPage(btn, 'click', () => {
      const isActive = item.classList.contains('active');

      // Fecha outros itens para foco limpo
      faqItems.forEach(other => {
        if (other !== item && other.classList.contains('active')) {
          other.classList.remove('active');
          const otherBtn = other.querySelector('.faq-question-btn');
          const otherCollapse = other.querySelector('.faq-answer-collapse');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherCollapse) otherCollapse.style.maxHeight = '0px';
        }
      });

      if (isActive) {
        item.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
        collapse.style.maxHeight = '0px';
      } else {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
        collapse.style.maxHeight = collapse.scrollHeight + 'px';
      }
    });
  });
}

// Apply a changed system preference without requiring a reload.
motionPreference.addEventListener('change', () => {
  if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  initSmoothScroll();
  initPageScripts();
});
