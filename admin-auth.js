// Admin Authentication System with Google Sheets Integration

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxyM46NaqhqCsofKa9bCl5_MmftsmSyGrM11CZoWpoGxcBDkbFMaqTkhNNu-KhtYZTp/exec'; // Replace with your deployed web app URL

// Generate a random salt for password hashing
function generateSalt() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Hash password with salt using SHA-256
async function hashPassword(password, salt) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Register a new user via Google Sheets
async function registerUser(email, password, role = 'user') {
    try {
        const salt = generateSalt();
        const hash = await hashPassword(password, salt);

        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'register',
                email: email,
                salt: salt,
                hash: hash,
                role: role
            })
        });

        const result = await response.json();
        return result;
    } catch (error) {
        return { success: false, message: 'Network error' };
    }
}

// Login user via Google Sheets
async function loginUser(email, password) {
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'login',
                email: email,
                password: password
            })
        });

        const result = await response.json();
        if (result.success) {
            // Store user preferences in sessionStorage
            sessionStorage.setItem('user_saved_articles', result.savedArticles || '');
            sessionStorage.setItem('user_liked_articles', result.likedArticles || '');
            sessionStorage.setItem('user_disliked_articles', result.dislikedArticles || '');
        }
        return result;
    } catch (error) {
        return { success: false, message: 'Network error' };
    }
}

// Save article for user
async function saveArticle(articleUrl) {
    const email = sessionStorage.getItem('user_email');
    if (!email) return { success: false, message: 'Not logged in' };

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'saveArticle',
                email: email,
                articleUrl: articleUrl
            })
        });

        const result = await response.json();
        if (result.success) {
            // Update local session storage
            const saved = sessionStorage.getItem('user_saved_articles') || '';
            const savedArticles = saved ? saved.split(',') : [];
            if (!savedArticles.includes(articleUrl)) {
                savedArticles.push(articleUrl);
                sessionStorage.setItem('user_saved_articles', savedArticles.join(','));
            }
        }
        return result;
    } catch (error) {
        return { success: false, message: 'Network error' };
    }
}

// Unsave article for user
async function unsaveArticle(articleUrl) {
    const email = sessionStorage.getItem('user_email');
    if (!email) return { success: false, message: 'Not logged in' };

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'unsaveArticle',
                email: email,
                articleUrl: articleUrl
            })
        });

        const result = await response.json();
        if (result.success) {
            // Update local session storage
            const saved = sessionStorage.getItem('user_saved_articles') || '';
            const savedArticles = saved ? saved.split(',') : [];
            const filteredArticles = savedArticles.filter(url => url !== articleUrl);
            sessionStorage.setItem('user_saved_articles', filteredArticles.join(','));
        }
        return result;
    } catch (error) {
        return { success: false, message: 'Network error' };
    }
}

// Like article
async function likeArticle(articleUrl) {
    const email = sessionStorage.getItem('user_email');
    if (!email) return { success: false, message: 'Not logged in' };

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'likeArticle',
                email: email,
                articleUrl: articleUrl
            })
        });

        const result = await response.json();
        if (result.success) {
            // Update local session storage
            const liked = sessionStorage.getItem('user_liked_articles') || '';
            const disliked = sessionStorage.getItem('user_disliked_articles') || '';

            const likedArticles = liked ? liked.split(',') : [];
            const dislikedArticles = disliked ? disliked.split(',') : [];

            // Remove from disliked
            const filteredDisliked = dislikedArticles.filter(url => url !== articleUrl);
            // Add to liked
            if (!likedArticles.includes(articleUrl)) {
                likedArticles.push(articleUrl);
            }

            sessionStorage.setItem('user_liked_articles', likedArticles.join(','));
            sessionStorage.setItem('user_disliked_articles', filteredDisliked.join(','));
        }
        return result;
    } catch (error) {
        return { success: false, message: 'Network error' };
    }
}

