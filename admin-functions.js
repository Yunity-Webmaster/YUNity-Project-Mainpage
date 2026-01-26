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
    } else if (type === 'users') {
        document.getElementById('usersSection').classList.add('active');
        loadUsers(); // Load users when section is shown
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
    } else if (type === 'users') {
        document.getElementById('usersSection').classList.remove('active');
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
        const readTime = document.getElementById('articleReadTime').value;
        const citationsPage = document.getElementById('articleCitationsPage').value;
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
            <p class="article-meta">${date} • ${readTime}</p>
        </header>

        <div class="article-featured-image" style="background-image: url('${image}');"></div>

        <div class="article-body">
            ${content}
        </div>

        <!-- Citations Link -->
        <div class="article-citations">
            <a href="${citationsPage}">Works Cited</a>
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
        
        const citationsList = document.getElementById('citationsList').value;
        
        // Split by line breaks and filter out empty lines
        const citations = citationsList.split('\n').filter(line => line.trim() !== '');
        
        console.log('Processing citations:', citations);
        
        // Generate HTML for each citation with automatic formatting
        let citationsHTML = '';
        citations.forEach((citation, index) => {
            let formatted = citation.trim();
            
            console.log(`\n--- Citation ${index + 1} ---`);
            console.log('Original:', formatted);
            console.log('Full character codes:', formatted.split('').map((c, i) => `[${i}]${c}=${c.charCodeAt(0)}`).join(' '));
            
            // Step 1: Find and italicize the source (publication name)
            // Pattern: anything ending with period/quote, then Source, then comma
            // This should match: ." AP News, or ". AP News,
            
            let sourceMatch = null;
            
            // Try pattern 1: Quote at end followed by period, space, source, comma
            // Matches: ." Source, or ". Source,
            sourceMatch = formatted.match(/[.][""]?\s+([^,]+?),/);
            console.log('Pattern 1 match (. followed by source):', sourceMatch);
            
            if (sourceMatch) {
                const source = sourceMatch[1].trim();
                console.log('Found source:', source);
                console.log('Full match:', sourceMatch[0]);
                
                // Replace the source name with italicized version
                const replacement = sourceMatch[0].replace(source, `<em>${source}</em>`);
                formatted = formatted.replace(sourceMatch[0], replacement);
                console.log('After source italicization:', formatted);
            } else {
                console.log('No source match found');
            }
            
            // Step 2: Find and format the URL
            // This looks for URLs with or without http:// or https://
            // Matches patterns like: domain.com/path or https://domain.com/path
            const urlMatch = formatted.match(/(https?:\/\/)?([a-zA-Z0-9][-a-zA-Z0-9]*\.)+[a-zA-Z]{2,}(\/[^\s,]*)?/i);
            
            if (urlMatch) {
                let fullUrl = urlMatch[0];
                // Remove trailing punctuation like . or #.
                fullUrl = fullUrl.replace(/[.,;#]+$/, '');
                console.log('Found URL:', fullUrl);
                
                // Add https:// if not present for the href
                const linkUrl = fullUrl.match(/^https?:\/\//i) ? fullUrl : 'https://' + fullUrl;
                
                // Remove protocol for display
                const displayUrl = fullUrl.replace(/^https?:\/\//i, '');
                console.log('Link URL:', linkUrl);
                console.log('Display URL:', displayUrl);
                
                // Replace the URL with formatted link
                formatted = formatted.replace(fullUrl, `<a href="${linkUrl}" target="_blank">${displayUrl}</a>`);
                console.log('After URL replacement:', formatted);
            } else {
                console.log('No URL found');
            }
            
            console.log('Final formatted:', formatted);
            
            citationsHTML += `        <p>\n            ${formatted}\n        </p>\n`;
        });

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Works Cited - The YUNity Project</title>
    <link rel="stylesheet" href="enhanced-style.css">
</head>
<body class="works-cited-page">

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

    <!-- Works Cited Content -->
    <div class="WorksCited">
        <h1>Works Cited</h1>
${citationsHTML}
    </div>

    <div class="back-to-top" id="backToTop" aria-label="Back to top">↑</div>

    <script src="enhanced-script.js"></script>
</body>
</html>`;

        console.log('\n=== FINAL HTML ===');
        console.log(html);

        document.getElementById('citationsCode').textContent = html;
        document.getElementById('citationsOutput').classList.add('active');
    });
}