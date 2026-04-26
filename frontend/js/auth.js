// Utility functions
function showMessage(message, type = 'error') {
    const msgDiv = document.getElementById('message');
    if (msgDiv) {
        msgDiv.textContent = message;
        msgDiv.className = type;
        setTimeout(() => {
            msgDiv.style.display = 'none';
        }, 5000);
    }
}

function saveToken(token) {
    localStorage.setItem('token', token);
}

function getToken() {
    return localStorage.getItem('token');
}

function removeToken() {
    localStorage.removeItem('token');
}

function isLoggedIn() {
    return !!getToken();
}

function redirect(url) {
    window.location.href = url;
}

// Check auth status on page load
function checkAuth() {
    const publicPages = ['index.html', 'register.html', '/'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (!isLoggedIn() && !publicPages.includes(currentPage)) {
        redirect('index.html');
    }
    
    if (isLoggedIn() && (currentPage === 'index.html' || currentPage === 'register.html')) {
        redirect('dashboard.html');
    }
}

// Login form handler
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const data = await api.login({ email, password });
                saveToken(data.data.token);
                showMessage('Login successful! Redirecting...', 'success');
                setTimeout(() => redirect('dashboard.html'), 1000);
            } catch (error) {
                showMessage(error.message || 'Login failed', 'error');
            }
        });
    }
    
    // Register form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userData = {
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                full_name: document.getElementById('fullName').value
            };
            
            try {
                const data = await api.register(userData);
                saveToken(data.data.token);
                showMessage('Registration successful! Redirecting...', 'success');
                setTimeout(() => redirect('dashboard.html'), 1000);
            } catch (error) {
                showMessage(error.message || 'Registration failed', 'error');
            }
        });
    }
    
    // Dashboard profile load
    const dashboardPage = document.querySelector('.dashboard-box');
    if (dashboardPage) {
        loadDashboard();
    }
    
    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            removeToken();
            redirect('index.html');
        });
    }

    // Edit Profile toggle
    const toggleEditProfile = document.getElementById('toggleEditProfile');
    const editProfileSection = document.getElementById('editProfileSection');
    const cancelEditProfile = document.getElementById('cancelEditProfile');

    if (toggleEditProfile && editProfileSection) {
        toggleEditProfile.addEventListener('click', () => {
            editProfileSection.style.display = editProfileSection.style.display === 'none' ? 'block' : 'none';
            if (changePasswordSection) changePasswordSection.style.display = 'none';
        });
    }

    if (cancelEditProfile && editProfileSection) {
        cancelEditProfile.addEventListener('click', () => {
            editProfileSection.style.display = 'none';
        });
    }

    // Change Password toggle
    const toggleChangePassword = document.getElementById('toggleChangePassword');
    const changePasswordSection = document.getElementById('changePasswordSection');
    const cancelChangePassword = document.getElementById('cancelChangePassword');

    if (toggleChangePassword && changePasswordSection) {
        toggleChangePassword.addEventListener('click', () => {
            changePasswordSection.style.display = changePasswordSection.style.display === 'none' ? 'block' : 'none';
            if (editProfileSection) editProfileSection.style.display = 'none';
        });
    }

    if (cancelChangePassword && changePasswordSection) {
        cancelChangePassword.addEventListener('click', () => {
            changePasswordSection.style.display = 'none';
        });
    }

    // Edit Profile form handler
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('editUsername').value;
            const fullName = document.getElementById('editFullName').value;

            try {
                const data = await api.updateProfile({ username, full_name: fullName });
                showMessage('Profile updated successfully!', 'success');
                if (editProfileSection) editProfileSection.style.display = 'none';
                loadDashboard();
            } catch (error) {
                showMessage(error.message || 'Failed to update profile', 'error');
            }
        });
    }

    // Change Password form handler
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (newPassword !== confirmPassword) {
                showMessage('New passwords do not match', 'error');
                return;
            }

            try {
                const data = await api.changePassword({ current_password: currentPassword, new_password: newPassword });
                showMessage('Password changed successfully!', 'success');
                changePasswordForm.reset();
                if (changePasswordSection) changePasswordSection.style.display = 'none';
            } catch (error) {
                showMessage(error.message || 'Failed to change password', 'error');
            }
        });
    }
});

async function loadDashboard() {
    try {
        const data = await api.getProfile();
        const user = data.data.user;
        
        document.getElementById('userName').textContent = user.username;
        document.getElementById('profileUsername').textContent = user.username;
        document.getElementById('profileEmail').textContent = user.email;
        document.getElementById('profileFullName').textContent = user.full_name || 'Not set';
        document.getElementById('profileCreated').textContent = new Date(user.created_at).toLocaleDateString();

        // Pre-populate edit form fields
        const editUsername = document.getElementById('editUsername');
        const editFullName = document.getElementById('editFullName');
        if (editUsername) editUsername.value = user.username;
        if (editFullName) editFullName.value = user.full_name || '';
    } catch (error) {
        console.error('Failed to load profile:', error);
        removeToken();
        redirect('index.html');
    }
}

