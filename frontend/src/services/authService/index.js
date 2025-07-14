import ApiService from './api';

class AuthService {
    async login(credentials) {
        const data = await ApiService.post('/auth/login', credentials);
        if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
        }
        return data;
    }

    logout() {
        localStorage.removeItem('access_token');
    }

    async register(userInfo) {
        return await ApiService.post('/auth/register', userInfo);
    }

    isAuthenticated() {
        return localStorage.getItem('access_token') !== null;
    }
}

export default new AuthService();
