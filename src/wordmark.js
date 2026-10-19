// Arabic wordmark for حمزة, built from vertical rounded bars.
// Visual order is left to right, so the word reads right to left: ح م ز ة.
// One source of truth: this geometry produces both the inline SVG and the static file.

// Geometry taken from Hamza's own Illustrator artwork (viewBox 1536 x 1024), measured per bar and
// snapped to a regular rhythm. Visual order is left to right, so the word reads right to left: ح م ز ة.
const BAR = 19;                       // bar width (fully rounded ends)
const VIEWBOX = '332 255 913 530';
const VIEWBOX_COMPACT = '312 255 933 530'; // room for the wider bars at the left edge
const TOP = 369;
const BASE = 627.4;                   // shared baseline: every body bar ends here
const FULL = [[TOP, BASE]];
const WINDOW = [[TOP, 475], [540.3, BASE]];

// cols: [x, [[top, bottom], ...]] (two segments = a counter cut into the bar)
const LETTERS = [
  // ح  a stub, an open window, a full bar, then a wedge that steps down
  { id: 'ha', origin: '0%', cols: [
    [947.1, [[540.3, BASE]]],
    [974.9, WINDOW], [1002.6, WINDOW], [1030.4, WINDOW], [1058.1, WINDOW], [1085.9, WINDOW],
    [1113.6, FULL],
    [1141.4, [[400.8, BASE]]], [1169.1, [[424, BASE]]], [1196.9, [[447.2, BASE]]], [1224.6, [[470.4, BASE]]],
  ] },
  // م  a block with one counter
  { id: 'mim', origin: '100%', cols: [
    [724.8, FULL], [752.5, FULL], [780.2, FULL], [807.9, FULL],
    [835.6, [[TOP, 432.4], [566.3, BASE]]],
    [863.3, FULL], [891, FULL], [918.7, FULL],
  ] },
  // ز  a block that drops below the baseline, then a step and a stub; one dot above
  { id: 'zay', origin: '0%', cols: [
    [562, [[400.3, 782.8]]], [589.3, [[400.3, 782.8]]], [616.6, [[400.3, 782.8]]], [644, [[400.3, 782.8]]],
    [671.3, [[400.3, BASE]]], [698.7, [[539.9, BASE]]],
  ], dots: [[602.9, 311.6, 373.8], [626.9, 311.6, 373.8]] },
  // ة  a block with one window; two dots above
  { id: 'ta', origin: '100%', cols: [
    [333, FULL], [361.4, FULL], [389.9, FULL],
    [418.3, [[TOP, 472.8], [538.9, BASE]]],
    [446.7, FULL], [475.1, FULL], [503.6, FULL],
  ], dots: [[381.7, 256.8, 332.7], [405.7, 256.8, 332.7], [429.7, 256.8, 332.7], [453.7, 256.8, 332.7]] },
];

const rect = (x, y0, y1, w, cls, style) =>
  `<rect class="${cls}" x="${+x.toFixed(1)}" y="${+y0.toFixed(1)}" width="${w}" height="${+(y1 - y0).toFixed(1)}" rx="${w / 2}"${style ? ` style="${style}"` : ''}/>`;

/**
 * Returns the wordmark as an SVG string.
 * options.inline: add classes and per-bar CSS variables used by the animation (--n order, --r reverse order, --oy origin).
 * options.compact: every second bar, drawn twice as wide, for small sizes such as the header.
 */
export function wordmarkSVG({ inline = false, compact = false, label = 'حمزة' } = {}) {
  const W = compact ? BAR * 2 : BAR;
  const dx = compact ? BAR - W : 0; // keep the right edge of each kept bar in place
  const pick = (list) => list.slice().sort((a, b) => b[0] - a[0]).filter((_, i) => !compact || i % 2 === 0);
  const prepared = LETTERS.map((l) => ({
    l,
    cols: pick(l.cols),
    dots: pick(l.dots || []),
  }));
  const total = prepared.reduce((s, g) => s + g.cols.reduce((t, c) => t + c[1].length, 0) + g.dots.length, 0);
  let n = 0;
  const vars = (origin) => { const i = n++; return `--n:${i};--r:${total - i};--oy:${origin}`; };
  const body = prepared.map(({ l, cols, dots }) => {
    const bars = cols.flatMap(([x, segs]) => segs.map(([y0, y1]) => rect(x + dx, y0, y1, W, 'b', inline ? vars(l.origin) : '')));
    const dotBars = dots.map(([x, y0, y1]) => rect(x + dx, y0, y1, W, 'b d', inline ? vars('50%') : ''));
    return `<g class="g g-${l.id}">${bars.concat(dotBars).join('')}</g>`;
  }).join('');
  const head = inline
    ? `<svg class="wm" viewBox="${compact ? VIEWBOX_COMPACT : VIEWBOX}" role="img" aria-label="${label}" focusable="false" xmlns="http://www.w3.org/2000/svg"><title>${label}</title>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" width="913" height="530" role="img" aria-label="${label}"><title>${label}</title><style>.b{fill:var(--wm-ink,#101D3A)}.d{fill:var(--wm-accent,var(--wm-ink,#101D3A))}@media (prefers-color-scheme:dark){:root{--wm-ink:#fff}}</style>`;
  return `${head}${body}</svg>`;
}

/** Replaces each [data-wordmark] fallback image with the inline SVG and runs the entrance once. */
export function mountWordmarks() {
  const mounts = [...document.querySelectorAll('[data-wordmark]')];
  if (!mounts.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  mounts.forEach((el) => {
    const animate = el.dataset.wordmark === 'hero' && !reduced;
    el.innerHTML = wordmarkSVG({ inline: true, compact: el.dataset.wordmark === 'nav' });
    const svg = el.firstElementChild;
    if (el.dataset.wordmark === 'nav') {
      // Decorative inside the home link, which already has an accessible name
      svg.removeAttribute('role'); svg.removeAttribute('aria-label'); svg.setAttribute('aria-hidden', 'true');
      svg.querySelector('title').remove();
    }
    if (!animate) { svg.classList.add('wm--done'); return; }

    svg.classList.add('wm--pre');
    const play = () => {
      svg.classList.remove('wm--pre');
      svg.classList.add('wm--play');
      const bars = svg.querySelectorAll('.b').length;
      const T = bars * 20 + 760; // when the closing settle starts
      svg.style.setProperty('--T', `${T}ms`);
      const total = T + 700 + bars * 10; // plus the settle
      setTimeout(() => { svg.classList.remove('wm--play'); svg.classList.add('wm--done'); }, total);
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { io.disconnect(); setTimeout(() => requestAnimationFrame(play), 200); }
      }, { threshold: 0.4 });
      io.observe(el);
    } else { play(); }
    // Failsafe: never leave the mark hidden
    setTimeout(() => { if (svg.classList.contains('wm--pre')) { svg.classList.remove('wm--pre'); svg.classList.add('wm--done'); } }, 4000);
  });
}
