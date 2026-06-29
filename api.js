/**
 * 小空 API 客户端
 */
const API_BASE = 'http://158.178.244.60:8081/api';

const api = {
    // 获取 token
    getToken() {
        return localStorage.getItem('xiaokong_token');
    },

    // 设置 token
    setToken(token) {
        localStorage.setItem('xiaokong_token', token);
    },

    // 清除 token
    clearToken() {
        localStorage.removeItem('xiaokong_token');
        localStorage.removeItem('xiaokong_user');
    },

    // 获取用户信息
    getUser() {
        const user = localStorage.getItem('xiaokong_user');
        return user ? JSON.parse(user) : null;
    },

    // 设置用户信息
    setUser(user) {
        localStorage.setItem('xiaokong_user', JSON.stringify(user));
    },

    // 是否已登录
    isLoggedIn() {
        return !!this.getToken();
    },

    // 通用请求
    async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const config = {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options
        };

        const token = this.getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `请求失败 (${response.status})`);
            }
            return data;
        } catch (err) {
            if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
                throw new Error('无法连接到服务器，请稍后重试');
            }
            throw err;
        }
    },

    // 注册
    register(username, email, password) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
    },

    // 登录
    login(username, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    },

    // 获取当前用户
    getMe() {
        return this.request('/auth/me');
    },

    // 获取技能列表
    getSkills(category) {
        const query = category && category !== 'all' ? `?category=${category}` : '';
        return this.request(`/skills${query}`);
    },

    // 创建任务
    createTask(type, title, description) {
        return this.request('/tasks', {
            method: 'POST',
            body: JSON.stringify({ type, title, description })
        });
    },

    // 获取任务列表
    getTasks(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/tasks?${query}`);
    },

    // 获取统计
    getStats() {
        return this.request('/stats');
    },

    // 健康检查
    health() {
        return this.request('/health');
    }
};
