let article;
let author;
let title;
let date;
let readingTime;
let citationSource;
let image;
let imageSource;
let category;

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('articleForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get all form values
        article = document.getElementById('articleContent').value;
        author = document.getElementById('articleAuthor').value;
        title = document.getElementById('articleTitle').value;
        date = document.getElementById('articleDate').value;
        readingTime = document.getElementById('articleReadTime').value;
        citationSource = document.getElementById('articleCitationsPage').value;
        image = document.getElementById('articleImage').value;
        imageSource = document.getElementById('articleImageSource').value;
        category = document.getElementById('articleCategory').value;

        // Generate the HTML
        const generatedHTML = generateArticleHTML();
        
        // Display the generated HTML in the output box
        const outputCode = document.getElementById('articleCode');
        const outputBox = document.getElementById('articleOutput');
        
        if (outputCode && outputBox) {
            outputCode.textContent = generatedHTML;
            outputBox.style.display = 'block';
            
            // Store the HTML for download
            window.currentArticleHTML = generatedHTML;
            
            // Scroll to the output
            outputBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
});

function getParagraphs(text) {
    return text
        .trim()
        .split(/\r?\n\s*\r?\n/)
        .map(p => p.replace(/\r?\n/g, " ").trim())
        .filter(p => p.length > 0);
}

// Citations Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const citationsForm = document.getElementById('citationsForm');
    if (citationsForm) {
        citationsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const citationsList = document.getElementById('citationsList').value;
            const articleLink = document.getElementById('citationsArticleLink').value;
            const approvalDate = document.getElementById('citationsApprovalDate').value;
            const approvingBody = document.getElementById('citationsApprovingBody').value;
            
            const generatedCitationsHTML = generateCitationsHTML(citationsList, articleLink, approvalDate, approvingBody);
            
            const outputCode = document.getElementById('citationsCode');
            const outputBox = document.getElementById('citationsOutput');
            
            if (outputCode && outputBox) {
                outputCode.textContent = generatedCitationsHTML;
                outputBox.style.display = 'block';
                
                // Store the HTML for download
                window.currentCitationsHTML = generatedCitationsHTML;
                
                outputBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }
});

function generateCitationsHTML(citationsList, articleLink, approvalDate, approvingBody) {
    const citations = citationsList.trim().split('\n').filter(c => c.trim().length > 0);
    
    const citationsHTML = citations.map(citation => {
        let formatted = citation.trim();
        
        // Find and convert URLs to links in order of specificity
        // This processes each URL only once
        const urlPattern = /\b((?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.[a-z]{2,}(?:\/[^\s]*)?)/gi;
        
        formatted = formatted.replace(urlPattern, function(match) {
            // Clean up the URL
            let url = match.trim();
            
            // Add https:// if not present
            let href = url;
            if (!href.startsWith('http://') && !href.startsWith('https://')) {
                href = 'https://' + href;
            }
            
            // Return the formatted link
            return `<a href="${href}" target="_blank">\n                ${url}\n            </a>`;
        });
        
        // Italicize source/publication names after quoted titles
        formatted = formatted.replace(/"([^"]+)"\s+<em>([^<]+)<\/em>/g, '"$1" <em>$2</em>');
        formatted = formatted.replace(/"([^"]+)"\s+([^,<\n]+?),/g, function(match, title, source) {
            if (source.includes('<a href=')) {
                return match;
            }
            return `"${title}"\n            <em>${source.trim()}</em>,`;
        });
        
        return `        <p>\n            ${formatted}\n        </p>`;
    }).join('\n\n');
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Citations for article">
    <title>Citations | TheYUNityProject</title>
    <link rel="stylesheet" href="enhanced-style.css">
</head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-Z2M32LXLLW"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-Z2M32LXLLW');
</script>
<body class="works-cited-page">
    <div class="header-container">
        <div class="header-pattern"></div>
        <div class="header-text">
            <h1>The YUNity Project</h1>
            <p class="header-tagline">Veritas vos liberabit</p>
        </div>
    </div>

    <nav class="navbar" id="navbar">
        <div class="nav-container">
            <button class="mobile-toggle" id="mobileToggle" aria-label="Toggle navigation">☰</button>
            <ul class="nav-links" id="navLinks">
                <li><a href="index.html">Home</a></li>
                <li><a href="domestic.html">US Domestic</a></li>
                <li><a href="foreign.html">US Foreign News</a></li>
                    <!-- Dropdown section -->
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
                <input type="text" class="search-box" placeholder="Search..." aria-label="Search">
            </div>
        </div>
    </nav>

    <div class="WorksCited">
        <h1>Works Cited</h1>

        <p>This article was passed unanimously in the affirmative by the ${approvingBody} on ${approvalDate}</p>
        
