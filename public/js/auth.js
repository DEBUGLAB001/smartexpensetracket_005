document.addEventListener('DOMContentLoaded', () => {
    // If already logged in, redirect to dashboard
    if (api.getToken()) {
        window.location.href = 'dashboard.html';
    }

    const formLogin = document.getElementById('form-login');
    const loginError = document.getElementById('login-error');

    // Login Form Submit
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const data = await api.request('/auth/login', 'POST', { email, password });
            api.setToken(data.token);
            window.location.href = 'dashboard.html';
        } catch (error) {
            loginError.textContent = error.message;
        }
    });
});
