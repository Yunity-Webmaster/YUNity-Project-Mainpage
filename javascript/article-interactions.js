// article-interactions.js
// Shared save / like / dislike logic for all article pages.
// Requires: admin-auth.js (for checkAuth, getUserPreferences, saveArticle, etc.)
// Usage: set window.CURRENT_ARTICLE_URL = 'MyArticle.html' before this script runs,
//        OR add data-article-url="MyArticle.html" to the .article-interactions div.

(function () {
  function getArticleUrl() {
    if (window.CURRENT_ARTICLE_URL) return window.CURRENT_ARTICLE_URL;
    const el = document.querySelector('.article-interactions[data-article-url]');
    return el ? el.dataset.articleUrl : null;
  }

  function updateButtonStates(articleUrl) {
    if (!checkAuth().loggedIn) return;
    const prefs = getUserPreferences();
    const saveBtn    = document.getElementById('saveBtn');
    const likeBtn    = document.getElementById('likeBtn');
    const dislikeBtn = document.getElementById('dislikeBtn');
    if (!saveBtn || !likeBtn || !dislikeBtn) return;

    const saved    = prefs.savedArticles.includes(articleUrl);
    const liked    = prefs.likedArticles.includes(articleUrl);
    const disliked = prefs.dislikedArticles.includes(articleUrl);

    saveBtn.classList.toggle('active', saved);
    saveBtn.querySelector('.btn-text').textContent = saved ? 'Saved' : 'Save';

    likeBtn.classList.toggle('active', liked);
    dislikeBtn.classList.toggle('active', disliked);
  }

  async function toggleSave(articleUrl) {
    if (!checkAuth().loggedIn) { alert('Please log in to save articles.'); return; }
    const saveBtn = document.getElementById('saveBtn');
    const isSaved = getUserPreferences().savedArticles.includes(articleUrl);
    try {
      const result = isSaved ? await unsaveArticle(articleUrl) : await saveArticle(articleUrl);
      if (result.success) {
        saveBtn.classList.toggle('active', !isSaved);
        saveBtn.querySelector('.btn-text').textContent = isSaved ? 'Save' : 'Saved';
        showNotification(isSaved ? 'Article removed from saved!' : 'Article saved!');
      }
    } catch { showNotification('Error updating save status. Please try again.'); }
  }

  async function toggleLike(articleUrl) {
    if (!checkAuth().loggedIn) { alert('Please log in to like articles.'); return; }
    const likeBtn    = document.getElementById('likeBtn');
    const dislikeBtn = document.getElementById('dislikeBtn');
    const isLiked    = getUserPreferences().likedArticles.includes(articleUrl);
    try {
      const result = isLiked ? await removeRating(articleUrl) : await likeArticle(articleUrl);
      if (result.success) {
        likeBtn.classList.toggle('active', !isLiked);
        if (!isLiked) dislikeBtn.classList.remove('active');
        showNotification(isLiked ? 'Like removed!' : 'Article liked!');
      }
    } catch { showNotification('Error updating rating. Please try again.'); }
  }

  async function toggleDislike(articleUrl) {
    if (!checkAuth().loggedIn) { alert('Please log in to dislike articles.'); return; }
    const likeBtn      = document.getElementById('likeBtn');
    const dislikeBtn   = document.getElementById('dislikeBtn');
    const isDisliked   = getUserPreferences().dislikedArticles.includes(articleUrl);
    try {
      const result = isDisliked ? await removeRating(articleUrl) : await dislikeArticle(articleUrl);
      if (result.success) {
        dislikeBtn.classList.toggle('active', !isDisliked);
        if (!isDisliked) likeBtn.classList.remove('active');
        showNotification(isDisliked ? 'Dislike removed!' : 'Article disliked!');
      }
    } catch { showNotification('Error updating rating. Please try again.'); }
  }

  function init() {
    const articleUrl = getArticleUrl();
    if (!articleUrl) return;

    const saveBtn    = document.getElementById('saveBtn');
    const likeBtn    = document.getElementById('likeBtn');
    const dislikeBtn = document.getElementById('dislikeBtn');
    if (!saveBtn || !likeBtn || !dislikeBtn) return;

    updateButtonStates(articleUrl);
    saveBtn.addEventListener('click',    () => toggleSave(articleUrl));
    likeBtn.addEventListener('click',    () => toggleLike(articleUrl));
    dislikeBtn.addEventListener('click', () => toggleDislike(articleUrl));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
