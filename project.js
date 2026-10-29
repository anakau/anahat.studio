(function () {
  const slug = new URLSearchParams(window.location.search).get('slug');
  const project = PROJECTS.find(p => p.slug === slug);
  if (project) document.title = `${project.name} — Anahat Kaur`;

  // Content intentionally left blank — each project page is getting its
  // own custom layout (starting with The Planetary Compendium) rather than
  // the old shared paragraphs/gallery template.

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
