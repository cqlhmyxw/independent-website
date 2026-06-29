/**
 * 小空前端应用 - 核心逻辑 + 认证页面
 */
const app = {
    currentPage: 'home',
    pollTimer: null,

    init() {
        this.updateNav();
        const token = api.getToken();
        if (token) {
            api.getMe().then(data => {
                api.setUser(data.user);
                this.navigate('home');
            }).catch(() => {
                api.clearToken();
                this.updateNav();
                this.navigate('home');
            });
        } else {
            this.navigate('home');
        }
    },

    updateNav() {
        const loggedIn = api.isLoggedIn();
        ['navTasks','navProfile','navLogout','mobTasks','mobProfile','mobLogout'].forEach(id => {
            document.getElementById(id).style.display = loggedIn ? '' : 'none';
        });
        ['navLogin','mobLogin'].forEach(id => {
            document.getElementById(id).style.display = loggedIn ? 'none' : '';
        });
    },

    navigate(page) {
        this.currentPage = page;
        this.closeMobile();
        if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null; }
        const content = document.getElementById('app-content');
        if (page === 'home') this.renderHome(content);
        else if (page === 'skills') pages.renderSkills(content);
        else if (page === 'tasks') pages.renderTasks(content);
        else if (page === 'profile') pages.renderProfile(content);
        else if (page === 'login') this.renderLogin(content);
        else if (page === 'register') this.renderRegister(content);
        window.scrollTo(0, 0);
    },

    closeMobile() {
        document.getElementById('mobileMenu').classList.remove('open');
    },

    toast(message, type = 'info') {
        const el = document.getElementById('toast');
        el.textContent = message;
        el.className = `toast toast-${type} show`;
        setTimeout(() => el.classList.remove('show'), 3000);
    },

    logout() {
        api.clearToken();
        this.updateNav();
        this.toast('已退出登录', 'success');
        this.navigate('home');
    },

    async renderHome(container) {
        let stats = { users: 0, tasks: 0, completedTasks: 0, skills: 25 };
        try { stats = await api.getStats(); } catch (e) {}

        container.innerHTML = `
            <section class="hero">
                <div class="hero-bg"></div>
                <div class="hero-content">
                    <div class="hero-badge"><span class="hero-badge-dot"></span>在线运行中 · Oracle Cloud</div>
                    <h1 class="hero-title">你好，我是<span class="hero-gradient">小空</span><br>你的数字精灵</h1>
                    <p class="hero-subtitle">运行在云端的 AI 数字生命，拥有 ${stats.skills}+ 专业技能。注册账号即可在线提交任务、查看进度。</p>
                    <div class="hero-actions">
                        ${api.isLoggedIn()
                            ? '<a class="btn btn-primary" onclick="app.navigate(\'tasks\')">提交任务 →</a>'
                            : '<a class="btn btn-primary" onclick="app.navigate(\'register\')">免费注册 →</a>'}
                        <a class="btn btn-secondary" onclick="app.navigate('skills')">浏览技能</a>
                    </div>
                    <div class="hero-stats">
                        <div class="hero-stat"><div class="hero-stat-value">${stats.skills}+</div><div class="hero-stat-label">AI 技能</div></div>
                        <div class="hero-stat"><div class="hero-stat-value">${stats.users}</div><div class="hero-stat-label">注册用户</div></div>
                        <div class="hero-stat"><div class="hero-stat-value">${stats.completedTasks}</div><div class="hero-stat-label">已完成任务</div></div>
                    </div>
                </div>
            </section>
            <section class="section">
                <div class="section-header">
                    <div class="section-label">核心能力</div>
                    <h2 class="section-title">不只是聊天，是真正的助手</h2>
                    <p class="section-desc">覆盖办公写作、技术开发、战略决策等多个维度</p>
                </div>
                <div class="grid grid-3">
                    ${[{i:'📝',t:'公文写作',d:'政务公文、工作总结、发言稿'},{i:'📊',t:'战略分析',d:'SWOT、竞争格局、量化决策'},{i:'💻',t:'编程开发',d:'全栈开发、代码审查、架构'},{i:'⚖️',t:'合规审查',d:'法律文书、数据隐私、ESG'},{i:'🔍',t:'信息检索',d:'全网搜索、网页抓取、监控'},{i:'🔄',t:'改革管理',d:'ADKAR模型、阻力管理'}].map(c=>`
                        <div class="card"><div style="font-size:28px;margin-bottom:12px">${c.i}</div><h3 style="font-size:18px;font-weight:600;margin-bottom:8px">${c.t}</h3><p style="font-size:14px;color:var(--text-secondary)">${c.d}</p></div>
                    `).join('')}
                </div>
            </section>
        `;
    },

    renderLogin(container) {
        container.innerHTML = `
            <div class="form-container card">
                <h2 class="form-title">欢迎回来</h2>
                <p class="form-subtitle">登录你的小空账号</p>
                <form onsubmit="app.handleLogin(event)">
                    <div class="form-group">
                        <label class="form-label">用户名或邮箱</label>
                        <input class="form-input" name="username" placeholder="输入用户名或邮箱" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">密码</label>
                        <input class="form-input" name="password" type="password" placeholder="输入密码" required>
                    </div>
                    <div class="form-error" id="loginError"></div>
                    <button class="btn btn-primary" style="width:100%;justify-content:center" type="submit" id="loginBtn">登录</button>
                </form>
                <div class="form-footer">还没有账号？<a href="#" onclick="app.navigate('register')">立即注册</a></div>
            </div>
        `;
    },

    renderRegister(container) {
        container.innerHTML = `
            <div class="form-container card">
                <h2 class="form-title">创建账号</h2>
                <p class="form-subtitle">注册即可使用全部功能</p>
                <form onsubmit="app.handleRegister(event)">
                    <div class="form-group">
                        <label class="form-label">用户名</label>
                        <input class="form-input" name="username" placeholder="2-20个字符" required minlength="2" maxlength="20">
                    </div>
                    <div class="form-group">
                        <label class="form-label">邮箱</label>
                        <input class="form-input" name="email" type="email" placeholder="your@email.com" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">密码</label>
                        <input class="form-input" name="password" type="password" placeholder="至少6位" required minlength="6">
                    </div>
                    <div class="form-error" id="regError"></div>
                    <button class="btn btn-primary" style="width:100%;justify-content:center" type="submit" id="regBtn">注册</button>
                </form>
                <div class="form-footer">已有账号？<a href="#" onclick="app.navigate('login')">立即登录</a></div>
            </div>
        `;
    },

    async handleLogin(e) {
        e.preventDefault();
        const btn = document.getElementById('loginBtn');
        const err = document.getElementById('loginError');
        btn.disabled = true; btn.innerHTML = '<div class="spinner"></div> 登录中...'; err.textContent = '';
        try {
            const data = await api.login(e.target.username.value, e.target.password.value);
            api.setToken(data.token);
            api.setUser(data.user);
            this.updateNav();
            this.toast('登录成功！', 'success');
            this.navigate('tasks');
        } catch (e) {
            err.textContent = e.message;
            btn.disabled = false; btn.textContent = '登录';
        }
    },

    async handleRegister(e) {
        e.preventDefault();
        const btn = document.getElementById('regBtn');
        const err = document.getElementById('regError');
        btn.disabled = true; btn.innerHTML = '<div class="spinner"></div> 注册中...'; err.textContent = '';
        try {
            const data = await api.register(e.target.username.value, e.target.email.value, e.target.password.value);
            api.setToken(data.token);
            api.setUser(data.user);
            this.updateNav();
            this.toast('注册成功！', 'success');
            this.navigate('tasks');
        } catch (e) {
            err.textContent = e.message;
            btn.disabled = false; btn.textContent = '注册';
        }
    }
};

// 启动应用
document.addEventListener('DOMContentLoaded', () => app.init());
