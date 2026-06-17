// nav.js — include once in every page to inject the shared nav/header
(function() {
  async function loadNav() {
    const placeholder = document.getElementById('nav-placeholder');
    if (!placeholder) {
      document.dispatchEvent(new CustomEvent('nav:ready'));
      return;
    }
    // Compute the site root based on the location of this script (javascript/nav.js).
    // This allows links to work when pages are opened from the filesystem (file://)
    // or when served from a web server regardless of the current page folder.
    let siteRoot = '/';
    try {
      const scriptSrc = (document.currentScript && document.currentScript.src) || '';
      if (scriptSrc) {
        siteRoot = scriptSrc.replace(/\/javascript\/nav.js(\?.*)?$/i, '/');
      } else {
        // fallback: derive from current location's pathname
        siteRoot = window.location.pathname.replace(/\/[^\/]*$/, '/') || '/';
      }
    } catch (e) {
      siteRoot = '/';
    }

    const navPath = siteRoot + 'nav.html';
    let html = null;

    try {
      const res = await fetch(navPath);
      if (res && res.ok) {
        html = await res.text();
      }
    } catch (err) {
      console.warn('Could not fetch nav.html:', err);
    }

    if (html) {
      placeholder.innerHTML = html;
      // Rewrite any root-relative or relative links in the injected nav to point at siteRoot
      try {
        const anchors = placeholder.querySelectorAll('a');
        anchors.forEach(a => {
          const href = a.getAttribute('href');
          if (!href) return;
          // leave absolute http(s), mailto, and hash links alone
          if (/^[a-zA-Z0-9+-]+:\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('#')) return;
          if (href.startsWith('/')) {
            a.setAttribute('href', siteRoot + href.replace(/^\//, ''));
          } else if (!href.startsWith('file:')) {
            // treat relative hrefs as relative to siteRoot
            a.setAttribute('href', siteRoot + href);
          }
        });
      } catch (e) {
        // ignore rewrite errors
      }
    } else {
      // Fallback: inline nav with root-relative links
      placeholder.innerHTML = `
<nav class="navbar" id="navbar">
    <div class="nav-container">
        <button class="mobile-toggle" id="mobileToggle" aria-label="Toggle navigation">☰</button>
        <ul class="nav-links" id="navLinks">
            <li><a href="${siteRoot}">Home</a></li>
            <li><a href="${siteRoot}domestic.html">US Domestic</a></li>
            <li><a href="${siteRoot}foreign.html">US Foreign News</a></li>
            <div class="dropdown">
                <button class="dropbtn">Local ▾</button>
                <div class="dropdown-content">
                    <li><a href="${siteRoot}Local.html">Local News</a></li>
                    <li><a href="${siteRoot}Election.html">Elections</a></li>
                </div>
            </div>
            <li><a href="${siteRoot}international.html">International</a></li>
            <li><a href="${siteRoot}Emergency.html">Emergency Statements</a></li>
            <li><a href="${siteRoot}oped.html">Opinion</a></li>
            <li><a href="${siteRoot}AboutUs.html">About Us</a></li>
            <li id="adminPageLink" style="display:none"><a href="${siteRoot}admin.html">Admin</a></li>
            <li id="profileLink" style="display:none"><a href="${siteRoot}profile.html">Profile</a></li>
            <li><a href="#" id="adminLoginBtn">Login</a></li>
        </ul>
        <div class="search-container">
            <input type="text" class="search-box" placeholder="Search..." aria-label="Search">
        </div>
    </div>
</nav>`;
      console.warn('nav.html not found; using embedded fallback nav');
    }

    document.dispatchEvent(new CustomEvent('nav:ready'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNav);
  } else {
    loadNav();
  }
})();