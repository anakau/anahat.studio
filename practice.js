(function () {
  const el = document.getElementById('practice-grid');
  if (!el) return;

  // Hand-curated order/grouping for this page only — not derived from
  // PROJECTS' year/favorite sort like the ledger. Edit this list directly
  // to add/reorder rows; use null in a pair for an empty placeholder slot.
  // award: slugs that get a small award icon next to their title.
  const ROWS = [
    { type: 'feature', slugs: ['the-planetary-compendium'], award: ['the-planetary-compendium'] },
    { type: 'pair', slugs: ['circularstate', 'false-parameters'] },
    { type: 'single', slugs: ['pixelkari'] },
    { type: 'pair', slugs: ['abu-dhabi-economic-pulse', 'agreements-for-regenerative-futures'] },
    { type: 'pair', slugs: ['chronos', 'yung-singh'] },
    { type: 'pair', slugs: ['fondation-beyeler', 'bioregioning-tayside'] }, // "fondation-beyeler" slug = The Lion is Hungry (renamed project, slug wasn't updated in data.js)
    { type: 'pair', slugs: [null, null] },
  ];

  function bySlug(slug) {
    return slug && PROJECTS.find(p => p.slug === slug);
  }

  function tagPills(p) {
    return (p.tags || []).map(t => `<span class="practice-tag">${t}</span>`).join('');
  }

  function projectHref(p) {
    if (p.hasFullDocs) return `project.html?slug=${p.slug}`;
    if (p.external) return p.url;
    if (p.externalLink) return `https://${p.externalLink}`;
    return null;
  }

  const AWARD_ICON = `<svg class="practice-award-icon" width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="8" r="7"/><path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88Z"/></svg>`;

  // Thumbnails are off for now while Anahat gets new images — every card
  // shows the plain "Coming soon" block except the slugs listed here.
  const SHOW_THUMBS = ['the-planetary-compendium'];

  function thumbHtml(p) {
    if (SHOW_THUMBS.includes(p.slug) && p.cover && !isDraftHidden(p.slug)) {
      return `<img class="practice-card-thumb" src="${p.cover}" alt="${p.name}">`;
    }
    return `<div class="practice-card-thumb practice-card-thumb--empty">Coming soon</div>`;
  }

  function projectCard(p, { award } = {}) {
    const href = projectHref(p);
    const tag = href ? 'a' : 'div';
    const externalAttrs = href && !p.hasFullDocs ? ' target="_blank" rel="noopener"' : '';
    return `
      <${tag} class="practice-card"${href ? ` href="${href}"` : ''}${externalAttrs}>
        ${thumbHtml(p)}
        <div class="practice-card-title">${p.name}${award ? AWARD_ICON : ''}</div>
        ${(p.tags || []).length ? `<div class="practice-card-tags">${tagPills(p)}</div>` : ''}
      </${tag}>
    `;
  }

  function placeholderCard() {
    return `<div class="practice-card practice-card--placeholder">Coming soon</div>`;
  }

  function slotCard(slug, award) {
    const p = bySlug(slug);
    return p ? projectCard(p, { award }) : placeholderCard();
  }

  // Preview: the mini-site version — curated projects on the right, their
  // titles in the riding nav on the left, and an Archive of everything else.
  if (window.PREVIEW && typeof initMiniNav === 'function') {
    renderMini();
    return;
  }

  function renderMini() {
    const curated = ROWS.flatMap(r => r.slugs).filter(Boolean).map(bySlug).filter(Boolean);
    const rest = PROJECTS.filter(p => !curated.includes(p))
      .sort((a, b) => String(b.year).localeCompare(String(a.year)));
    const id = p => 'p-' + p.slug;
    const thumb = p => SHOW_THUMBS.includes(p.slug) && p.cover
      ? `<img src="${p.cover}" alt="${p.name}">`
      : `<span class="mini-thumb-empty">${p.name}</span>`;
    const link = (p, inner) => { const h = projectHref(p); return h ? `<a href="${h}"${p.hasFullDocs ? '' : ' target="_blank" rel="noopener"'}>${inner}</a>` : inner; };
    const archiveRows = rest.map(p => `<li>${link(p, `<span class="arc-name">${p.name}</span>`)}<span class="arc-tags">${(p.tags || []).join(', ')}</span><span class="arc-year">${p.year || ''}</span></li>`).join('');
    document.documentElement.classList.add('theme-mini');
    el.closest('#practice-page').innerHTML = `
      <div class="mini">
        <nav class="mini-bar">
          <div class="mini-brand">
            <a class="mini-logo" href="index.html"><img src="images/logo-black-default.svg" alt="Anahat Studio, home"></a>
            <div class="mini-nav"><a href="practice.html">Practice</a><a href="about.html">About</a><a href="archive.html">Archive</a></div>
          </div>
        </nav>
        <div class="mini-main">
          <nav class="mini-jump" aria-label="Projects">
            ${curated.map((p, i) => `<i class="mini-gap"></i><a href="#${id(p)}"><span class="mini-num">${i + 1}</span>${p.name}</a>`).join('')}
            <i class="mini-gap"></i><a href="#p-archive"><span class="mini-num">+</span>Archive</a>
          </nav>
          <div class="mini-content">
            ${curated.map(p => `<section class="mini-sec mini-project" id="${id(p)}">
              ${link(p, `<div class="mini-thumb">${thumb(p)}</div>`)}
              <p class="mini-caption">${p.category || ''}<span>${p.year || ''}</span></p>
            </section>`).join('')}
            <section class="mini-sec" id="p-archive">
              <ul class="mini-archive">${archiveRows}</ul>
            </section>
          </div>
        </div>
      </div>`;
    initMiniNav(document.getElementById('practice-page'));
  }

  el.innerHTML = ROWS.map(row => {
    const cards = row.slugs.map(slug => slotCard(slug, (row.award || []).includes(slug))).join('');
    return `<div class="practice-row practice-row--${row.type}">${cards}</div>`;
  }).join('');
})();
