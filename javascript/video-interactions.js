// =====================================
// VIDEO INTERACTIONS — YUNity Project
// =====================================
// Drop this script on any page that has video cards.
// It auto-wires Save / Like / Dislike buttons for every
// .video-card element that has a data-video-id attribute,
// and handles share buttons (X + Copy Link only).
//
// Required markup per video card:
//
//   <div class="video-card" data-video-id="unique-video-id">
//     <!-- your video embed / thumbnail here -->
//
//     <div class="video-interactions">
//       <button class="interaction-btn save-btn video-save-btn">
//         <span class="btn-icon">💾</span>
//         <span class="btn-text">Save</span>
//       </button>
//       <button class="interaction-btn like-btn video-like-btn">
//         <span class="btn-icon">👍</span>
//         <span class="btn-text">Like</span>
//       </button>
//       <button class="interaction-btn dislike-btn video-dislike-btn">
//         <span class="btn-icon">👎</span>
//         <span class="btn-text">Dislike</span>
//       </button>
//     </div>
//
//     <!-- Optional share row -->
//     <div class="social-share video-share">
//       <a href="#" class="share-btn" data-service="twitter">🐦 X</a>
//       <a href="#" class="share-btn" data-service="copy">🔗 Copy Link</a>
//     </div>
//   </div>
//
// Dependencies (must be loaded before this file):
//   admin-auth.js  — provides checkAuth(), getUserPreferences(),
//                    saveArticle(), unsaveArticle(), likeArticle(),
//                    dislikeArticle(), removeRating(), showNotification()
// =====================================