// Dislike article
async function dislikeArticle(articleUrl) {
    const email = sessionStorage.getItem('user_email');
    if (!email) return { success: false, message: 'Not logged in' };

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'dislikeArticle',
                email: email,
                articleUrl: articleUrl
            })
        });

        const result = await response.json();
        if (result.success) {
            // Update local session storage
            const liked = sessionStorage.getItem('user_liked_articles') || '';
            const disliked = sessionStorage.getItem('user_disliked_articles') || '';

            const likedArticles = liked ? liked.split(',') : [];
            const dislikedArticles = disliked ? disliked.split(',') : [];

            // Remove from liked
            const filteredLiked = likedArticles.filter(url => url !== articleUrl);
            // Add to disliked
            if (!dislikedArticles.includes(articleUrl)) {
                dislikedArticles.push(articleUrl);
            }

            sessionStorage.setItem('user_liked_articles', filteredLiked.join(','));
            sessionStorage.setItem('user_disliked_articles', dislikedArticles.join(','));
        }
        return result;
    } catch (error) {
        return { success: false, message: 'Network error' };
    }
}

// Remove rating from article
async function removeRating(articleUrl) {
    const email = sessionStorage.getItem('user_email');
    if (!email) return { success: false, message: 'Not logged in' };

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'removeRating',
                email: email,
                articleUrl: articleUrl
            })
        });

        const result = await response.json();
        if (result.success) {
            // Update local session storage
            const liked = sessionStorage.getItem('user_liked_articles') || '';
            const disliked = sessionStorage.getItem('user_disliked_articles') || '';

            const likedArticles = liked ? liked.split(',') : [];
            const dislikedArticles = disliked ? disliked.split(',') : [];

            // Remove from both
            const filteredLiked = likedArticles.filter(url => url !== articleUrl);
            const filteredDisliked = dislikedArticles.filter(url => url !== articleUrl);

            sessionStorage.setItem('user_liked_articles', filteredLiked.join(','));
            sessionStorage.setItem('user_disliked_articles', filteredDisliked.join(','));
        }
        return result;
    } catch (error) {
        return { success: false, message: 'Network error' };
    }
}

// Get user article preferences
function getUserPreferences() {
    return {
        savedArticles: (sessionStorage.getItem('user_saved_articles') || '').split(',').filter(url => url),
        likedArticles: (sessionStorage.getItem('user_liked_articles') || '').split(',').filter(url => url),
        dislikedArticles: (sessionStorage.getItem('user_disliked_articles') || '').split(',').filter(url => url)
    };
}

// Check if user is logged in and get user role
function checkAuth() {
    const user = sessionStorage.getItem('user_logged_in');
    const role = sessionStorage.getItem('user_role');
    return { loggedIn: user === 'true', role: role || 'user' };
}

// Update UI based on login status and user role
function updateLoginUI() {
    const auth = checkAuth();
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminPageLink = document.getElementById('adminPageLink');
    const profileLink = document.getElementById('profileLink');

    if (auth.loggedIn) {
        // User is logged in
        if (adminLoginBtn) adminLoginBtn.style.display = 'none';

        if (auth.role === 'admin') {
            // Show admin link, hide profile link
            if (adminPageLink) adminPageLink.style.display = 'block';
            if (profileLink) profileLink.style.display = 'none';
        } else {
            // Show profile link, hide admin link
            if (adminPageLink) adminPageLink.style.display = 'none';
            if (profileLink) profileLink.style.display = 'block';
        }
    } else {
        // User is logged out
        if (adminLoginBtn) adminLoginBtn.style.display = 'block';
        if (adminPageLink) adminPageLink.style.display = 'none';
        if (profileLink) profileLink.style.display = 'none';
    }
}

// Auth mode: 'login' or 'register'
let authMode = 'login';

// Update modal UI based on auth mode
function updateModalUI() {
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('submitBtn');
    const confirmPassword = document.getElementById('confirmPassword');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');

    if (authMode === 'login') {
        modalTitle.textContent = 'Admin Login';
        submitBtn.textContent = 'Login';
        if (confirmPassword) {
            confirmPassword.style.display = 'none';
            confirmPassword.required = false;
        }
        if (loginTab) loginTab.classList.add('active');
        if (registerTab) registerTab.classList.remove('active');
    } else {
        modalTitle.textContent = 'Create Account';
        submitBtn.textContent = 'Create Account';
        if (confirmPassword) {
            confirmPassword.style.display = 'block';
            confirmPassword.required = true;
        }
        if (loginTab) loginTab.classList.remove('active');
        if (registerTab) registerTab.classList.add('active');
    }
}

