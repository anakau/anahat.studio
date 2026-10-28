// Draft pages stay hidden from visitors. Open any page with ?preview=1 once
// to see drafts in this browser (remembered), ?preview=0 to go back to the
// public view. Not a password — just keeps unfinished pages out of sight.
(function () {
  const flag = new URLSearchParams(location.search).get('preview');
  try {
    if (flag === '1') localStorage.setItem('preview', '1');
    if (flag === '0') localStorage.removeItem('preview');
    window.PREVIEW = localStorage.getItem('preview') === '1';
  } catch (e) {
    window.PREVIEW = flag === '1';
  }
  window.DRAFTS = ['the-planetary-compendium'];
  window.isDraftHidden = slug => !window.PREVIEW && window.DRAFTS.includes(slug);
})();