(function () {
    'use strict';

    // ------------------------------------------------------------------
    // HELPERS
    // ------------------------------------------------------------------

    /** Derive a stable storage key from a video-id string. */
    function videoKey(videoId) {
        return 'video::' + videoId;
    }

    /** Refresh the visual state of a single card's buttons. */
    function refreshCardState(card) {
        const videoId = card.dataset.videoId;
        if (!videoId) return;

        const key = videoKey(videoId);
        const prefs = (typeof getUserPreferences === 'function')
            ? getUserPreferences()
            : { savedArticles: [], likedArticles: [], dislikedArticles: [] };

        const saveBtn    = card.querySelector('.video-save-btn');
        const likeBtn    = card.querySelector('.video-like-btn');
        const dislikeBtn = card.querySelector('.video-dislike-btn');

        if (saveBtn) {
            const saved = prefs.savedArticles.includes(key);
            saveBtn.classList.toggle('active', saved);
            const txt = saveBtn.querySelector('.btn-text');
            if (txt) txt.textContent = saved ? 'Saved' : 'Save';
        }

        if (likeBtn && dislikeBtn) {
            const liked    = prefs.likedArticles.includes(key);
            const disliked = prefs.dislikedArticles.includes(key);
            likeBtn.classList.toggle('active', liked);
            dislikeBtn.classList.toggle('active', disliked);
        }
    }

    /** Prompt login if not authenticated; returns true when action should proceed. */
    function requireAuth(action) {
        if (typeof checkAuth !== 'function' || checkAuth().loggedIn) return true;
        const modal = document.getElementById('loginModal');
        if (modal) modal.style.display = 'block';
        else alert('Please log in to ' + action + '.');
        return false;
    }

    function notify(msg, type) {
        if (typeof showNotification === 'function') showNotification(msg, type);
    }

    // ------------------------------------------------------------------
    // BUTTON HANDLERS
    // ------------------------------------------------------------------

    async function handleSave(card) {
        if (!requireAuth('save videos')) return;
        const key = videoKey(card.dataset.videoId);
        const prefs = getUserPreferences();
        const isSaved = prefs.savedArticles.includes(key);
        try {
            const res = isSaved
                ? await unsaveArticle(key)
                : await saveArticle(key);
            if (res && res.success) {
                notify(isSaved ? 'Video removed from saved!' : 'Video saved!', 'success');
            } else {
                notify('Error updating save status. Please try again.', 'error');
            }
        } catch (err) {
            console.error('[video-interactions] save error:', err);
            notify('Error updating save status. Please try again.', 'error');
        } finally {
            refreshCardState(card);
        }
    }

    async function handleLike(card) {
        if (!requireAuth('like videos')) return;
        const key = videoKey(card.dataset.videoId);
        const prefs = getUserPreferences();
        const isLiked = prefs.likedArticles.includes(key);
        try {
            const res = isLiked
                ? await removeRating(key)
                : await likeArticle(key);
            if (res && res.success) {
                notify(isLiked ? 'Like removed!' : 'Video liked!', 'success');
            } else {
                notify('Error updating rating. Please try again.', 'error');
            }
        } catch (err) {
            console.error('[video-interactions] like error:', err);
            notify('Error updating rating. Please try again.', 'error');
        } finally {
            refreshCardState(card);
        }
    }

    async function handleDislike(card) {
        if (!requireAuth('dislike videos')) return;
        const key = videoKey(card.dataset.videoId);
        const prefs = getUserPreferences();
        const isDisliked = prefs.dislikedArticles.includes(key);
        try {
            const res = isDisliked
                ? await removeRating(key)
                : await dislikeArticle(key);
            if (res && res.success) {
                notify(isDisliked ? 'Dislike removed!' : 'Video disliked!', 'success');
            } else {
                notify('Error updating rating. Please try again.', 'error');
            }
        } catch (err) {
            console.error('[video-interactions] dislike error:', err);
            notify('Error updating rating. Please try again.', 'error');
        } finally {
            refreshCardState(card);
        }
    }

    // ------------------------------------------------------------------
    // SHARE BUTTONS (X + Copy Link only)
    // ------------------------------------------------------------------

    function wireShareButtons(card) {
        card.querySelectorAll('.share-btn').forEach(btn => {
            const svc = (btn.dataset.service || '').toLowerCase();

            if (svc === 'twitter' || svc === 'x') {
                if (btn.dataset.videoWired) return;
                btn.dataset.videoWired = '1';
                btn.addEventListener('click', e => {
                    e.preventDefault();
                    const url  = encodeURIComponent(window.location.href);
                    const text = encodeURIComponent('Check out this video from The YUNity Project: ');
                    window.open(
                        'https://twitter.com/intent/tweet?url=' + url + '&text=' + text,
                        '_blank', 'width=600,height=400'
                    );
                });
                return;
            }

            if (svc === 'copy' || svc === 'link') {
                if (btn.dataset.videoWired) return;
                btn.dataset.videoWired = '1';
                btn.addEventListener('click', e => {
                    e.preventDefault();
                    const url = window.location.href;
                    const doCopy = () => {
                        const ta = document.createElement('textarea');
                        ta.value = url;
                        ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
                        document.body.appendChild(ta);
                        ta.select();
                        try { document.execCommand('copy'); } catch (_) {}
                        document.body.removeChild(ta);
                        notify('✓ Link copied to clipboard!', 'success');
                    };
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(url)
                            .then(() => notify('✓ Link copied to clipboard!', 'success'))
                            .catch(doCopy);
                    } else {
                        doCopy();
                    }
                });
                return;
            }

            // Any other share service — remove to enforce policy
            btn.remove();
        });
    }

    // ------------------------------------------------------------------
    // KEYBOARD ACCESSIBILITY
    // ------------------------------------------------------------------

    function makeKeyboardAccessible(btn) {
        if (!btn || btn.dataset.keyWired) return;
        btn.dataset.keyWired = '1';
        btn.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    }

    // ------------------------------------------------------------------
    // WIRE A SINGLE CARD
    // ------------------------------------------------------------------

    function wireCard(card) {
        if (card.dataset.videoInteractionsWired) return;
        card.dataset.videoInteractionsWired = '1';

        const saveBtn    = card.querySelector('.video-save-btn');
        const likeBtn    = card.querySelector('.video-like-btn');
        const dislikeBtn = card.querySelector('.video-dislike-btn');

        if (saveBtn) {
            saveBtn.addEventListener('click', () => handleSave(card));
            makeKeyboardAccessible(saveBtn);
        }
        if (likeBtn) {
            likeBtn.addEventListener('click', () => handleLike(card));
            makeKeyboardAccessible(likeBtn);
        }
        if (dislikeBtn) {
            dislikeBtn.addEventListener('click', () => handleDislike(card));
            makeKeyboardAccessible(dislikeBtn);
        }

        wireShareButtons(card);
        refreshCardState(card);
    }

    // ------------------------------------------------------------------
    // INIT — wire all current cards + observe future ones
    // ------------------------------------------------------------------

    function init() {
        document.querySelectorAll('.video-card[data-video-id]').forEach(wireCard);

        // Support dynamically added cards (e.g. infinite scroll)
        if (window.MutationObserver) {
            const observer = new MutationObserver(mutations => {
                mutations.forEach(m => {
                    m.addedNodes.forEach(node => {
                        if (!(node instanceof Element)) return;
                        if (node.matches('.video-card[data-video-id]')) {
                            wireCard(node);
                        }
                        node.querySelectorAll && node.querySelectorAll('.video-card[data-video-id]').forEach(wireCard);
                    });
                });
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
