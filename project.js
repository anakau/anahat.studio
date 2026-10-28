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
        <div class="pd-screens pd-screens--${b.images.length}${b.plain ? ' pd-screens--plain' : ''}">${imgs}</div>
      </section>`;
    }
    if (b.type === 'system') return renderSystem(b);
    if (b.type === 'modes') return renderModes(b);
    return '';
  }

  // Observe ↔ immerse, with the site's own mode toggle (SVGs from
  // governtheplanet.org): white pill + orbiting globe → black pill + green
  // crosshair. Switching wipes the immerse screens in from the toggle.
  const OBSERVE_ICON = `<svg class="hk-icon hk-icon--observe" fill="none" viewBox="0 0 114 114" aria-hidden="true"><defs><radialGradient cx="50%" cy="50%" r="50%" id="hkGrad"><stop offset="0%" stop-color="#B9B3FF"/><stop offset="50%" stop-color="#87CEEB"/><stop offset="100%" stop-color="#A7FFC4"/></radialGradient><clipPath id="hkClip"><circle cx="57" cy="57" r="36"/></clipPath></defs><path d="M21 57 C21 63 40 70 57 70 C74 70 93 63 93 57 A 36 8 0 0 0 21 57" id="hkOrbit"/><g><animateMotion dur="3s" repeatCount="indefinite"><mpath href="#hkOrbit"/></animateMotion><circle fill="#B9B3FF" r="10.2" stroke="black"><animate attributeName="visibility" dur="3s" keyTimes="0;0.5;0.5;1" repeatCount="indefinite" values="hidden;hidden;visible;visible"/></circle></g><circle cx="57" cy="57" fill="black" r="36"/><circle cx="57" cy="57" fill="url(#hkGrad)" opacity="0" r="36.1"><animate attributeName="opacity" dur="3s" keyTimes="0;0.55;0.65;0.85;0.95;1" repeatCount="indefinite" values="0;0;1;1;0;0"/></circle><g clip-path="url(#hkClip)"><path d="M62 21 C 80 21 93 40 93 57 C 93 74 80 93 62 93 C 44 93 33 74 33 57 C 33 40 44 21 62 21 Z" stroke="white"/><path d="M21 57 C21 63 40 70 57 70 C74 70 93 63 93 57" stroke="white"/></g><g><animateMotion dur="3s" repeatCount="indefinite"><mpath href="#hkOrbit"/></animateMotion><circle fill="#B9B3FF" r="10.2" stroke="black"><animate attributeName="visibility" dur="3s" keyTimes="0;0.5;0.5;1" repeatCount="indefinite" values="visible;visible;hidden;hidden"/></circle></g></svg>`;
  const IMMERSE_ICON = `<svg class="hk-icon hk-icon--immerse" fill="none" viewBox="0 0 80 80" aria-hidden="true"><defs><filter id="hkBlur" x="0" y="0" width="80" height="80" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="8.2"/></filter></defs><ellipse cx="40" cy="40.5" fill="#0F7" rx="30" ry="30.5"/><circle cx="40" cy="40" fill="#B9B3FF" r="23" filter="url(#hkBlur)"/><path d="M40 10v61m30-30H10" stroke="#000"/></svg>`;

  function renderModes(b) {
    const screens = (list, mode) => list.map(([src, cap]) =>
      `<figure><img src="${src}" alt="${cap}" loading="lazy"><figcaption>${cap}</figcaption></figure>`).join('');
    return `<section class="pd-block pd-step hk" data-mode="observe">
      <div class="pd-step-head"><span class="pd-step-n">${b.n || ''}</span><h2>${b.heading}</h2><p>${b.text}</p></div>
      <div class="hk-panel">
        <div class="hk-bar">
          <button class="hk-toggle" type="button" aria-label="Switch to immerse mode">
            <span class="hk-knob">${OBSERVE_ICON}${IMMERSE_ICON}</span>
          </button>
          <span class="hk-mode"><span data-for="observe">Observe</span><span data-for="immerse">Immerse</span></span>
        </div>
        <div class="hk-stage">
          <div class="hk-layer hk-layer--observe">${screens(b.observe)}</div>
          <div class="hk-layer hk-layer--immerse" aria-hidden="true">${screens(b.immerse)}</div>
        </div>
      </div>
    </section>`;
  }

  function initModes(root) {
    root.querySelectorAll('.hk').forEach(el => {
      const btn = el.querySelector('.hk-toggle');
      const set = mode => {
        el.dataset.mode = mode;
        btn.setAttribute('aria-label', mode === 'observe' ? 'Switch to immerse mode' : 'Switch to observe mode');
        el.querySelector('.hk-layer--immerse').setAttribute('aria-hidden', String(mode === 'observe'));
        el.querySelector('.hk-layer--observe').setAttribute('aria-hidden', String(mode !== 'observe'));
      };
      const flip = () => set(el.dataset.mode === 'observe' ? 'immerse' : 'observe');
      let auto = null, touched = false;
      const stop = () => { clearInterval(auto); auto = null; };
      btn.addEventListener('click', () => { touched = true; stop(); flip(); });
      // Shows itself off while in view, until someone takes over.
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting && !auto && !touched) auto = setInterval(flip, 4000);
          else if (!entry.isIntersecting) stop();
        }, { threshold: 0.4 }).observe(el);
      }
    });
  }

  // A looping, muted screen recording when the project has one (always
  // autoplays; a pause button lets anyone stop it), otherwise the cover image.
  function coverMedia(p) {
    const v = p.coverVideo;
    if (!v) return `<img class="pd-thumb" src="${p.cover}" alt="${p.name}">`;
    return `<div class="pd-cover-video">
      <video class="pd-thumb" autoplay muted loop playsinline preload="auto" poster="${v.poster}" aria-label="${p.name}: a walk through the system connectors map">
        <source src="${v.webm}" type="video/webm"><source src="${v.mp4}" type="video/mp4"></video>
      <button class="pd-video-toggle" type="button" aria-label="Pause video">Pause</button>
    </div>`;
  }

  function initCoverVideo(root) {
    const video = root.querySelector('.pd-cover-video video');
    if (!video) return;
    const btn = root.querySelector('.pd-video-toggle');
    // muted must be set as a property for browsers to allow autoplay.
    video.muted = true;
    const play = () => video.play().catch(() => {});
    play();
    document.addEventListener('visibilitychange', () => { if (!document.hidden && btn.dataset.paused !== '1') play(); });
    btn.addEventListener('click', () => {
      const pause = !video.paused;
      if (pause) video.pause(); else play();
      btn.dataset.paused = pause ? '1' : '';
      btn.textContent = pause ? 'Play' : 'Pause';
      btn.setAttribute('aria-label', pause ? 'Play video' : 'Pause video');
    });
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
        <div class="ds-cell"><div class="cmp-place"><span class="cmp-num">02</span><span>Melting Borders: Glacier Governance in the Hindu Kush Himalayas</span></div><small>Place marker while reading</small></div>
        <div class="ds-cell"><div class="cmp-tabs"><button class="is-on" type="button">About</button><button type="button">Credits</button></div><small>Tabs</small></div>
        <div class="ds-cell ds-cell--wide"><div class="cmp-connectors">${connectors}</div><small>System connectors: mono lavender chips, green when chosen</small></div>
        <div class="ds-cell ds-cell--wide"><div class="cmp-cases">${cards}</div><small>Connected case card</small></div>
        <div class="ds-cell ds-cell--wide"><form class="cmp-mail" onsubmit="return false"><input placeholder="Join our mailing list" aria-label="Email"><button type="submit">Submit</button></form><small>Mailing list</small></div>
      </div>
    </section>`;
  }
  if (project && content && !isDraftHidden(project.slug)) {
    const isDraft = text => text.includes('[PLACEHOLDER');
    const rows = list => (list || []).map(([label, value]) =>
      `<div class="pd-row"><dt>${label}</dt><dd>${value}</dd></div>`).join('');
    const details = rows(project.details);
    const visit = project.url
      ? `<a class="pd-visit" href="${project.url}" target="_blank" rel="noopener">${project.url.replace(/^https?:\/\//, '')} ↗</a>`
      : '';
    const tags = (project.tags || []).map(t => `<span class="practice-tag">${t}</span>`).join('');
    const logoRow = (list, cls) => list ? `<div class="pd-logos ${cls}">${list.map(([src, name]) => `<img src="${src}" alt="${name}">`).join('')}</div>` : '';
    const cl = project.creditLogos;
    // Every credited organisation in one row, lead partners first.
    const logos = cl ? logoRow([...(cl.lead || []), ...(cl.programmes || []), ...(cl.partners || [])], 'pd-logos--row') : '';
    const credits = (project.sections || []).filter(s => s.credits).map(s =>
      `<section class="pd-block pd-block--text pd-block--credits"><h2 class="pd-heading">${s.heading}</h2><div class="pd-credits">${s.credits.map(c => `<p>${c}</p>`).join('')}</div>${logos}</section>`).join('');
    const legacy = (project.sections || []).filter(s => s.heading !== 'Role' && !s.credits).map(s => {
      const paras = (s.paragraphs || []).filter(p => !isDraft(p));
      if (!paras.length) return '';
      return `<section class="pd-block"><h2 class="pd-heading">${s.heading}</h2>${paras.map(p => `<p>${p}</p>`).join('')}</section>`;
    }).join('');
    // Case studies (with `blocks`): cover, then every detail and the credits
    // under it in columns, then the story full width. Older pages keep a
    // side column and put their credits at the end of the text.
    if (project.blocks) {
      const creditText = (project.sections || []).filter(s => s.credits).map(s => s.credits.map(c => `<p>${c}</p>`).join('')).join('');
      const intro = (project.intro || [project.summary || project.category]).map(p => `<p>${p}</p>`).join('');
      content.innerHTML = `
        <header class="pd-intro">
          ${coverMedia(project)}
          <h1 class="visually-hidden">${project.name}</h1>
          <div class="pd-info">
            <dl class="pd-facts">${details}</dl>
            <dl class="pd-facts">${rows(project.recognition)}</dl>
            <div class="pd-intro-text">
              <div class="pd-intro-copy">${intro}</div>
              <div class="pd-tags">${tags}</div>
              ${creditText ? `<button class="pd-credits-toggle" type="button" aria-expanded="false" aria-controls="pd-credits">Credits <span aria-hidden="true">+</span></button>` : ''}
            </div>
          </div>
          ${creditText ? `<div class="pd-credits pd-credits--intro" id="pd-credits" hidden>${creditText}</div>` : ''}
          ${logos}
        </header>
        <div class="pd-text">${project.blocks.map(renderBlock).join('')}</div>`;
    } else {
      content.innerHTML = `
        <div class="pd-layout">
          <div class="pd-main">
            <img class="pd-thumb" src="${project.cover}" alt="${project.name}">
            <div class="pd-text">${legacy + credits}</div>
          </div>
          <aside class="pd-side">
            <h1>${project.name}</h1>
            <p class="pd-summary">${project.summary || project.category}</p>
            <dl class="pd-details">${details}</dl>
            ${visit}
            <div class="pd-tags">${tags}</div>
          </aside>
        </div>`;
    }

    initModes(content);
    initCoverVideo(content);
    const creditsBtn = content.querySelector('.pd-credits-toggle');
    if (creditsBtn) creditsBtn.addEventListener('click', () => {
      const panel = content.querySelector('#pd-credits');
      const open = panel.hidden;
      panel.hidden = !open;
      creditsBtn.setAttribute('aria-expanded', String(open));
      creditsBtn.querySelector('span').textContent = open ? '−' : '+';
    });
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
