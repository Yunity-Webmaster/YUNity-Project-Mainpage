// Admin Authentication System

// Simple hash function for password encryption
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Store hashed passwords instead of plain text
// To generate a new hash, use: hashPassword('yourpassword').then(hash => console.log(hash))
const ADMIN_USERS = [
    { 
        username: 'PrezYun', 
        passwordHash: 'ad27f483bc7bdae6c8fd368c13b936be91074850ea3c45a80e44f5d1872fa41c'
    },
    {
        username: "beneppo",
        passwordHash: '7e88906961a1fd87f393c8b4eb92177649173895642367d675ae193cb46a8212'
    },
];

// Note: To create new password hashes, uncomment and run this in console:
// hashPassword('yournewpassword').then(hash => console.log(hash));

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
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Hash the entered password
        const enteredPasswordHash = await hashPassword(password);
        
        // Find user with matching username and password hash
        const user = ADMIN_USERS.find(u => 
            u.username === username && u.passwordHash === enteredPasswordHash
        );
        
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