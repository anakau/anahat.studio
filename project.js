(function () {
  const slug = new URLSearchParams(window.location.search).get('slug');
  const project = PROJECTS.find(p => p.slug === slug);
  if (project) document.title = `${project.name} — Anahat Kaur`;

  // Thumbnail on the left, project details pinned on the right. Sections
  // still marked [PLACEHOLDER] stay hidden until their copy is written.
  const content = document.getElementById('project-content');
  if (project && content) {
    const isDraft = text => text.includes('[PLACEHOLDER');
    const details = (project.details || []).map(([label, value]) =>
      `<div class="pd-row"><dt>${label}</dt><dd>${value}</dd></div>`).join('');
    const visit = project.url
      ? `<a class="pd-visit" href="${project.url}" target="_blank" rel="noopener">${project.url.replace(/^https?:\/\//, '')} ↗</a>`
      : '';
    const tags = (project.tags || []).map(t => `<span class="practice-tag">${t}</span>`).join('');
    const sections = (project.sections || []).filter(s => s.heading !== 'Role').map(s => {
      const paras = (s.paragraphs || []).filter(p => !isDraft(p));
      if (s.credits) {
        return `<h2 class="pd-heading">${s.heading}</h2><div class="pd-credits">${s.credits.map(c => `<p>${c}</p>`).join('')}</div>`;
      }
      if (!paras.length) return '';
      return `<h2 class="pd-heading">${s.heading}</h2>${paras.map(p => `<p>${p}</p>`).join('')}`;
    }).join('');

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