${citationsHTML}
    </div>

    <div style="margin-top: 60px; text-align: center;">
        <a href="${articleLink}" style="color: #cba230; font-size: 18px; text-decoration: none; border: 2px solid #cba230; padding: 12px 30px; border-radius: 25px; display: inline-block; transition: all 0.3s ease;">
            ← Back to Article
        </a>
    </div>

    <div class="back-to-top" id="backToTop" aria-label="Back to top">↑</div>

    <script src="enhanced-script.js"></script>
</body>
</html>`;

    return html;
}

function generateArticleHTML() {
    const paragraphs = getParagraphs(article);
    
    // Generate paragraph HTML with proper formatting
    const paragraphsHTML = paragraphs.map(p => `            <p>${p}</p>`).join('\n\n');
    
    // Generate the complete HTML document
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${title}">
    <meta property="og:title" content="${title} | TheYUNityProject">
    <meta property="og:description" content="${title}">
    <title>${title} | TheYUNityProject</title>
    <link rel="stylesheet" href="enhanced-style.css">
</head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-Z2M32LXLLW"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-Z2M32LXLLW');
</script>
<body>
    <div class="header-container">
        <div class="header-pattern"></div>
        <div class="header-text">
            <h1>The YUNity Project</h1>
            <p class="header-tagline">Veritas vos liberabit</p>
        </div>
    </div>

    <nav class="navbar" id="navbar">
        <div class="nav-container">
            <button class="mobile-toggle" id="mobileToggle" aria-label="Toggle navigation">☰</button>
            <ul class="nav-links" id="navLinks">
                <li><a href="index.html">Home</a></li>
                <li><a href="domestic.html">US Domestic</a></li>
                <li><a href="foreign.html">US Foreign News</a></li>
                    <!-- Dropdown section -->
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
                <input type="text" class="search-box" placeholder="Search..." aria-label="Search">
            </div>
        </div>
    </nav>

    <article class="article-page">
        <header class="article-header">
            <h1 class="article-page-title">${title}</h1>
            <p class="article-author">By: ${author}</p>
            <div class="article-meta">
                <span>📅 ${date}</span>
                <span>⏱️ ${readingTime}</span>
                <span>📁 ${category}</span>
            </div>
        </header>

        <div class="article-featured-image ${image}"></div>
        <p class="image-credit">${imageSource}</p>

        <div class="article-body">
${paragraphsHTML}
        </div>

        <!-- Social Share Buttons -->
        <div class="share-container">
            <a href="#" class="share-btn">🐦 Twitter</a>
            <a href="#" class="share-btn">📸 Instagram</a>
            <a href="#" class="share-btn">🔗 Copy Link</a>
        </div>

        <footer class="article-citations">
            <a href="${citationSource}">View Citations</a>
        </footer>
    </article>

    <div class="back-to-top" id="backToTop" aria-label="Back to top">↑</div>

    <script src="enhanced-script.js"></script>
</body>
</html>`;

    return html;
}

// Copy function helper - attach to window so onclick can find it
window.copyCode = function(elementId) {
    const code = document.getElementById(elementId);
    if (!code) {
        console.error('Code element not found');
        return;
    }
    
    const text = code.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        // Find the button that was clicked
        const buttons = document.querySelectorAll('.btn-copy');
        buttons.forEach(button => {
            if (button.onclick && button.onclick.toString().includes(elementId)) {
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                button.style.backgroundColor = '#28a745';
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.backgroundColor = '';
                }, 2000);
            }
        });
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy code. Please try selecting and copying manually.');
    });
}

// Download Article function
window.downloadArticle = function() {
    const filename = prompt('Enter filename for the article (without .html):', 'article');
    if (!filename) return;
    
    if (!window.currentArticleHTML) {
        alert('Please generate the article first!');
        return;
    }
    
    const blob = new Blob([window.currentArticleHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.html') ? filename : filename + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Download Citations function
window.downloadCitations = function() {
    const filename = prompt('Enter filename for the citations page (without .html):', 'citations');
    if (!filename) return;
    
    if (!window.currentCitationsHTML) {
        alert('Please generate the citations first!');
        return;
    }
    
    const blob = new Blob([window.currentCitationsHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.html') ? filename : filename + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}