// Handle admin login button click
const adminLoginBtn = document.getElementById('adminLoginBtn');
if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        authMode = 'login';
        updateModalUI();
        const modal = document.getElementById('loginModal');
        if (modal) modal.style.display = 'block';
    });
}

// Handle tab switches
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');

if (loginTab) {
    loginTab.addEventListener('click', function() {
        authMode = 'login';
        updateModalUI();
        const errorElement = document.getElementById('loginError');
        if (errorElement) errorElement.textContent = '';
    });
}

if (registerTab) {
    registerTab.addEventListener('click', function() {
        authMode = 'register';
        updateModalUI();
        const errorElement = document.getElementById('loginError');
        if (errorElement) errorElement.textContent = '';
    });
}

// Close modal
const loginClose = document.querySelector('.login-close');
if (loginClose) {
    loginClose.addEventListener('click', function() {
        const modal = document.getElementById('loginModal');
        if (modal) modal.style.display = 'none';
        const errorElement = document.getElementById('loginError');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.color = '#ff6b6b';
        }
        const form = document.getElementById('loginForm');
        if (form) form.reset();
        authMode = 'login';
        updateModalUI();
    });
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target === modal) {
        modal.style.display = 'none';
        const errorElement = document.getElementById('loginError');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.color = '#ff6b6b';
        }
        const form = document.getElementById('loginForm');
        if (form) form.reset();
        authMode = 'login';
        updateModalUI();
    }
});

// Handle login/register form submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('username').value; // Note: keeping 'username' ID but treating as email
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('loginError');

        if (authMode === 'login') {
            // Login logic
            const result = await loginUser(email, password);

            if (result.success) {
                sessionStorage.setItem('user_logged_in', 'true');
                sessionStorage.setItem('user_role', result.role || 'user');
                sessionStorage.setItem('user_email', email); // Store email for article operations
                const modal = document.getElementById('loginModal');
                if (modal) modal.style.display = 'none';
                if (errorElement) errorElement.textContent = '';
                updateLoginUI();

                // Redirect based on user role
                if (result.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'profile.html';
                }
            } else {
                if (errorElement) {
                    errorElement.textContent = result.message || 'Login failed';
                    setTimeout(() => {
                        errorElement.textContent = '';
                    }, 3000);
                }
            }
        } else {
            // Registration logic
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                if (errorElement) {
                    errorElement.textContent = 'Passwords do not match';
                    setTimeout(() => {
                        errorElement.textContent = '';
                    }, 3000);
                }
                return;
            }

            const result = await registerUser(email, password);

            if (result.success) {
                if (errorElement) {
                    errorElement.textContent = 'Account created successfully! You can now login.';
                    errorElement.style.color = '#4CAF50';
                }
                setTimeout(() => {
                    authMode = 'login';
                    updateModalUI();
                    if (errorElement) {
                        errorElement.textContent = '';
                        errorElement.style.color = '#ff6b6b';
                    }
                }, 3000);
            } else {
                if (errorElement) {
                    errorElement.textContent = result.message || 'Registration failed';
                    setTimeout(() => {
                        errorElement.textContent = '';
                    }, 3000);
                }
            }
        }
    });
}

// Handle logout button click (for admin.html and profile.html pages)
const logoutLink = document.getElementById('logoutLink');
if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        sessionStorage.removeItem('user_logged_in');
        sessionStorage.removeItem('user_role');
        sessionStorage.removeItem('user_email');
        sessionStorage.removeItem('user_saved_articles');
        sessionStorage.removeItem('user_liked_articles');
        sessionStorage.removeItem('user_disliked_articles');
        updateLoginUI();
        showNotification('Logged out successfully!');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    });
}

// Show notification function
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Check if user is on admin page and not logged in as admin
if (window.location.pathname.includes('admin.html')) {
    const auth = checkAuth();
    if (!auth.loggedIn || auth.role !== 'admin') {
        window.location.href = 'index.html';
    }
}

// Check if user is on profile page and not logged in
if (window.location.pathname.includes('profile.html')) {
    const auth = checkAuth();
    if (!auth.loggedIn) {
        window.location.href = 'index.html';
    }
}

// Update UI on page load
updateLoginUI();