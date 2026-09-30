// Shrinks the header logo down to the nav bar's width as the page scrolls,
// tied continuously to scroll position (not a two-state snap on direction
// change) so it reads as smooth in both directions. Only included on
// Practice/About/Archive — not the homepage (full-viewport hero, nothing
// to scroll past) and not project.html (logo stays static size there).
// Runs on mobile too: full size is computed to match style.css's own
// rules at each breakpoint (desktop: fixed 90px height; mobile:
// min(130px, 68vw) width) rather than measured from the DOM, so it stays
// correct even mid-scroll when an inline style is already overriding the
// logo's natural size.
(function () {
  const logo = document.querySelector('.logo-mark');
  const nav = document.querySelector('.site-nav');
  if (!logo || !nav) return;

  const ASPECT = 3080.43 / 444.55; // logo SVGs' own (cropped) viewBox ratio
  const MOBILE_BREAKPOINT = 860;
  const SHRINK_DISTANCE = 160; // px of scroll to go from full size to fully shrunk

  function fullWidth() {
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      return Math.min(130, window.innerWidth * 0.68);
    }
    return 90 * ASPECT;
  }

  let navWidth = nav.getBoundingClientRect().width;
  let full = fullWidth();
  window.addEventListener('resize', () => {
    navWidth = nav.getBoundingClientRect().width;
    full = fullWidth();
  }, { passive: true });

  let ticking = false;
  function update() {
    const t = Math.max(0, Math.min(1, window.scrollY / SHRINK_DISTANCE));
    const width = full + (navWidth - full) * t;
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
