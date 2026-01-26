// Admin Authentication System with Google Sheets Integration

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxMoXo56CQB8G0KkuLTonshOreyeSW8EexXzryNHT3JzLtsEg4jwjDV5R01KAc06WJ1/exec'; // Replace with your deployed web app URL

// Check if Apps Script URL is configured
function isAppsScriptConfigured() {
    return APPS_SCRIPT_URL && APPS_SCRIPT_URL !== 'https://script.google.com/macros/s/AKfycbxMoXo56CQB8G0KkuLTonshOreyeSW8EexXzryNHT3JzLtsEg4jwjDV5R01KAc06WJ1/exec' && APPS_SCRIPT_URL !== 'https://script.google.com/macros/s/AKfycbxMoXo56CQB8G0KkuLTonshOreyeSW8EexXzryNHT3JzLtsEg4jwjDV5R01KAc06WJ1/exec';
}

// JSONP fallback for when fetch fails due to CSP restrictions
function jsonpRequest(action, data) {
    return new Promise((resolve, reject) => {
        const callbackName = 'jsonp_callback_' + Math.random().toString(36).substr(2, 9);

        // Create the URL with query parameters
        const params = new URLSearchParams();
        params.append('action', action);
        params.append('callback', callbackName);

        // Add data parameters
        Object.keys(data).forEach(key => {
            params.append(key, data[key]);
        });

        const url = `${APPS_SCRIPT_URL}?${params.toString()}`;

        // Create script element
        const script = document.createElement('script');
        script.src = url;
        script.async = true;

        // Set up callback function
        window[callbackName] = function(response) {
            // Clean up
            delete window[callbackName];
            document.head.removeChild(script);

            resolve(response);
        };

        // Handle errors
        script.onerror = function() {
            delete window[callbackName];
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
            reject(new Error('JSONP request failed'));
        };

        // Add timeout
        setTimeout(() => {
            if (window[callbackName]) {
                delete window[callbackName];
                if (document.head.contains(script)) {
                    document.head.removeChild(script);
                }
                reject(new Error('JSONP request timeout'));
            }
        }, 10000); // 10 second timeout

        // Add script to document
        document.head.appendChild(script);
    });
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
    if (!isAppsScriptConfigured()) {
        return {
            success: false,
            message: 'Google Apps Script not configured. Please contact administrator.'
        };
    }

    try {
        const salt = generateSalt();
        const hash = await hashPassword(password, salt);

        console.log('Attempting to register user:', email);

        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            cache: 'no-cache',
            credentials: 'omit',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; YungPolitics/1.0)',
            },
            body: JSON.stringify({
                action: 'register',
                email: email,
                salt: salt,
                hash: hash,
                role: role
            })
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Registration result:', result);
        return result;
    } catch (fetchError) {
        console.log('Fetch failed, trying JSONP fallback:', fetchError.message);

        // Fallback to JSONP
        try {
            const salt = generateSalt();
            const hash = await hashPassword(password, salt);

            return await jsonpRequest('register', {
                email: email,
                salt: salt,
                hash: hash,
                role: role
            });
        } catch (jsonpError) {
            console.error('JSONP fallback also failed:', jsonpError.message);
            throw fetchError; // Re-throw original error
        }
    }
}

// Login user via Google Sheets
async function loginUser(email, password) {
    if (!isAppsScriptConfigured()) {
        return {
            success: false,
            message: 'Google Apps Script not configured. Please contact administrator.'
        };
    }

    try {
        console.log('Attempting to login user:', email);

        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            cache: 'no-cache',
            credentials: 'omit',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; YungPolitics/1.0)',
            },
            body: JSON.stringify({
                action: 'login',
                email: email,
                password: password
            })
        });

        console.log('Login response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Login result:', result);

        if (result.success) {
            // Store user preferences in sessionStorage
            sessionStorage.setItem('user_saved_articles', result.savedArticles || '');
            sessionStorage.setItem('user_liked_articles', result.likedArticles || '');
            sessionStorage.setItem('user_disliked_articles', result.dislikedArticles || '');
        }
        return result;
    } catch (fetchError) {
        console.log('Fetch failed, trying JSONP fallback:', fetchError.message);

        // Fallback to JSONP
        try {
            return await jsonpRequest('login', {
                email: email,
                password: password
            });
        } catch (jsonpError) {
            console.error('JSONP fallback also failed:', jsonpError.message);
            throw fetchError; // Re-throw original error
        }
    }
}

