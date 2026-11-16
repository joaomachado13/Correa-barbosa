(() => {
  document.documentElement.classList.add('js');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const splash = document.getElementById('cbe-splash');
  const splashLogo = splash ? splash.querySelector('.splash-logo') : null;
  const headerLogo = document.querySelector('.brand-logo img');

  function finishSplash() {
    document.body.classList.add('splash-complete');
    if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
    try { sessionStorage.setItem('cbe_splash_seen', 'true'); } catch (error) {}
  }

  let hasSeenSplash = false;
  try { hasSeenSplash = sessionStorage.getItem('cbe_splash_seen') === 'true'; } catch (error) {}

  if (splash && (hasSeenSplash || reduceMotion || !window.gsap || !splashLogo || !headerLogo)) {
    finishSplash();
  } else if (splash && splashLogo && headerLogo) {
    const from = splashLogo.getBoundingClientRect();
    const to = headerLogo.getBoundingClientRect();
    const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
    const dy = (to.top + to.height / 2) - (from.top + from.height / 2);
    const scale = to.width / from.width;
    const timeline = window.gsap.timeline({ onComplete: finishSplash });
    timeline.to(splashLogo, { clipPath: 'inset(0 0% 0 0)', duration: 1.4, ease: 'power3.inOut' });
    timeline.to({}, { duration: 0.3 });
    timeline.to(splashLogo, { x: dx, y: dy, scale: scale, duration: 1.2, ease: 'power3.inOut' });
    timeline.to(splash, { opacity: 0, duration: 0.4, ease: 'power1.out' });
  }

  const toggle = document.getElementById('mobile-toggle-btn');
  const nav = document.getElementById('main-nav-menu');
  if (toggle && nav) {
    const closeMenu = () => {
      nav.parentElement.classList.remove('is-open');
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', () => {
      const open = nav.parentElement.classList.toggle('is-open');
      toggle.classList.toggle('is-active', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 820) closeMenu(); });
  }

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const transition = document.getElementById('page-transition');
  let navigating = false;
  if (transition && !reduceMotion) {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;
      const rawHref = link.getAttribute('href') || '';
      if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:') || rawHref.startsWith('javascript:')) return;
      let targetUrl;
      try { targetUrl = new URL(link.href, window.location.href); } catch (error) { return; }
      if (targetUrl.origin !== window.location.origin || targetUrl.pathname === window.location.pathname) return;
      event.preventDefault();
      if (navigating) return;
      navigating = true;
      transition.classList.add('is-active');
      window.setTimeout(() => { window.location.href = targetUrl.href; }, 420);
    });
  }

  document.querySelectorAll('[data-current-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
})();