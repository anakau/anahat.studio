(function () {
  const el = document.getElementById('practice-grid');
  if (!el) return;

  // Hand-curated order/grouping for this page only — not derived from
  // PROJECTS' year/favorite sort like the ledger. Edit this list directly
  // to add/reorder rows; use null in a pair for an empty placeholder slot.
  // noThumb: slugs in this row that skip their cover/image and render a
  // plain black block instead (data.js's cover is untouched — still used
  // on the project detail page etc.). award: slugs that get a small award
  // icon next to their title.
  const ROWS = [
    { type: 'feature', slugs: ['the-planetary-compendium'], noThumb: ['the-planetary-compendium'], award: ['the-planetary-compendium'] },
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

  function projectCard(p, { noThumb, award } = {}) {
    const href = projectHref(p);
    const thumb = !noThumb && (p.cover || (p.images && p.images[0]) || '');
    const tag = href ? 'a' : 'div';
    const externalAttrs = href && !p.hasFullDocs ? ' target="_blank" rel="noopener"' : '';
    return `
      <${tag} class="practice-card"${href ? ` href="${href}"` : ''}${externalAttrs}>
        ${thumb ? `<img class="practice-card-thumb" src="${thumb}" alt="${p.name}">` : `<div class="practice-card-thumb practice-card-thumb--empty">Coming soon</div>`}
        <div class="practice-card-title">${p.name}${award ? AWARD_ICON : ''}</div>
        ${(p.tags || []).length ? `<div class="practice-card-tags">${tagPills(p)}</div>` : ''}
      </${tag}>
    `;
  }

  function placeholderCard() {
    return `<div class="practice-card practice-card--placeholder">Coming soon</div>`;
  }

  function slotCard(slug, noThumb, award) {
    const p = bySlug(slug);
    return p ? projectCard(p, { noThumb, award }) : placeholderCard();
  }

  el.innerHTML = ROWS.map(row => {
    const cards = row.slugs.map(slug => slotCard(slug, (row.noThumb || []).includes(slug), (row.award || []).includes(slug))).join('');
    return `<div class="practice-row practice-row--${row.type}">${cards}</div>`;
  }).join('');
})();
