(() => {
  'use strict';

  const mobileMenu = document.getElementById('mobileMenu');
  const menuSummary = mobileMenu.querySelector('summary');
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => { mobileMenu.open = false; });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileMenu.open) {
      mobileMenu.open = false;
      menuSummary.focus();
    }
  });
  document.addEventListener('click', event => {
    if (mobileMenu.open && !mobileMenu.contains(event.target)) mobileMenu.open = false;
  });
  const desktop = window.matchMedia('(min-width: 651px)');
  desktop.addEventListener('change', event => { if (event.matches) mobileMenu.open = false; });

  document.getElementById('year').textContent = new Date().getFullYear();

  // Track the section nearest the top without hiding content behind JavaScript.
  const navLinks = Array.from(document.querySelectorAll('.desktop-nav a[href^="#"]'));
  const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  let scheduled = false;
  function updateCurrentSection() {
    scheduled = false;
    let current = '';
    sections.forEach(section => {
      if (section.getBoundingClientRect().top <= 160) current = '#' + section.id;
    });
    navLinks.forEach(link => {
      if (link.getAttribute('href') === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; window.requestAnimationFrame(updateCurrentSection); }
  }, { passive: true });
  updateCurrentSection();
})();
