// Minimal Google Apps Script backend for YUNity Project Admin

const ALLOWED_ADMINS = [
  'beneppolito5@gmail.com',
  'yunitywebmaster@outlook.org',
  'hajoonyun@gmail.com'
];

function doGet(e) {
  // Public API: ?action=getArticles (optional JSONP callback)
  if (e && e.parameter && e.parameter.action === 'getArticles') {
    const callback = e.parameter.callback;
    const articles = getArticles();
    const payload = JSON.stringify({success: true, articles: articles});
    if (callback) {
      return ContentService.createTextOutput(`${callback}(${payload})`).setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
  }

  // Admin UI: only allow configured admins to view
  const userEmail = Session.getActiveUser().getEmail();
  if (!isAdminUser(userEmail)) {
    return HtmlService.createHtmlOutput('<h2>Access denied</h2><p>You must be a YUNity admin to view this page.</p>');
  }
  return HtmlService.createHtmlOutputFromFile('Index').setTitle('YUNity Admin');
}

function isAdminUser(email) {
  if (!email) return false;
  return ALLOWED_ADMINS.indexOf(email) !== -1;
}

// Simple JSON storage of articles in script properties (for small sites).
function getArticles() {
  const raw = PropertiesService.getScriptProperties().getProperty('ARTICLES_JSON') || '[]';
  return JSON.parse(raw);
}

function saveArticles(articles) {
  PropertiesService.getScriptProperties().setProperty('ARTICLES_JSON', JSON.stringify(articles));
  return {status: 'ok', count: articles.length};
}

function addArticle(article) {
  const list = getArticles();
  list.unshift(article);
  saveArticles(list);
  return {status: 'ok', article};
}

function removeArticleByUrl(url) {
  const list = getArticles().filter(a => a.url !== url);
  saveArticles(list);
  return {status: 'ok', count: list.length};
}

function getCurrentUser() {
  return {email: Session.getActiveUser().getEmail(), isAdmin: isAdminUser(Session.getActiveUser().getEmail())};
}

// Helper to deploy from web UI using google.script.run
function ping() { return 'pong'; }
