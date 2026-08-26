/**
 * CBE — CORRÊA BARBOSA ENGENHARIA
 * main.js — Lógica de Interatividade Pura (Sem Frameworks)
 */

// Instância Global do Smooth Scroll e Swup
let lenisInstance = null;
let swupInstance = null;

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
  initMobileMenu();
  initHeroEntranceAnimation();
  initHeroMouseTilt();
  initFloatingWhatsAppWidget();
  initCatalogFilters();
  initOrcamentoFlows();
  initFormInteractions();
  initMouseRevealEffect();
  initPartnersMarqueeSpeed();
  initExpositoryLookbook();
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
  const splashEl = document.getElementById('cbe-splash-screen');
  if (!splashEl) return;

  // Verifica se o splash já foi exibido nesta sessão
  const hasSeenSplash = sessionStorage.getItem('cbe_splash_seen');
  if (hasSeenSplash) {
    splashEl.remove();
    return;
  }

  // Trava o scroll da página durante o splash
  document.body.style.overflow = 'hidden';
  if (lenisInstance) {
    lenisInstance.stop();
  }

  const letterStrokes = Array.from(splashEl.querySelectorAll('.letter-stroke'));
  const letterFills = Array.from(splashEl.querySelectorAll('.letter-fill'));

  if (!letterStrokes.length) {
    unlockScrollAndHideSplash();
    return;
  }

  const lengths = letterStrokes.map(p => {
    try {
      return p.getTotalLength();
    } catch (e) {
      return 1000;
    }
  });
  const progress = lengths.map(() => 0);

  letterStrokes.forEach((p, i) => {
    p.style.strokeDasharray = lengths[i];
    p.style.strokeDashoffset = lengths[i];
  });

  // Parâmetros de ritmo do traço
  const STEP = 0.18;        // 18% por letra (mais ágil)
  const TICK_MS = 95;       // Intervalo do rodízio
  let order = letterStrokes.map((_, i) => i);

  function tick() {
    order = order.filter(i => progress[i] < 1);

    if (order.length === 0) {
      finishSequence();
      return;
    }

    const i = order.shift();
    progress[i] = Math.min(1, progress[i] + STEP);
    const offset = lengths[i] * (1 - progress[i]);
    letterStrokes[i].style.transition = `stroke-dashoffset ${TICK_MS * 0.9}ms linear`;
    letterStrokes[i].style.strokeDashoffset = offset;

    if (progress[i] < 1) {
      order.push(i);
    }

    setTimeout(tick, TICK_MS);
  }

  function finishSequence() {
    // Preenchimento sequencial com delay
    letterFills.forEach((fill, i) => {
      setTimeout(() => {
        fill.style.opacity = '1';
      }, i * 180);
    });

    const totalFillTime = letterFills.length * 180 + 500;
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('splashComplete'));
    }, totalFillTime);
  }

  document.addEventListener('splashComplete', () => {
    sessionStorage.setItem('cbe_splash_seen', 'true');
    unlockScrollAndHideSplash();
  }, { once: true });

  function unlockScrollAndHideSplash() {
    splashEl.classList.add('splash-hidden');
    document.body.style.overflow = '';
    if (lenisInstance) {
      lenisInstance.start();
    }
    setTimeout(() => {
      if (splashEl.parentNode) {
        splashEl.parentNode.removeChild(splashEl);
      }
    }, 700);
  }

  // Delay inicial de início do traço
  setTimeout(tick, 200);
}

/**
 * Animação de Entrada do Hero Sincronizada com o Splash (GSAP)
 */
