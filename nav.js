// nav.js — include once in every page to inject the shared nav/header
(function() {
  async function loadNav() {
    try {
      const res = await fetch('nav.html');
      if (!res.ok) return;
      const html = await res.text();
      const placeholder = document.getElementById('nav-placeholder');
      if (placeholder) {
        placeholder.innerHTML = html;
      }
    } catch (err) {
      console.error('Failed to load nav.html', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNav);
  } else {
    loadNav();
  }
})();
