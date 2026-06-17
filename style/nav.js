// nav.js — include once in every page to inject the shared nav/header
(function() {
  async function loadNav() {
    const placeholder = document.getElementById('nav-placeholder');
    if (!placeholder) {
      document.dispatchEvent(new CustomEvent('nav:ready'));
      return;
    }

    // Resolve nav.html relative to the site root using root-relative path.
    // This works from any subfolder depth.
    const navPath = '/nav.html';
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
    } else {
      // Fallback: inline nav with root-relative links
      placeholder.innerHTML = `
<nav class="navbar" id="navbar">
    <div class="nav-container">
        <button class="mobile-toggle" id="mobileToggle" aria-label="Toggle navigation">☰</button>
        <ul class="nav-links" id="navLinks">
            <li><a href="/">Home</a></li>
            <li><a href="/domestic.html">US Domestic</a></li>
            <li><a href="/foreign.html">US Foreign News</a></li>
            <div class="dropdown">
                <button class="dropbtn">Local ▾</button>
                <div class="dropdown-content">
                    <li><a href="/Local.html">Local News</a></li>
                    <li><a href="/Election.html">Elections</a></li>
                </div>
            </div>
            <li><a href="/international.html">International</a></li>
            <li><a href="/Emergency.html">Emergency Statements</a></li>
            <li><a href="/oped.html">Opinion</a></li>
            <li><a href="/AboutUs.html">About Us</a></li>
            <li id="adminPageLink" style="display:none"><a href="/admin.html">Admin</a></li>
            <li id="profileLink" style="display:none"><a href="/profile.html">Profile</a></li>
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