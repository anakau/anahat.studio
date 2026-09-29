// Shrinks the header logo down to the nav bar's width as the page scrolls,
// tied continuously to scroll position (not a two-state snap on direction
// change) so it reads as smooth in both directions. Every page but the
// homepage includes this — index.html has its own full-viewport hero
// layout with nothing to scroll past.
(function () {
  const logo = document.querySelector('.logo-mark');
  const nav = document.querySelector('.site-nav');
  if (!logo || !nav) return;
  // Below 860px the logo has its own responsive CSS rule (see the
  // RESPONSIVE block in style.css) sized against viewport width, not this
  // script's fixed desktop constants — leave it alone there rather than
  // fighting it with an inline style.
  if (window.matchMedia('(max-width: 860px)').matches) return;

  const ASPECT = 3039 / 432; // logo's own viewBox ratio
  const FULL_HEIGHT = 62.4; // matches .logo-mark's height in style.css
  const FULL_WIDTH = FULL_HEIGHT * ASPECT;
  const SHRINK_DISTANCE = 160; // px of scroll to go from full size to fully shrunk

  let navWidth = nav.getBoundingClientRect().width;
  window.addEventListener('resize', () => {
    navWidth = nav.getBoundingClientRect().width;
  }, { passive: true });

  let ticking = false;
  function update() {
    const t = Math.max(0, Math.min(1, window.scrollY / SHRINK_DISTANCE));
    const width = FULL_WIDTH + (navWidth - FULL_WIDTH) * t;
    logo.style.width = width + 'px';
    logo.style.height = (width / ASPECT) + 'px';
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
})();
