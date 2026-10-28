// Mini-site navigation (project pages and Practice), modelled on GT America:
// each nav label sits beside the start of its section and is sticky at both
// ends, so upcoming labels stack at the bottom of the screen, the current one
// rides with its section, and past ones stack at the top. Sub-items
// (data-parent) show only while their parent section is current.
// Expects: .mini-jump containing <i class="mini-gap"></i><a href="#id"> pairs,
// sections with class .mini-sec (and optional .mini-sub inside them), all
// inside .mini-content.
function initMiniNav(root) {
  const jump = root.querySelector('.mini-jump');
  if (!jump) return;
  initMobileMenu(root, jump);
  const labels = [...jump.querySelectorAll('a')];
  const place = () => {
    const base = jump.getBoundingClientRect().top + window.scrollY;
    let y = base;
    // Spacers (not margins) push each label down to its section: a sticky
    // element's margin would stop it moving past its container.
    labels.forEach(a => {
      if (a.classList.contains('is-hidden')) { a.previousElementSibling.style.height = '0px'; return; }
      const el = root.querySelector(a.getAttribute('href'));
      const target = el.getBoundingClientRect().top + window.scrollY + (a.dataset.parent ? 0 : 48);
      a.previousElementSibling.style.height = Math.max(0, target - y) + 'px';
      y = Math.max(y, target) + a.offsetHeight;
    });
  };
  // The visible items are re-indexed so the top and bottom stacks stay tight.
  const layout = current => {
    const shown = labels.filter(a => !a.dataset.parent || a.dataset.parent === current);
    labels.forEach(a => a.classList.toggle('is-hidden', !shown.includes(a)));
    shown.forEach((a, i) => { a.style.setProperty('--i', i); a.style.setProperty('--rest', shown.length - 1 - i); });
    place();
  };

  // Current section (and sub-section): the last one whose top has passed a
  // third of the way down the screen.
  const links = new Map(labels.map(a => [a.getAttribute('href').slice(1), a]));
  const secs = [...root.querySelectorAll('.mini-sec')];
  let currentSec;
  const lastPassed = els => {
    const line = window.innerHeight / 3;
    let hit = null;
    els.forEach(el => { if (el.getBoundingClientRect().top <= line) hit = el; });
    return hit;
  };
  const spy = () => {
    const sec = lastPassed(secs);
    const id = sec ? sec.id : null;
    if (id !== currentSec) { currentSec = id; layout(id); }
    const sub = sec ? lastPassed([...sec.querySelectorAll('.mini-sub')]) : null;
    links.forEach((a, key) => a.classList.toggle('is-current', key === id || (sub && key === sub.id)));
  };

  let ticking = false;
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { spy(); ticking = false; }); } }, { passive: true });
  window.addEventListener('resize', () => { place(); spy(); });
  window.addEventListener('load', place);
  const contentEl = root.querySelector('.mini-content');
  if (contentEl) new ResizeObserver(place).observe(contentEl);
  spy();
}

// Phones: the side nav is hidden and a menu button in the top bar opens a
// full-screen panel with the same sections plus Practice / About / Archive.
function initMobileMenu(root, jump) {
  const bar = root.querySelector('.mini-bar');
  if (!bar || bar.querySelector('.mini-menu-btn')) return;
  const btn = document.createElement('button');
  btn.className = 'mini-menu-btn';
  btn.type = 'button';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'mini-menu');
  btn.innerHTML = '<span class="visually-hidden">Menu</span><i></i><i></i>';
  const panel = document.createElement('div');
  panel.className = 'mini-menu';
  panel.id = 'mini-menu';
  panel.hidden = true;
  const sections = [...jump.querySelectorAll('a')].filter(a => !a.dataset.parent)
    .map(a => `<a href="${a.getAttribute('href')}">${a.querySelector('.mini-title') ? a.querySelector('.mini-title').textContent : a.textContent.replace(/^\d+/, '')}</a>`).join('');
  const site = [...bar.querySelectorAll('.mini-nav a')].map(a => `<a href="${a.getAttribute('href')}">${a.textContent}</a>`).join('');
  panel.innerHTML = `<nav class="mini-menu-sections" aria-label="On this page">${sections}</nav><nav class="mini-menu-site" aria-label="Site">${site}</nav>`;
  bar.appendChild(btn);
  document.body.appendChild(panel);
  const set = open => {
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('mini-menu-open', open);
  };
  btn.addEventListener('click', () => set(panel.hidden));
  panel.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
}
