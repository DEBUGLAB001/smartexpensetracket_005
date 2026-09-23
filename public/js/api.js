// Central API wrapper
const api = {
    baseUrl: '/api',
    
    getToken() {
        return localStorage.getItem('token');
    },
    
    setToken(token) {
        localStorage.setItem('token', token);
    },
    
    logout() {
        // BUG 8 (Frontend): The token is not removed from localStorage on logout.
        // It should be: localStorage.removeItem('token');
        window.location.href = 'index.html';
    },

    async request(endpoint, method = 'GET', body = null) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);
        
        try {
            const res = await fetch(`${this.baseUrl}${endpoint}`, options);
            if (res.status === 204) return true; // No content
            
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong');
            }
            return data.data;
        } catch (error) {
            throw error;
        }
    }
};