function initHeroEntranceAnimation() {
  const heroContent = document.querySelector('.hero-content');
  const heroImg = document.querySelector('.hero-bg-photo') || document.querySelector('.hero-quadro-full-img') || document.querySelector('.hero-quadro-img');
  if (!heroContent || !heroImg || typeof gsap === 'undefined') return;

  const hasSplash = document.getElementById('cbe-splash-screen');
  const isSplashActive = hasSplash && !sessionStorage.getItem('cbe_splash_seen');

  function triggerAnimation() {
    const elementsToAnimate = [
      heroContent.querySelector('.section-subtitle'),
      heroContent.querySelector('.hero-title'),
      heroContent.querySelector('.hero-description'),
      heroContent.querySelector('.hero-actions')
    ].filter(Boolean);

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
    animateHistoryBrowsing: true
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

    // 4. Recalcula triggers do GSAP
  });
}

/**
 * Atualiza o link ativo no menu de navegação
 */
function updateActiveNavigation() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
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
  if (typeof Lenis === 'undefined') return;

  lenisInstance = new Lenis({
    duration: 1.25,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.8,
    infinite: false,
  });

  // Sincroniza o Lenis com o GSAP ScrollTrigger
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    lenisInstance.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenisInstance.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
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
    card.addEventListener('mousemove', (e) => {
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
  const toggleBtn = document.getElementById('mobile-toggle-btn');
  const navMenu = document.getElementById('main-nav-menu');
  let backdrop = document.getElementById('mobile-nav-backdrop');

  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'mobile-nav-backdrop';
    backdrop.className = 'mobile-nav-backdrop';
    document.body.appendChild(backdrop);
  }

  if (!toggleBtn || !navMenu) return;

  function openMenu() {
    navMenu.classList.add('mobile-open');
    toggleBtn.classList.add('is-active');
    toggleBtn.setAttribute('aria-expanded', 'true');
    backdrop.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navMenu.classList.remove('mobile-open');
    toggleBtn.classList.remove('is-active');
    toggleBtn.setAttribute('aria-expanded', 'false');
    backdrop.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    const isOpen = navMenu.classList.contains('mobile-open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  toggleBtn.onclick = (e) => {
    e.stopPropagation();
    toggleMenu();
  };

  backdrop.onclick = () => {
    closeMenu();
  };

  const navLinks = navMenu.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 992 && navMenu.classList.contains('mobile-open')) {
      closeMenu();
    }
  });

  document.addEventListener('swup:visit:start', closeMenu);
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
      } else {
        b.classList.remove('active');
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
    btn.addEventListener('click', () => {
      const filterValue = btn.getAttribute('data-filter');
      applyFilter(filterValue);
    });
  });

  // Interatividade nos Cards de Famílias do Topo
  const familyCards = document.querySelectorAll('.family-guide-card');
  familyCards.forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
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
          targetGrid.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

/**
 * Catálogo Técnico Expositivo — Modo Lookbook, Modal de Inspeção e Impressão
 */
