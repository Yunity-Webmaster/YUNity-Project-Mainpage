// Admin Authentication System

const ADMIN_USERS = [
    { username: 'hjyun', password: 'yunity2025' },
    { username: 'admin', password: 'veritas' }
];

// Check if user is logged in
function checkAuth() {
    const user = sessionStorage.getItem('admin_logged_in');
    return user === 'true';
}

// Update UI based on login status
function updateLoginUI() {
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminPageLink = document.getElementById('adminPageLink');
    
    if (checkAuth()) {
        // User is logged in - show Admin page link, hide login button
        if (adminLoginBtn) adminLoginBtn.style.display = 'none';
        if (adminPageLink) adminPageLink.style.display = 'block';
    } else {
        // User is logged out - show login button, hide Admin page link
        if (adminLoginBtn) adminLoginBtn.style.display = 'block';
        if (adminPageLink) adminPageLink.style.display = 'none';
    }
}

// Handle admin login button click
const adminLoginBtn = document.getElementById('adminLoginBtn');
if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('loginModal').style.display = 'block';
    });
}

// Close modal
const loginClose = document.querySelector('.login-close');
if (loginClose) {
    loginClose.addEventListener('click', function() {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('loginError').textContent = '';
    });
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target === modal) {
        modal.style.display = 'none';
        document.getElementById('loginError').textContent = '';
    }
});

// Handle login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const user = ADMIN_USERS.find(u => u.username === username && u.password === password);
        
        if (user) {
            sessionStorage.setItem('admin_logged_in', 'true');
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('loginError').textContent = '';
            
            // Update UI to show admin link
            updateLoginUI();
            
            // Redirect to admin page
            window.location.href = 'admin.html';
        } else {
            document.getElementById('loginError').textContent = 'Invalid username or password';
            // Clear error after 3 seconds
            setTimeout(() => {
                document.getElementById('loginError').textContent = '';
            }, 3000);
        }
    });
}

// Handle logout button click (for admin.html page)
const logoutLink = document.getElementById('logoutLink');
if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Clear session
        sessionStorage.removeItem('admin_logged_in');
        
        // Update UI
        updateLoginUI();
        
        // Show notification
        showNotification('Logged out successfully!');
        
        // Redirect to home
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

// Check if user is on admin page and not logged in
if (window.location.pathname.includes('admin.html')) {
    if (sessionStorage.getItem('admin_logged_in') !== 'true') {
        window.location.href = 'index.html';
    }
}

// Update UI on page load
updateLoginUI();