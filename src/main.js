import { mountWordmarks } from './wordmark.js';
import { protectArtwork } from './protect.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Mobile menu
const nav = $('#nav');
const toggle = $('.nav__toggle');
const setOpen = (open) => {
  nav.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
};
toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
$$('.nav__menu a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
addEventListener('keydown', (e) => e.key === 'Escape' && setOpen(false));
document.addEventListener('click', (e) => { if (!nav.contains(e.target)) setOpen(false); });

// Explore dropdown
const explore = $('.explore');
const exploreBtn = $('.explore__btn');
const setExplore = (open) => {
  explore.classList.toggle('is-open', open);
  exploreBtn.setAttribute('aria-expanded', String(open));
};
exploreBtn.addEventListener('click', () => setExplore(!explore.classList.contains('is-open')));
document.addEventListener('click', (e) => { if (!explore.contains(e.target)) setExplore(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape') { setExplore(false); } });

// Highlight current section in the nav
const links = new Map($$('.nav__menu > a:not(.btn)').filter((a) => a.getAttribute('href').includes('#')).map((a) => [a.getAttribute('href').split('#')[1], a]));
const spy = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    links.forEach((a) => { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
    const a = links.get(e.target.id);
    if (a) { a.classList.add('is-active'); a.setAttribute('aria-current', 'true'); }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
$$('main section[id]').forEach((s) => spy.observe(s));

// Only one video plays at a time
const videos = $$('video');
videos.forEach((v) => v.addEventListener('play', () => videos.forEach((o) => o !== v && o.pause())));

$('#year').textContent = new Date().getFullYear();

mountWordmarks();
protectArtwork();