// Save article for user
async function saveArticle(articleUrl) {
    const email = sessionStorage.getItem('user_email');
    if (!email) return { success: false, message: 'Not logged in' };

    if (!isAppsScriptConfigured()) {
        return {
            success: false,
            message: 'Google Apps Script not configured. Please contact administrator.'
        };
    }

    try {
        console.log('Attempting to save article:', articleUrl);

        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            cache: 'no-cache',
            credentials: 'omit',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; YungPolitics/1.0)',
            },
            body: JSON.stringify({
                action: 'saveArticle',
                email: email,
                articleUrl: articleUrl
            })
        });

        console.log('Save article response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Save article result:', result);

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
        console.error('Save article error:', error);
        return {
            success: false,
            message: `Network error: ${error.message}. Please check your internet connection and try again.`
        };
    }
}

// Unsave article for user
async function unsaveArticle(articleUrl) {
    const email = sessionStorage.getItem('user_email');
    if (!email) return { success: false, message: 'Not logged in' };

    if (!isAppsScriptConfigured()) {
        return {
            success: false,
            message: 'Google Apps Script not configured. Please contact administrator.'
        };
    }

    try {
        console.log('Attempting to unsave article:', articleUrl);

        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            cache: 'no-cache',
            credentials: 'omit',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; YungPolitics/1.0)',
            },
            body: JSON.stringify({
                action: 'unsaveArticle',
                email: email,
                articleUrl: articleUrl
            })
        });

        console.log('Unsave article response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Unsave article result:', result);

        if (result.success) {
            // Update local session storage
            const saved = sessionStorage.getItem('user_saved_articles') || '';
            const savedArticles = saved ? saved.split(',') : [];
            const filteredArticles = savedArticles.filter(url => url !== articleUrl);
            sessionStorage.setItem('user_saved_articles', filteredArticles.join(','));
        }
        return result;
    } catch (error) {
        console.error('Unsave article error:', error);
        return {
            success: false,
            message: `Network error: ${error.message}. Please check your internet connection and try again.`
        };
    }
}

// Like article
async function likeArticle(articleUrl) {
    const email = sessionStorage.getItem('user_email');
    if (!email) return { success: false, message: 'Not logged in' };

    if (!isAppsScriptConfigured()) {
        return {
            success: false,
            message: 'Google Apps Script not configured. Please contact administrator.'
        };
    }

    try {
        console.log('Attempting to like article:', articleUrl);

        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            cache: 'no-cache',
            credentials: 'omit',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; YungPolitics/1.0)',
            },
            body: JSON.stringify({
                action: 'likeArticle',
                email: email,
                articleUrl: articleUrl
            })
        });

        console.log('Like article response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Like article result:', result);

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
        console.error('Like article error:', error);
        return {
            success: false,
            message: `Network error: ${error.message}. Please check your internet connection and try again.`
        };
    }
}

// Dislike article
async function dislikeArticle(articleUrl) {
    const email = sessionStorage.getItem('user_email');
    if (!email) return { success: false, message: 'Not logged in' };

    if (!isAppsScriptConfigured()) {
        return {
            success: false,
            message: 'Google Apps Script not configured. Please contact administrator.'
        };
    }

    try {
        console.log('Attempting to dislike article:', articleUrl);

        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            cache: 'no-cache',
            credentials: 'omit',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; YungPolitics/1.0)',
            },
            body: JSON.stringify({
                action: 'dislikeArticle',
                email: email,
                articleUrl: articleUrl
            })
        });

        console.log('Dislike article response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Dislike article result:', result);

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
        console.error('Dislike article error:', error);
        return {
            success: false,
            message: `Network error: ${error.message}. Please check your internet connection and try again.`
        };
    }
}

// Remove rating from article
async function removeRating(articleUrl) {
    const email = sessionStorage.getItem('user_email');
    if (!email) return { success: false, message: 'Not logged in' };

    if (!isAppsScriptConfigured()) {
        return {
            success: false,
            message: 'Google Apps Script not configured. Please contact administrator.'
        };
    }

    try {
        console.log('Attempting to remove rating from article:', articleUrl);

        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            cache: 'no-cache',
            credentials: 'omit',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; YungPolitics/1.0)',
            },
            body: JSON.stringify({
                action: 'removeRating',
                email: email,
                articleUrl: articleUrl
            })
        });

        console.log('Remove rating response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Remove rating result:', result);

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
        console.error('Remove rating error:', error);
        return {
            success: false,
            message: `Network error: ${error.message}. Please check your internet connection and try again.`
        };
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