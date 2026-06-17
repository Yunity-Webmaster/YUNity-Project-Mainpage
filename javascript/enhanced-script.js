// =====================================
// MOBILE MENU TOGGLE
// =====================================
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');

if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar')) {
            navLinks.classList.remove('active');
        }
    });
}

// =====================================
// NAVBAR SCROLL EFFECT
// =====================================
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// =====================================
// BACK TO TOP BUTTON
// =====================================
const backToTop = document.getElementById('backToTop');
if (backToTop) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// =====================================
// SEARCH FUNCTIONALITY (DOM-driven)
// Initialize when search input is present; retry after nav injection.
// =====================================
function initSearch() {
    const searchBox = document.querySelector('.search-box');
    if (!searchBox) return false;

    // avoid double-init
    if (searchBox.dataset.initialized) return true;
    searchBox.dataset.initialized = '1';

    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    const searchContainer = searchBox.parentElement;
    searchContainer.style.position = 'relative';
    searchContainer.appendChild(searchResults);

    function performSearch(query) {
        const q = query.toLowerCase().trim();

        // If global ARTICLES index is available, perform sitewide search
        if (window.ARTICLES && Array.isArray(window.ARTICLES) && window.ARTICLES.length) {
            if (!q || q.length < 2) {
                searchResults.style.display = 'none';
                return;
            }
            const results = window.ARTICLES.filter(a => {
                const title = (a.title || '').toLowerCase();
                const excerpt = (a.excerpt || '').toLowerCase();
                const category = (a.category || '').toLowerCase();
                const kws = (a.keywords || []).join(' ').toLowerCase();
                return title.includes(q) || excerpt.includes(q) || category.includes(q) || kws.includes(q);
            });

            if (results.length === 0) {
                searchResults.innerHTML = `<div style="padding: 12px; color: whitesmoke; text-align:center;">No articles found for "${query}"</div>`;
            } else {
                searchResults.innerHTML = results.map(a => `
                    <a href="${a.url}" style="display:block;padding:12px 16px;color:whitesmoke;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.06)">
                        <div style="font-weight:600;color:#cba230">${a.title}</div>
                        <div style="font-size:13px;color:rgba(255,255,255,0.7)">${a.category} · ${a.date || ''}</div>
                    </a>`).join('');
            }
            searchResults.style.display = 'block';
            return;
        }

        // Fallback: filter visible article cards on this page
        const cards = Array.from(document.querySelectorAll('.article-card'));

        if (!q || q.length < 2) {
            cards.forEach(c => c.style.display = 'block');
            searchResults.style.display = 'none';
            return;
        }

        const matches = cards.filter(card => {
            const title = (card.querySelector('.article-title')?.textContent || '').toLowerCase();
            const excerpt = (card.querySelector('.article-excerpt')?.textContent || '').toLowerCase();
            const category = (card.querySelector('.article-category')?.textContent || '').toLowerCase();
            return title.includes(q) || excerpt.includes(q) || category.includes(q);
        });

        cards.forEach(card => card.style.display = matches.includes(card) ? 'block' : 'none');

        if (matches.length === 0) {
            searchResults.innerHTML = `<div style="padding: 12px; color: whitesmoke; text-align:center;">No articles found for "${query}"</div>`;
        } else {
            searchResults.innerHTML = matches.map(card => {
                const link = card.querySelector('.card-link');
                const href = link ? link.getAttribute('href') : '#';
                const title = card.querySelector('.article-title')?.textContent || '';
                const category = card.querySelector('.article-category')?.textContent || '';
                return `
                    <a href="${href}" style="display:block;padding:12px 16px;color:whitesmoke;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.06)">
                        <div style="font-weight:600;color:#cba230">${title}</div>
                        <div style="font-size:13px;color:rgba(255,255,255,0.7)">${category}</div>
                    </a>`;
            }).join('');
        }

        searchResults.style.display = 'block';
    }

    searchBox.addEventListener('input', (e) => performSearch(e.target.value));
    searchBox.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const first = searchResults.querySelector('a');
            if (first) window.location.href = first.getAttribute('href');
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target)) searchResults.style.display = 'none';
    });

    return true;
}

// Try to init now; if nav injects later it will dispatch 'nav:ready'
if (!initSearch()) {
    document.addEventListener('nav:ready', () => initSearch());
    window.addEventListener('articles:loaded', () => initSearch());

    // fallback: observe DOM for insertion of .search-box
    const obs = new MutationObserver(() => {
        if (initSearch()) obs.disconnect();
    });
    obs.observe(document.body, { childList: true, subtree: true });
}



// =====================================
// NEWSLETTER SIGNUP WITH GOOGLE SHEETS
// =====================================

// REPLACE THIS with your Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwHIVxmoCcfefNPZ_mX8UDbgG2WpZPIG85NGyTUaeDhV9CB8wN1oLVs54oZgEC9i08_/exec';

