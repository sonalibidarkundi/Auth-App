const API_BASE_URL = 'http://127.0.0.1:5000';
const API_URLS = {
    register: `${API_BASE_URL}/api/auth/register`,
    login: `${API_BASE_URL}/api/auth/login`,
    me: `${API_BASE_URL}/api/auth/me`,
    profile: `${API_BASE_URL}/api/auth/profile`,
    changePassword: `${API_BASE_URL}/api/auth/change-password`
};

async function apiRequest(url, options = {}) {
    const token = localStorage.getItem('token');

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
    }

    const data = await response.json();
    return { status: response.status, data };
}