function initExpositoryLookbook() {
  const btnLookbook = document.getElementById('btn-view-lookbook');
  const btnGrid = document.getElementById('btn-view-grid');
  const lookbookContainer = document.getElementById('lookbook-container');
  const gridContainer = document.getElementById('grid-container');
  const printBtn = document.getElementById('btn-print-catalog');

  // Alternância entre Modo Lookbook (Lâminas) e Modo Grade
  if (btnLookbook && btnGrid && lookbookContainer && gridContainer) {
    btnLookbook.addEventListener('click', () => {
      btnLookbook.classList.add('active');
      btnGrid.classList.remove('active');
      lookbookContainer.style.display = 'flex';
      gridContainer.style.display = 'none';
    });

    btnGrid.addEventListener('click', () => {
      btnGrid.classList.add('active');
      btnLookbook.classList.remove('active');
      gridContainer.style.display = 'grid';
      lookbookContainer.style.display = 'none';
    });
  }

  // Ação de Impressão / Exportação PDF
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Modal de Inspeção em Alta Resolução (Showroom)
  const modalBackdrop = document.getElementById('inspection-modal');
  const modalImg = document.getElementById('modal-inspect-img');
  const modalTitle = document.getElementById('modal-inspect-title');
  const modalSerial = document.getElementById('modal-inspect-serial');
  const modalDesc = document.getElementById('modal-inspect-desc');
  const modalClose = document.getElementById('modal-inspect-close');

  if (modalBackdrop && modalClose) {
    const triggerElements = document.querySelectorAll('.trigger-inspect-modal');
    triggerElements.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const plate = trigger.closest('.expository-plate') || trigger.closest('.catalog-card');
        if (!plate) return;

        const imgSrc = plate.querySelector('img') ? plate.querySelector('img').src : '';
        const title = plate.querySelector('.plate-main-title') ? plate.querySelector('.plate-main-title').innerText : (plate.querySelector('.catalog-card-title') ? plate.querySelector('.catalog-card-title').innerText : 'Painel Elétrico CBE');
        const serial = plate.querySelector('.plate-serial-badge') ? plate.querySelector('.plate-serial-badge').innerText : (plate.querySelector('.catalog-category-name') ? plate.querySelector('.catalog-category-name').innerText : 'CBE INDUSTRIAL');
        const desc = plate.querySelector('.plate-desc-text') ? plate.querySelector('.plate-desc-text').innerText : (plate.querySelector('.catalog-card-desc') ? plate.querySelector('.catalog-card-desc').innerText : '');

        if (modalImg) modalImg.src = imgSrc;
        if (modalTitle) modalTitle.innerText = title;
        if (modalSerial) modalSerial.innerText = serial;
        if (modalDesc) modalDesc.innerText = desc;

        modalBackdrop.classList.add('active');
      });
    });

    modalClose.addEventListener('click', () => {
      modalBackdrop.classList.remove('active');
    });

    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        modalBackdrop.classList.remove('active');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalBackdrop.classList.contains('active')) {
        modalBackdrop.classList.remove('active');
      }
    });
  }
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
    card.addEventListener('click', () => {
      optionCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

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
 * 7. Manipulação de Formulários e Feedbacks de Envio (Home, Catálogo, Contato, Orçamento)
 */
function initFormInteractions() {
  const forms = document.querySelectorAll('form');
  if (!forms.length) return;

  // Interatividade dos Chips de Assunto em contato.html
  const topicChips = document.querySelectorAll('.topic-chip');
  const subjectSelect = document.getElementById('ct_assunto');
  if (topicChips.length && subjectSelect) {
    topicChips.forEach(chip => {
      chip.addEventListener('click', () => {
        topicChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const topic = chip.getAttribute('data-topic');
        if (topic) {
          subjectSelect.value = topic;
          subjectSelect.dispatchEvent(new Event('change'));
        }
      });
    });

    subjectSelect.addEventListener('change', () => {
      topicChips.forEach(c => {
        if (c.getAttribute('data-topic') === subjectSelect.value) {
          c.classList.add('active');
        } else {
          c.classList.remove('active');
        }
      });
    });
  }

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalHtml = submitBtn ? submitBtn.innerHTML : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.85';
        submitBtn.innerHTML = `<span>Processando envio...</span>`;
      }

      setTimeout(() => {
        let feedbackBox = form.querySelector('.form-success-feedback');
        if (!feedbackBox) {
          feedbackBox = document.createElement('div');
          feedbackBox.className = 'form-success-feedback';
          form.appendChild(feedbackBox);
        }

        feedbackBox.innerHTML = `
          <div style="background: rgba(49, 78, 138, 0.08); border: 1px solid var(--cbe-blue); color: var(--cbe-blue-dark); border-radius: var(--radius-md); padding: 1.25rem; margin-top: 1.25rem; font-size: 0.9375rem; line-height: 1.5; text-align: center;">
            <strong style="display: block; font-family: var(--font-heading); font-size: 1.05rem; margin-bottom: 0.35rem; color: var(--cbe-blue-dark);">Solicitação Enviada com Sucesso</strong>
            Nossos engenheiros eletricistas receberam sua demanda técnica e retornarão em até 24 horas úteis.
          </div>
        `;

        if (submitBtn) {
          submitBtn.innerHTML = `<span>Enviado com Sucesso</span>`;
          submitBtn.style.background = '#15803D';
          submitBtn.style.borderColor = '#15803D';
        }

        form.reset();
        topicChips.forEach(c => c.classList.remove('active'));

        setTimeout(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHtml;
            submitBtn.style.background = '';
            submitBtn.style.borderColor = '';
            submitBtn.style.opacity = '1';
          }
        }, 5000);
      }, 700);
    });
  });
}

