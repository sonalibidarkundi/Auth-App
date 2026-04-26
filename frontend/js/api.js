const API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
    ? 'http://127.0.0.1:5000'
    : window.location.origin;

const api = {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = localStorage.getItem('token');
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            ...options
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }
            
            return data;
        } catch (error) {
            throw error;
        }
    },

    // Auth endpoints
    register: (userData) => api.request('/api/auth/register', { method: 'POST', body: userData }),
    login: (credentials) => api.request('/api/auth/login', { method: 'POST', body: credentials }),
    getProfile: () => api.request('/api/auth/me', { method: 'GET' }),
    updateProfile: (data) => api.request('/api/auth/profile', { method: 'PUT', body: data }),
    changePassword: (data) => api.request('/api/auth/change-password', { method: 'PUT', body: data })
};

