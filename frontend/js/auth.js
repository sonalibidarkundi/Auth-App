// Toast Notification System
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
        ${message}
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4500);
}

// Set button loading state
function setButtonLoading(btn, loading) {
    if (loading) {
        btn.dataset.originalText = btn.textContent;
        btn.innerHTML = '<span class="spinner"></span> Processing...';
        btn.disabled = true;
    } else {
        btn.textContent = btn.dataset.originalText || 'Submit';
        btn.disabled = false;
    }
}

// Auth Guard - Redirect if not authenticated
function checkAuth() {
    const token = localStorage.getItem('token');
    const isAuthPage = window.location.pathname === '/' || window.location.pathname === '/register.html';

    if (!token && !isAuthPage) {
        window.location.href = '/';
    } else if (token && isAuthPage) {
        window.location.href = '/dashboard.html';
    }
}

// Login Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('loginBtn');
        setButtonLoading(btn, true);

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const result = await apiRequest(API_URLS.login, {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (result.data.success) {
                localStorage.setItem('token', result.data.data.token);
                showToast('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1000);
            } else {
                showToast(result.data.message || 'Login failed', 'error');
            }
        } catch (error) {
            showToast('Network error. Please try again.', 'error');
        } finally {
            setButtonLoading(btn, false);
        }
    });
}

// Register Handler
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('registerBtn');
        setButtonLoading(btn, true);

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const full_name = document.getElementById('full_name').value;

        try {
            const result = await apiRequest(API_URLS.register, {
                method: 'POST',
                body: JSON.stringify({ username, email, password, full_name })
            });

            if (result.data.success) {
                localStorage.setItem('token', result.data.data.token);
                showToast('Account created! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1000);
            } else {
                showToast(result.data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            showToast('Network error. Please try again.', 'error');
        } finally {
            setButtonLoading(btn, false);
        }
    });
}

// Load Profile
async function loadProfile() {
    try {
        const result = await apiRequest(API_URLS.me, { method: 'GET' });

        if (result.data.success) {
            const user = result.data.data.user;

            document.getElementById('usernameDisplay').textContent = user.username;
            document.getElementById('welcomeName').textContent = 'Welcome, ' + (user.full_name || user.username);
            document.getElementById('profileEmail').textContent = user.email;

            document.getElementById('updateUsername').value = user.username;
            document.getElementById('updateFullName').value = user.full_name || '';
        }
    } catch (error) {
        showToast('Failed to load profile', 'error');
    }
}

// Update Profile Handler
const updateProfileForm = document.getElementById('updateProfileForm');
if (updateProfileForm) {
    updateProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        setButtonLoading(btn, true);

        const username = document.getElementById('updateUsername').value;
        const full_name = document.getElementById('updateFullName').value;

        try {
            const result = await apiRequest(API_URLS.profile, {
                method: 'PUT',
                body: JSON.stringify({ username, full_name })
            });

            if (result.data.success) {
                showToast('Profile updated successfully!', 'success');
                loadProfile();
            } else {
                showToast(result.data.message || 'Update failed', 'error');
            }
        } catch (error) {
            showToast('Network error. Please try again.', 'error');
        } finally {
            setButtonLoading(btn, false);
        }
    });
}

// Change Password Handler
const changePasswordForm = document.getElementById('changePasswordForm');
if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        setButtonLoading(btn, true);

        const current_password = document.getElementById('currentPassword').value;
        const new_password = document.getElementById('newPassword').value;

        try {
            const result = await apiRequest(API_URLS.changePassword, {
                method: 'PUT',
                body: JSON.stringify({ current_password, new_password })
            });

            if (result.data.success) {
                showToast('Password changed successfully!', 'success');
                changePasswordForm.reset();
            } else {
                showToast(result.data.message || 'Password change failed', 'error');
            }
        } catch (error) {
            showToast('Network error. Please try again.', 'error');
        } finally {
            setButtonLoading(btn, false);
        }
    });
}

// Logout
function logout() {
    localStorage.removeItem('token');
    showToast('Logged out successfully', 'info');
    setTimeout(() => {
        window.location.href = '/';
    }, 500);
}

// Initialize
checkAuth();
if (window.location.pathname === '/dashboard.html') {
    loadProfile();
}
