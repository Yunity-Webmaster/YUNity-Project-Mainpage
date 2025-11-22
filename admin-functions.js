// Admin Functions for YUNity Project

// Show/Hide sections
function showSection(type) {
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    
    if (type === 'article') {
        document.getElementById('articleSection').classList.add('active');
    } else if (type === 'card') {
        document.getElementById('cardSection').classList.add('active');
    } else if (type === 'citations') {
        document.getElementById('citationsSection').classList.add('active');
    }
}

function hideSection(type) {
    if (type === 'article') {
        document.getElementById('articleSection').classList.remove('active');
        document.getElementById('articleOutput').classList.remove('active');
    } else if (type === 'card') {
        document.getElementById('cardSection').classList.remove('active');
        document.getElementById('cardOutput').classList.remove('active');
    } else if (type === 'citations') {
        document.getElementById('citationsSection').classList.remove('active');
        document.getElementById('citationsOutput').classList.remove('active');
    }
}

// Copy code to clipboard
function copyCode(elementId) {
    const code = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(code).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        alert('Failed to copy code. Please copy manually.');
    });
}

// Generate Article HTML
const articleForm = document.getElementById('articleForm');
if (articleForm) {
    articleForm.addEventListener('submit', function(e) {
        e.preventDefault();
    
    const title = document.getElementById('articleTitle').value;
    const category = document.getElementById('articleCategory').value;
    const author = document.getElementById('articleAuthor').value;
    const date = document.getElementById('articleDate').value;
    const image = document.getElementById('articleImage').value;
    const content = document.getElementById('articleContent').value;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${title} - The YUNity Project">
    <title>${title} - The YUNity Project</title>
    <link rel="stylesheet" href="enhanced-style.css">
</head>
<body>

    <!-- Enhanced Header -->
    <div class="header-container">
        <div class="header-pattern"></div>
        <div class="header-text">
            <h1>The YUNity Project</h1>
            <p class="header-tagline">Veritas vos liberabit</p>
        </div>
    </div>

    <!-- Sticky Navigation -->
    <nav class="navbar" id="navbar">
        <div class="nav-container">
            <button class="mobile-toggle" id="mobileToggle" aria-label="Toggle navigation">☰</button>
            <ul class="nav-links" id="navLinks">
                <li><a href="index.html">Home</a></li>
                <li><a href="domestic.html">US Domestic</a></li>
                <li><a href="foreign.html">US Foreign Policy</a></li>
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
            </ul>
            <div class="search-container">
                <input type="text" class="search-box" placeholder="Search articles..." aria-label="Search">
            </div>
        </div>
    </nav>

    <!-- Article Content -->
    <div class="article-page">
        <header class="article-header">
            <h1 class="article-page-title">${title}</h1>
            <p class="article-author">By ${author}</p>
            <p class="article-meta">${date}</p>
        </header>

        <div class="article-featured-image" style="background-image: url('${image}');"></div>

        <div class="article-body">
            ${content}
        </div>

        <!-- Social Share -->
        <div class="social-share">
            <button class="share-btn" onclick="shareArticle('twitter')">Share on Twitter</button>
            <button class="share-btn" onclick="shareArticle('facebook')">Share on Facebook</button>
            <button class="share-btn" onclick="shareArticle('linkedin')">Share on LinkedIn</button>
        </div>
    </div>

    <div class="back-to-top" id="backToTop" aria-label="Back to top">↑</div>

    <script src="enhanced-script.js"></script>
    <script>
        function shareArticle(platform) {
            const url = window.location.href;
            const title = document.querySelector('.article-page-title').textContent;
            
            let shareUrl;
            switch(platform) {
                case 'twitter':
                    shareUrl = \`https://twitter.com/intent/tweet?url=\${encodeURIComponent(url)}&text=\${encodeURIComponent(title)}\`;
                    break;
                case 'facebook':
                    shareUrl = \`https://www.facebook.com/sharer/sharer.php?u=\${encodeURIComponent(url)}\`;
                    break;
                case 'linkedin':
                    shareUrl = \`https://www.linkedin.com/sharing/share-offsite/?url=\${encodeURIComponent(url)}\`;
                    break;
            }
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    </script>
</body>
</html>`;

    document.getElementById('articleCode').textContent = html;
    document.getElementById('articleOutput').classList.add('active');
    });
}

// Generate Card HTML
const cardForm = document.getElementById('cardForm');
if (cardForm) {
    cardForm.addEventListener('submit', function(e) {
        e.preventDefault();
    
    const title = document.getElementById('cardTitle').value;
    const category = document.getElementById('cardCategory').value;
    const link = document.getElementById('cardLink').value;
    const date = document.getElementById('cardDate').value;
    const image = document.getElementById('cardImage').value;
    const readTime = document.getElementById('cardReadTime').value;
    const excerpt = document.getElementById('cardExcerpt').value;

    const html = `<article class="article-card">
    <a href="${link}" class="card-link">
        <div class="article-image ${image}">
            <span class="article-category">${category}</span>
        </div>
        <div class="article-content">
            <div class="article-meta">
                <span>📅 ${date}</span>
                <span>⏱️ ${readTime}</span>
            </div>
            <h3 class="article-title">${title}</h3>
            <p class="article-excerpt">${excerpt}</p>
            <span class="read-more">Read More →</span>
        </div>
    </a>
</article>`;

    document.getElementById('cardCode').textContent = html;
    document.getElementById('cardOutput').classList.add('active');
    });
}

// Generate Citations
const citationsForm = document.getElementById('citationsForm');
if (citationsForm) {
    citationsForm.addEventListener('submit', function(e) {
        e.preventDefault();
    
    const type = document.getElementById('citationType').value;
    const author = document.getElementById('citationAuthor').value;
    const title = document.getElementById('citationTitle').value;
    const source = document.getElementById('citationSource').value;
    const date = document.getElementById('citationDate').value;
    const url = document.getElementById('citationURL').value;

    let citation = '';
    
    switch(type) {
        case 'website':
            citation = `${author}. "${title}." <i>${source}</i>, ${date}${url ? ', ' + url : ''}.`;
            break;
        case 'article':
            citation = `${author}. "${title}." <i>${source}</i>, ${date}${url ? ', ' + url : ''}.`;
            break;
        case 'book':
            citation = `${author}. <i>${title}</i>. ${source}, ${date}.`;
            break;
        case 'journal':
            citation = `${author}. "${title}." <i>${source}</i>, ${date}${url ? ', ' + url : ''}.`;
            break;
    }

    document.getElementById('citationsCode').innerHTML = citation;
    document.getElementById('citationsOutput').classList.add('active');
    });
}