const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    // Update placeholder text
    const emailInput = newsletterForm.querySelector('.newsletter-input');
    if (emailInput && emailInput.placeholder === 'Work In Progress') {
        emailInput.placeholder = 'Enter your email address';
    }

    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = newsletterForm.querySelector('.newsletter-btn');
        const email = emailInput.value.trim();

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Subscribing...';

        try {
            // Send to Google Sheets
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Important for Google Apps Script
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    timestamp: new Date().toISOString(),
                    source: window.location.href
                })
            });

            // Note: no-cors mode means we can't read the response
            // But if no error was thrown, the request was sent successfully
            showNotification('✓ Successfully subscribed to our newsletter!', 'success');
            emailInput.value = '';
            
            // Log success (without exposing email list)
            console.log('Newsletter subscription submitted successfully');
            
        } catch (error) {
            showNotification('✗ Subscription failed. Please try again later.', 'error');
            console.error('Newsletter subscription error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// =====================================
// SOCIAL SHARE FUNCTIONS
// =====================================
function shareOnTwitter() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    const text = encodeURIComponent('Check out this article from The YUNity Project: ');
    window.open(
        `https://twitter.com/intent/tweet?url=${url}&text=${text}${title}`,
        '_blank',
        'width=600,height=400'
    );
}

function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            const ok = document.execCommand('copy');
            document.body.removeChild(textarea);
            if (ok) resolve();
            else reject(new Error('execCommand copy failed'));
        } catch (err) {
            document.body.removeChild(textarea);
            reject(err);
        }
    });
}


function copyLinkToClipboard() {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            showNotification('✓ Link copied to clipboard!', 'success');
        }).catch(() => {
            fallbackCopyToClipboard(url);
        });
    } else {
        fallbackCopyToClipboard(url);
    }
}

function fallbackCopyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showNotification('✓ Link copied to clipboard!', 'success');
    } catch (err) {
        showNotification('✗ Failed to copy link', 'error');
    }
    document.body.removeChild(textarea);
}

// =====================================
// ATTACH SHARE BUTTON HANDLERS
// =====================================
document.addEventListener('DOMContentLoaded', () => {
    // Ensure share buttons exist on article pages
    const articles = document.querySelectorAll('.article-page');
    articles.forEach(article => {
        const hasShare = article.querySelector('.share-btn');
        if (!hasShare) {
            const container = document.createElement('div');
            container.className = 'social-share';
            container.innerHTML = `
                <a href="#" class="share-btn" data-service="twitter" role="button" tabindex="0" aria-label="Share on X">🐦 X</a>
                <a href="#" class="share-btn" data-service="copy" role="button" tabindex="0" aria-label="Copy link to clipboard">🔗 Copy Link</a>
            `;
            const footer = article.querySelector('.article-citations') || article.querySelector('.article-footer');
            if (footer) footer.parentElement.insertBefore(container, footer);
            else article.appendChild(container);
        }
    });

    // Remove any existing share buttons that are not Twitter/X or Copy
    document.querySelectorAll('.share-btn').forEach(btn => {
        const svc = (btn.dataset && btn.dataset.service) ? btn.dataset.service.toLowerCase() : btn.textContent.toLowerCase();
        if (!(svc.includes('twitter') || svc.includes('x') || svc.includes('🐦') || svc.includes('copy') || svc.includes('🔗') || svc.includes('link'))) {
            btn.remove();
        }
    });

    let shareButtons = document.querySelectorAll('.share-btn');
    if (!shareButtons.length) {
        return;
    }

    shareButtons.forEach(btn => {
        const dataService = (btn.dataset && btn.dataset.service) ? btn.dataset.service.toLowerCase() : null;
        const label = dataService || btn.textContent.toLowerCase().trim();

        // Only handle X (Twitter) and Copy Link
        if (label.includes('twitter') || label.includes('x') || label.includes('🐦')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();

                if (typeof gtag !== 'undefined') {
                    gtag('event', 'share', {
                        method: 'X',
                        content_type: 'article',
                        item_id: document.title,
                        content_url: window.location.href
                    });
                }

                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent('Check out this article from The YUNity Project: ');
                window.open(
                    `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
                    '_blank',
                    'width=600,height=400'
                );
            });
            // Keyboard accessibility
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
            return;
        }

        if (label.includes('copy') || label.includes('link') || label.includes('🔗')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();

                if (typeof gtag !== 'undefined') {
                    gtag('event', 'share', {
                        method: 'Copy Link',
                        content_type: 'article',
                        item_id: document.title,
                        content_url: window.location.href
                    });
                }

                const url = window.location.href;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(url).then(() => {
                        showNotification('✓ Link copied to clipboard!', 'success');
                    }).catch(() => {
                        fallbackCopyToClipboard(url);
                    });
                } else {
                    fallbackCopyToClipboard(url);
                }
            });
            // Keyboard accessibility
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
            return;
        }

        // Unexpected buttons: remove to enforce policy
        btn.remove();
    });
});

// =====================================
// NOTIFICATION SYSTEM
// =====================================
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.custom-notification');
    if (existingNotification) existingNotification.remove();

    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    const bgColor = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17344e';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: ${bgColor};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-size: 16px;
        font-weight: 500;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// =====================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// =====================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// =====================================
// ANIMATION ON SCROLL
// =====================================
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.article-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// =====================================
// DROPDOWN MENU (Mobile)
// =====================================
document.querySelectorAll('.dropdown > .dropbtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            const dropdown = btn.parentElement;
            dropdown.classList.toggle('open');
        }
    });
});

// =====================================
// CONSOLE MESSAGE
// =====================================
console.log('%cThe YUNity Project', 'color: #cba230; font-size: 24px; font-weight: bold;');
console.log('%cVeritas vos liberabit - The truth shall set you free', 'color: #17344e; font-size: 14px;');
console.log('%cNewsletter emails are securely stored in Google Sheets', 'color: #17344e; font-size: 12px;');