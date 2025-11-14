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
// SEARCH FUNCTIONALITY
// =====================================
const searchBox = document.querySelector('.search-box');
if (searchBox) {
    const articles = [
        {
            title: "The Federal Government Shutdown: How a Lack of Compromise Led to Where We Are Today",
            url: "Article2.html",
            category: "US Domestic",
            excerpt: "An in-depth analysis of the 2025 federal government shutdown",
            keywords: ["government", "shutdown", "congress", "budget", "compromise", "politics", "federal"]
        },
        {
            title: "How Charlie Kirk's Assassination Reveals a Disturbing Trend in American Politics",
            url: "Article1.html",
            category: "US Domestic",
            excerpt: "Examining the rise of political violence and polarization",
            keywords: ["charlie kirk", "violence", "assassination", "polarization", "politics", "extremism"]
        }
    ];

    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    const searchContainer = searchBox.parentElement;
    searchContainer.style.position = 'relative';
    searchContainer.appendChild(searchResults);

    function performSearch(query) {
        if (!query || query.trim().length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        const searchTerm = query.toLowerCase().trim();
        const results = articles.filter(article =>
            article.title.toLowerCase().includes(searchTerm) ||
            article.excerpt.toLowerCase().includes(searchTerm) ||
            article.category.toLowerCase().includes(searchTerm) ||
            article.keywords.some(keyword => keyword.includes(searchTerm))
        );

        if (results.length === 0) {
            searchResults.innerHTML = `<div style="padding: 20px; color: whitesmoke; text-align: center;">No articles found for "${query}"</div>`;
            searchResults.style.display = 'block';
            return;
        }

        searchResults.innerHTML = results.map(article => `
            <a href="${article.url}" style="
                display: block;
                padding: 15px 20px;
                color: whitesmoke;
                text-decoration: none;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                transition: background-color 0.3s ease;
            " onmouseover="this.style.backgroundColor='#17344e'" 
               onmouseout="this.style.backgroundColor='transparent'">
                <div style="font-weight: 600; margin-bottom: 5px; color: #cba230;">${article.title}</div>
                <div style="font-size: 13px; color: rgba(255,255,255,0.7);">${article.category}</div>
            </a>
        `).join('');

        searchResults.style.display = 'block';
    }

    searchBox.addEventListener('input', (e) => performSearch(e.target.value));
    searchBox.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchBox.value.trim()) {
            const firstResult = searchResults.querySelector('a');
            if (firstResult) window.location.href = firstResult.getAttribute('href');
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target)) searchResults.style.display = 'none';
    });
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

function openInstagram() {
    const appUrl = 'instagram://app';
    const webUrl = 'https://www.instagram.com/';
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
        window.location = appUrl;
        setTimeout(() => window.open(webUrl, '_blank'), 800);
    } else {
        window.open(webUrl, '_blank', 'noopener,noreferrer');
    }
}

async function shareToInstagramCopyOpen() {
    const url = window.location.href;
    try {
        await copyTextToClipboard(url);
        showNotification('✓ Link copied to clipboard! Paste it into Instagram.', 'success');
        openInstagram();
    } catch (err) {
        console.error('Clipboard copy failed:', err);
        showNotification('✗ Couldn\'t copy link automatically. Copy manually from the address bar.', 'error');
        openInstagram();
    }
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
    const shareButtons = document.querySelectorAll('.share-btn');
    if (!shareButtons.length) {
        return;
    }

    shareButtons.forEach(btn => {
        const label = btn.textContent.toLowerCase().trim();

        // --- Twitter ---
        if (label.includes('twitter') || label.includes('🐦')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Track Twitter share event in Google Analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'share', {
                        method: 'Twitter',
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
        }

        // --- Instagram ---
        else if (label.includes('instagram') || label.includes('📸')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Track Instagram share event in Google Analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'share', {
                        method: 'Instagram',
                        content_type: 'article',
                        item_id: document.title,
                        content_url: window.location.href
                    });
                }
                
                const url = window.location.href;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(url).then(() => {
                        alert('✓ Link copied! Now paste it into your Instagram story or bio.');
                        window.open('https://www.instagram.com/', '_blank');
                    }).catch(() => {
                        alert('✗ Failed to copy. Try manually sharing.');
                        window.open('https://www.instagram.com/', '_blank');
                    });
                } else {
                    alert('Link copied! Now paste it into Instagram.');
                    window.open('https://www.instagram.com/', '_blank');
                }
            });
        }

        // --- Copy link ---
        else if (label.includes('copy') || label.includes('link') || label.includes('🔗')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Track Copy Link event in Google Analytics
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
                        alert('✓ Link copied to clipboard!');
                    }).catch(() => {
                        alert('✗ Failed to copy link.');
                    });
                } else {
                    const textarea = document.createElement('textarea');
                    textarea.value = url;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    alert('✓ Link copied to clipboard!');
                }
            });
        }
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