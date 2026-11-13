(() => {
  'use strict';

  // Each preview represents a public sample or an illustrative workflow.
  const tabs = Array.from(document.querySelectorAll('.workspace-tabs [role="tab"]'));
  function selectWorkTab(tab, focus) {
    tabs.forEach(candidate => {
      const selected = candidate === tab;
      candidate.setAttribute('aria-selected', String(selected));
      candidate.tabIndex = selected ? 0 : -1;
      document.getElementById(candidate.getAttribute('aria-controls')).hidden = !selected;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectWorkTab(tab, false));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        selectWorkTab(tabs[next], true);
      }
    });
  });

  const menuToggle = document.getElementById('menuToggle');
  const menuClose = document.getElementById('menuClose');
  const siteMenu = document.getElementById('siteMenu');
  const menuBackdrop = document.getElementById('menuBackdrop');
  const background = Array.from(document.querySelectorAll('main, body > nav, body > footer, .skip-link'));
  let previousFocus = null;
  let backgroundState = [];
  let menuFocusTimer = null;

  function closeMenu(returnFocus = true) {
    if (!siteMenu.classList.contains('open')) return;
    if (menuFocusTimer !== null) {
      window.clearTimeout(menuFocusTimer);
      menuFocusTimer = null;
    }
    document.body.classList.remove('menu-open');
    siteMenu.classList.remove('open');
    menuBackdrop.classList.remove('open');
    siteMenu.setAttribute('aria-hidden', 'true');
    siteMenu.inert = true;
    menuBackdrop.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open site menu');
    backgroundState.forEach(({element, inert}) => { element.inert = inert; });
    backgroundState = [];
    if (returnFocus && previousFocus && previousFocus.isConnected) previousFocus.focus();
  }
  function openMenu() {
    previousFocus = document.activeElement;
    document.body.classList.add('menu-open');
    siteMenu.inert = false;
    siteMenu.classList.add('open');
    menuBackdrop.classList.add('open');
    siteMenu.setAttribute('aria-hidden', 'false');
    menuBackdrop.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Site menu open');
    backgroundState = background.map(element => ({element, inert: element.inert}));
    background.forEach(element => { element.inert = true; });
    menuFocusTimer = window.setTimeout(() => {
      menuFocusTimer = null;
      if (siteMenu.classList.contains('open') && !siteMenu.contains(document.activeElement)) menuClose.focus();
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 340);
  }
  menuToggle.addEventListener('click', openMenu);
  menuClose.addEventListener('click', () => closeMenu());
  menuBackdrop.addEventListener('click', () => closeMenu());
  document.addEventListener('keydown', event => {
    if (!siteMenu.classList.contains('open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = Array.from(siteMenu.querySelectorAll('a[href], button:not([disabled])'));
    const first = items[0];
    const last = items[items.length - 1];
    const outside = !siteMenu.contains(document.activeElement);
    if (outside || (event.shiftKey && document.activeElement === first)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  siteMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      closeMenu(false);
      const href = link.getAttribute('href');
      if (href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          target.setAttribute('tabindex', '-1');
          target.focus({preventScroll: true});
        }
      } else {
        menuToggle.focus();
      }
    });
  });

  const progress = document.querySelector('.reading-progress');
  const navigationLinks = Array.from(document.querySelectorAll('.menu-link[href^="#"], .quick-nav a[href^="#"]'));
  const navigationTargets = navigationLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  let scheduled = false;
  function updatePosition() {
    scheduled = false;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0) + ')';
    let current = '#top';
    let nearestTop = -Infinity;
    navigationTargets.forEach(section => {
      const top = section.getBoundingClientRect().top;
      if (top <= 170 && top > nearestTop) {
        current = '#' + section.id;
        nearestTop = top;
      }
    });
    navigationLinks.forEach(link => {
      const active = link.getAttribute('href') === current;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function schedulePosition() {
    if (!scheduled) {
      scheduled = true;
      window.requestAnimationFrame(updatePosition);
    }
  }
  window.addEventListener('scroll', schedulePosition, {passive:true});
  window.addEventListener('resize', schedulePosition);
  window.addEventListener('load', updatePosition);
  updatePosition();

  document.getElementById('year').textContent = new Date().getFullYear();
  document.getElementById('printPage').addEventListener('click', () => window.print());
})();
