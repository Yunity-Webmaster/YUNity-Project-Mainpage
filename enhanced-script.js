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
    // Articles database - add all your articles here
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
        // Add more articles as you create them
    ];

    // Create search results dropdown
    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';

    // Make search container position relative
    const searchContainer = searchBox.parentElement;
    searchContainer.style.position = 'relative';
    searchContainer.appendChild(searchResults);

    // Search function
    function performSearch(query) {
        if (!query || query.trim().length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        const searchTerm = query.toLowerCase().trim();
        const results = articles.filter(article => {
            return article.title.toLowerCase().includes(searchTerm) ||
                   article.excerpt.toLowerCase().includes(searchTerm) ||
                   article.category.toLowerCase().includes(searchTerm) ||
                   article.keywords.some(keyword => keyword.includes(searchTerm));
        });

        if (results.length === 0) {
            searchResults.innerHTML = `
                <div style="padding: 20px; color: whitesmoke; text-align: center;">
                    No articles found for "${query}"
                </div>
            `;
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
                <div style="font-weight: 600; margin-bottom: 5px; color: #cba230;">
                    ${article.title}
                </div>
                <div style="font-size: 13px; color: rgba(255,255,255,0.7);">
                    ${article.category}
                </div>
            </a>
        `).join('');

        searchResults.style.display = 'block';
    }

    // Event listeners for search
    searchBox.addEventListener('input', (e) => {
        performSearch(e.target.value);
    });

    searchBox.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchBox.value.trim()) {
            const firstResult = searchResults.querySelector('a');
            if (firstResult) {
                window.location.href = firstResult.getAttribute('href');
            }
        }
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

// =====================================
// NEWSLETTER SIGNUP
// =====================================
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const emailInput = newsletterForm.querySelector('.newsletter-input');
        const submitBtn = newsletterForm.querySelector('.newsletter-btn');
        const email = emailInput.value.trim();

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        // Disable button and show loading
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Subscribing...';

        try {
            // Simulate API call (replace with your actual backend endpoint)
            // Example:
            // const response = await fetch('YOUR_BACKEND_URL/api/subscribe', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ email })
            // });
            // if (!response.ok) throw new Error('Subscription failed');

            // For now, simulate success after 1 second
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Store in localStorage (temporary solution)
            const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
            if (!subscribers.includes(email)) {
                subscribers.push(email);
                localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
            }

            showNotification('✗ Subscription failed. Please try again later.', 'error'); //'✓ Successfully subscribed! Check your email for confirmation.', 'success');
            emailInput.value = '';
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

function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        '_blank',
        'width=600,height=400'
    );
}

function shareOnLinkedIn() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
        '_blank',
        'width=600,height=400'
    );
}

function copyLinkToClipboard() {
    const url = window.location.href;
    
    // Modern clipboard API
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
    
    shareButtons.forEach((btn, index) => {
        const btnText = btn.textContent.toLowerCase();
        
        if (btnText.includes('twitter') || btnText.includes('🐦')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                shareOnTwitter();
            });
        } else if (btnText.includes('facebook') || btnText.includes('📘')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                shareOnFacebook();
            });
        } else if (btnText.includes('linkedin') || btnText.includes('💼')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                shareOnLinkedIn();
            });
        } else if (btnText.includes('copy') || btnText.includes('link') || btnText.includes('🔗')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                copyLinkToClipboard();
            });
        }
    });
});

// =====================================
// NOTIFICATION SYSTEM
// =====================================
function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.custom-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
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

    // Auto-remove after 4 seconds
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
            document.querySelector(href).scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// =====================================
// ANIMATION ON SCROLL
// =====================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe article cards on page load
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