/**
 * Flip Cards 3D — Interatividade e Alternância por Clique/Toque
 */
function initFlipCards() {
  const flipCards = document.querySelectorAll('.cbe-compact-card, .cbe-flip-card');
  flipCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Se clicou em um link ou botão dentro do card, permite a navegação normal
      if (e.target.closest('a') || e.target.closest('button')) return;
      card.classList.toggle('is-flipped');
    });
  });
}

/**
 * Widget Flutuante de WhatsApp — Alternância e Ações Rápidas
 */
function initFloatingWhatsAppWidget() {
  const widget = document.getElementById('whatsapp-widget');
  const trigger = document.getElementById('toggle-whatsapp-widget');
  const closeBtn = document.getElementById('close-whatsapp-card');
  if (!widget || !trigger) return;

  // Alterna abertura/fechamento ao clicar no botão
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    widget.classList.toggle('is-open');
  });

  // Botão de fechar do card
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      widget.classList.remove('is-open');
    });
  }

  // Fecha ao clicar fora
  document.addEventListener('click', (e) => {
    if (!widget.contains(e.target)) {
      widget.classList.remove('is-open');
    }
  });
}

/**
 * Pré-seleção inteligente de categorias ao solicitar orçamento a partir dos cards
 */
function initCardActionPreselect() {
  // 1. Clique interno nos botões de orçamento dentro dos cards (na Home)
  const cardCtaBtns = document.querySelectorAll('.card-orcamento-btn, .back-action-btn');
  const selectCtaHome = document.getElementById('tipo_cta');

  cardCtaBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
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
            orcamentoSection.scrollIntoView({ behavior: 'smooth' });
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

  if (window.innerWidth <= 900) return;

  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;
  let isHovering = false;
  let rafId = null;

  heroSection.addEventListener('mouseenter', () => {
    isHovering = true;
    if (!rafId) updateTilt();
  });

  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  heroSection.addEventListener('mouseleave', () => {
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
  let isAutoplay = true;
  let autoplayTimer = null;

  // Cria indicadores de paginação
  if (indicatorsContainer) {
    indicatorsContainer.innerHTML = '';
    cards.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.className = `depth-dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Ir para o Case ${idx + 1}`);
      dot.addEventListener('click', () => {
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

      if (absOffset === 0) {
        card.classList.add('active-card');
      } else {
        card.classList.remove('active-card');
      }
    });

    if (dots.length) {
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === activeIndex);
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
    prevBtn.addEventListener('click', () => {
      prevCard();
      resetAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextCard();
      resetAutoplay();
    });
  }

  // Clique direto no card para centralizá-lo
  cards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      if (idx !== activeIndex) {
        goToIndex(idx);
        resetAutoplay();
      }
    });
  });

  // Autoplay suave com pausa em hover
  function startAutoplay() {
    if (!isAutoplay) return;
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(() => {
      nextCard();
    }, 4000);
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  stage.addEventListener('mouseenter', () => {
    clearInterval(autoplayTimer);
  });

  stage.addEventListener('mouseleave', () => {
    startAutoplay();
  });

  // Suporte a swipe no mobile
  let touchStartX = 0;
  let touchEndX = 0;

  stage.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  stage.addEventListener('touchend', (e) => {
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

    btn.addEventListener('click', () => {
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
