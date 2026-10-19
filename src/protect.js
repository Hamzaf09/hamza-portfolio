// Light deterrents for portfolio artwork. These only stop casual dragging and the right-click
// "Save image" menu on the images below. They do not prevent screenshots, developer tools or
// downloading the file from the page, and nothing here changes how links or controls work.

const ARTWORK = [
  '.shot img', '.post img', '.guides img', '.apps img', '.brand-figs img',
  '.hero__browser img', '.hero__phone img', '.about__photo img',
].join(',');

export function protectArtwork() {
  document.querySelectorAll(ARTWORK).forEach((img) => {
    img.draggable = false;
    img.classList.add('is-protected');
    if (!img.closest('a, button')) img.classList.add('is-protected--touch');
  });

  // Dragging an image out of the page
  document.addEventListener('dragstart', (e) => {
    if (e.target instanceof Element && e.target.matches(ARTWORK)) e.preventDefault();
  });

  // Right-click menu, but not on images that sit inside a link or button, so
  // "open in new tab" and keyboard-accessible controls keep working.
  document.addEventListener('contextmenu', (e) => {
    const t = e.target;
    if (t instanceof Element && t.matches(ARTWORK) && !t.closest('a, button')) e.preventDefault();
  });
}
