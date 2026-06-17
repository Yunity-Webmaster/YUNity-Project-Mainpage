// nav.js — include once in every page to inject the shared nav/header
(function() {
  async function loadNav() {
    const placeholder = document.getElementById('nav-placeholder');
    if (!placeholder) {
      document.dispatchEvent(new CustomEvent('nav:ready'));
      return;
    }

    // Try multiple paths to find nav.html
    const candidates = ['nav.html', './nav.html', '../nav.html', '/nav.html'];
    let html = null;

    for (const path of candidates) {
      try {
        const res = await fetch(path);
        if (res && res.ok) {
          html = await res.text();
          break;
        }
      } catch (err) {
        // try next path
      }
    }

    if (html) {
      placeholder.innerHTML = html;
    } else {
      // Fallback full nav markup with root-relative links
      placeholder.innerHTML = `
<nav class="navbar" id="navbar">
    <div class="nav-container">
        <button class="mobile-toggle" id="mobileToggle" aria-label="Toggle navigation">☰</button>
        <ul class="nav-links" id="navLinks">
            <li><a href="index.html">Home</a></li>
            <li><a href="domestic.html">US Domestic</a></li>
            <li><a href="foreign.html">US Foreign News</a></li>
            <div class="dropdown">
                <button class="dropbtn">Local ▾</button>
                <div class="dropdown-content">
                    <li><a href="Local.html">Local News</a></li>
                    <li><a href="Election.html">2025 Election</a></li>
                </div>
            </div>
            <li><a href="international.html">International</a></li>
            <li><a href="Emergency.html">Emergency Statements</a></li>
            <li><a href="oped.html">Opinion</a></li>
            <li><a href="AboutUs.html">About Us</a></li>
            <li id="adminPageLink" style="display:none"><a href="admin.html">Admin</a></li>
            <li id="profileLink" style="display:none"><a href="profile.html">Profile</a></li>
            <li><a href="#" id="adminLoginBtn">Login</a></li>
        </ul>
        <div class="search-container">
            <input type="text" class="search-box" placeholder="Search..." aria-label="Search">
        </div>
    </div>
</nav>
      `;
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