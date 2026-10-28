(function () {
  const slug = new URLSearchParams(window.location.search).get('slug');
  const project = PROJECTS.find(p => p.slug === slug);
  if (project) document.title = `${project.name} — Anahat Kaur`;

  // Thumbnail on the left, project details pinned on the right. Sections
  // still marked [PLACEHOLDER] stay hidden until their copy is written.
  const content = document.getElementById('project-content');

  // Case-study blocks (data.js `blocks`): text, numbered steps with
  // screens, and a design-system block whose components are rebuilt live.
  function renderBlock(b) {
    if (b.type === 'text') {
      const paras = (b.paragraphs || []).map(p => `<p>${p}</p>`).join('');
      const list = b.list ? `<dl class="pd-list">${b.list.map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join('')}</dl>` : '';
      return `<section class="pd-block pd-block--text"><h2 class="pd-heading">${b.heading}</h2>${paras}${list}</section>`;
    }
    if (b.type === 'step') {
      const imgs = b.images.map(src => `<img class="pd-screen" src="${src}" alt="${b.heading}" loading="lazy">`).join('');
      return `<section class="pd-block pd-step">
        <div class="pd-step-head"><span class="pd-step-n">${b.n}</span><h2>${b.heading}</h2><p>${b.text}</p></div>
        <div class="pd-screens pd-screens--${b.images.length}">${imgs}</div>
      </section>`;
    }
    if (b.type === 'system') return renderSystem(b);
    return '';
  }

  function renderSystem(b) {
    const swatches = b.colours.map(([name, hex, use]) => `
      <div class="ds-swatch"><span class="ds-chip" style="background:${hex}"></span>
        <b>${name}</b><code>${hex}</code><small>${use}</small></div>`).join('');
    const specimens = b.fonts.map(([name, use, img]) => `
      <div class="ds-type"><div class="ds-type-img"><img src="${img}" alt="${name} specimen"></div>
        <b>${name}</b><small>${use}</small></div>`).join('');
    const connectors = ['Biogeochemical Commons', 'Diplomacy', 'More-than-human Agency', 'Sovereignty', 'Repair & Regeneration']
      .map((t, i) => `<button class="cmp-connector${i === 2 ? ' is-on' : ''}" type="button">${t}</button>`).join('');
    const cards = b.cases.map(([img, title, tags]) => `
      <div class="cmp-case"><img src="${img}" alt=""><div><b>${title}</b>
        <div class="cmp-case-tags">${tags.map(t => `<span>${t}</span>`).join('')}<span class="cmp-more">+2</span></div></div></div>`).join('');
    return `<section class="pd-block ds">
      <h2 class="pd-heading">${b.heading}</h2>
      <h3 class="ds-sub">Colour</h3><div class="ds-swatches">${swatches}</div>
      <h3 class="ds-sub">Type</h3><div class="ds-types">${specimens}</div>
      <h3 class="ds-sub">Components <span>rebuilt live — try them</span></h3>
      <div class="ds-board">
        <div class="ds-cell"><button class="cmp-halo" type="button"><span>Enter →</span></button><small>Primary button: lavender pill in a white halo, lit by a lavender glow</small></div>
        <div class="ds-cell"><div class="cmp-nav"><span>The Planetary<br>Compendium</span><button class="cmp-burger" type="button" aria-label="Menu"><i></i><i></i><i></i></button></div><small>Site pill: name and menu</small></div>
        <div class="ds-cell"><div class="cmp-place"><span class="cmp-num">04</span><span>Between the Craters: A Lunar Governance Crisis Simulation</span></div><small>Place marker while reading</small></div>
        <div class="ds-cell"><div class="cmp-tabs"><button class="is-on" type="button">About</button><button type="button">Credits</button></div><small>Tabs</small></div>
        <div class="ds-cell ds-cell--wide"><div class="cmp-connectors">${connectors}</div><small>System connectors: mono lavender chips, green when chosen</small></div>
        <div class="ds-cell ds-cell--wide"><div class="cmp-cases">${cards}</div><small>Connected case card</small></div>
        <div class="ds-cell ds-cell--wide"><form class="cmp-mail" onsubmit="return false"><input placeholder="Join our mailing list" aria-label="Email"><button type="submit">Submit</button></form><small>Mailing list</small></div>
      </div>
    </section>`;
  }
  if (project && content && !isDraftHidden(project.slug)) {
    const isDraft = text => text.includes('[PLACEHOLDER');
    const details = (project.details || []).map(([label, value]) =>
      `<div class="pd-row"><dt>${label}</dt><dd>${value}</dd></div>`).join('');
    const visit = project.url
      ? `<a class="pd-visit" href="${project.url}" target="_blank" rel="noopener">${project.url.replace(/^https?:\/\//, '')} ↗</a>`
      : '';
    const tags = (project.tags || []).map(t => `<span class="practice-tag">${t}</span>`).join('');
    const credits = (project.sections || []).filter(s => s.credits).map(s =>
      `<section class="pd-block pd-block--text pd-block--credits"><h2 class="pd-heading">${s.heading}</h2><div class="pd-credits">${s.credits.map(c => `<p>${c}</p>`).join('')}</div></section>`).join('');
    const legacy = (project.sections || []).filter(s => s.heading !== 'Role' && !s.credits).map(s => {
      const paras = (s.paragraphs || []).filter(p => !isDraft(p));
      if (!paras.length) return '';
      return `<section class="pd-block"><h2 class="pd-heading">${s.heading}</h2>${paras.map(p => `<p>${p}</p>`).join('')}</section>`;
    }).join('');
    // A `credits` block places the credits there; otherwise they close the page.
    const hasCreditsBlock = (project.blocks || []).some(b => b.type === 'credits');
    const sections = project.blocks
      ? project.blocks.map(b => b.type === 'credits' ? credits : renderBlock(b)).join('') + (hasCreditsBlock ? '' : credits)
      : legacy + credits;
    content.innerHTML = `
      <div class="pd-layout">
        <div class="pd-main">
          <img class="pd-thumb" src="${project.cover}" alt="${project.name}">
          <div class="pd-text">${sections}</div>
        </div>
        <aside class="pd-side">
          <h1>${project.name}</h1>
          <p class="pd-summary">${project.category}</p>
          <dl class="pd-details">${details}</dl>
          ${visit}
          <div class="pd-tags">${tags}</div>
        </aside>
      </div>`;

    content.querySelectorAll('.cmp-connector').forEach(btn => btn.addEventListener('click', () => btn.classList.toggle('is-on')));
    content.querySelectorAll('.cmp-tabs').forEach(tabs => tabs.addEventListener('click', e => {
      const btn = e.target.closest('button'); if (!btn) return;
      tabs.querySelectorAll('button').forEach(b => b.classList.toggle('is-on', b === btn));
    }));
    content.querySelectorAll('.cmp-burger').forEach(btn => btn.addEventListener('click', () => btn.classList.toggle('is-open')));
    if (project.slug === 'the-planetary-compendium') document.documentElement.classList.add('theme-compendium');
  }

  const backLink = document.getElementById('back-link');
  if (backLink) {
    backLink.addEventListener('click', (e) => {
      // Only hijack for real in-site navigation history; a direct link or
      // new tab has nothing to go back to, so let it fall through to the
      // static href="practice.html" fallback instead.
      if (document.referrer && new URL(document.referrer).origin === location.origin) {
        e.preventDefault();
        history.back();
      }
    });
  }
})();
