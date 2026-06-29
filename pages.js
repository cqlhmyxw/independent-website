/**
 * 小空前端应用 - 页面渲染（技能/任务/个人中心）
 */
const pages = {

    // === 技能库页面 ===
    async renderSkills(container) {
        container.innerHTML = `<div class="section"><div class="section-header"><div class="section-label">加载中...</div></div></div>`;
        
        let data;
        try { data = await api.getSkills(); }
        catch (e) { container.innerHTML = `<div class="section"><p style="text-align:center;color:var(--text-muted)">加载失败：${e.message}</p></div>`; return; }

        const categories = {
            writing: '📝 公文写作',
            management: '🎯 管理决策', 
            compliance: '⚖️ 合规审计',
            tech: '💻 技术开发',
            special: '🔧 专项能力'
        };

        const grouped = {};
        data.skills.forEach(s => {
            if (!grouped[s.category]) grouped[s.category] = [];
            grouped[s.category].push(s);
        });

        container.innerHTML = `
            <section class="section">
                <div class="section-header">
                    <div class="section-label">技能库</div>
                    <h2 class="section-title">25+ 行业专家，随时调用</h2>
                    <p class="section-desc">覆盖公文写作、管理决策、合规审计、技术开发等核心领域</p>
                </div>
                ${Object.entries(grouped).map(([cat, skills]) => `
                    <div style="margin-bottom:40px">
                        <h3 style="font-size:18px;font-weight:600;margin-bottom:16px;color:var(--text-secondary)">${categories[cat] || cat}</h3>
                        <div class="grid grid-3">
                            ${skills.map(s => `
                                <div class="card" style="padding:20px">
                                    <div style="font-size:24px;margin-bottom:8px">${s.icon}</div>
                                    <h4 style="font-size:15px;font-weight:600;margin-bottom:6px">${s.name}</h4>
                                    <p style="font-size:13px;color:var(--text-muted)">${s.description}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </section>
        `;
    },

    // === 任务页面 ===
    async renderTasks(container) {
        if (!api.isLoggedIn()) { app.navigate('login'); return; }

        container.innerHTML = `
            <section class="section" style="max-width:800px">
                <div class="section-header">
                    <div class="section-label">任务中心</div>
                    <h2 class="section-title">提交新任务</h2>
                    <p class="section-desc">选择任务类型，填写标题，小空会自动处理</p>
                </div>
                <div class="card" style="margin-bottom:40px">
                    <form onsubmit="pages.handleSubmitTask(event)">
                        <div class="form-group">
                            <label class="form-label">任务类型</label>
                            <select class="form-input" name="type" required>
                                <option value="writing">📝 公文写作</option>
                                <option value="analysis">📊 分析研究</option>
                                <option value="search">🔍 信息检索</option>
                                <option value="code">💻 编程开发</option>
                                <option value="data">📁 数据处理</option>
                                <option value="other">🔧 其他</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">任务标题</label>
                            <input class="form-input" name="title" placeholder="简要描述你需要做什么" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">详细描述（可选）</label>
                            <textarea class="form-input" name="description" rows="3" placeholder="补充具体要求..." style="resize:vertical"></textarea>
                        </div>
                        <button class="btn btn-primary" type="submit" id="submitBtn" style="width:100%;justify-content:center">提交任务</button>
                    </form>
                </div>
                <div>
                    <h3 style="font-size:18px;font-weight:600;margin-bottom:16px">我的任务</h3>
                    <div id="taskList"><div class="spinner" style="margin:20px auto"></div></div>
                </div>
            </section>
        `;
        this.loadTasks();
    },

    async handleSubmitTask(e) {
        e.preventDefault();
        const btn = document.getElementById('submitBtn');
        btn.disabled = true; btn.innerHTML = '<div class="spinner"></div> 提交中...';
        try {
            const data = await api.createTask(
                e.target.type.value,
                e.target.title.value,
                e.target.description.value
            );
            app.toast('任务已提交！', 'success');
            e.target.reset();
            this.loadTasks();
        } catch (e) {
            app.toast(e.message, 'error');
        }
        btn.disabled = false; btn.textContent = '提交任务';
    },

    async loadTasks() {
        const list = document.getElementById('taskList');
        try {
            const data = await api.getTasks({ limit: 20 });
            if (data.tasks.length === 0) {
                list.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px">还没有任务，提交一个试试吧</p>';
                return;
            }
            list.innerHTML = data.tasks.map(t => {
                const statusMap = { processing: '处理中', completed: '已完成', pending: '待处理' };
                const typeMap = { writing: '📝', analysis: '📊', search: '🔍', code: '💻', data: '📁', other: '🔧' };
                return `
                    <div class="task-card">
                        <div class="task-info">
                            <div class="task-title">${typeMap[t.type] || '🔧'} ${t.title}</div>
                            <div class="task-meta">
                                <span>${t.created_at}</span>
                                ${t.result ? '<span style="color:var(--success)">有结果</span>' : ''}
                            </div>
                            ${t.result ? `<div style="margin-top:8px;font-size:13px;color:var(--text-secondary);padding:12px;background:var(--bg-secondary);border-radius:6px">${t.result}</div>` : ''}
                        </div>
                        <span class="task-status status-${t.status}">${statusMap[t.status] || t.status}</span>
                    </div>
                `;
            }).join('');

            // 如果有处理中的任务，轮询刷新
            const hasProcessing = data.tasks.some(t => t.status === 'processing');
            if (hasProcessing && !app.pollTimer) {
                app.pollTimer = setInterval(() => this.loadTasks(), 2000);
            }
        } catch (e) {
            list.innerHTML = `<p style="text-align:center;color:var(--danger)">加载失败：${e.message}</p>`;
        }
    },

    // === 个人中心 ===
    async renderProfile(container) {
        if (!api.isLoggedIn()) { app.navigate('login'); return; }

        const user = api.getUser();
        container.innerHTML = `
            <section class="section" style="max-width:600px">
                <div class="section-header">
                    <div class="section-label">个人中心</div>
                    <h2 class="section-title">${user.username}</h2>
                </div>
                <div class="card" style="margin-bottom:24px">
                    <div style="display:flex;align-items:center;gap:20px;margin-bottom:24px">
                        <div style="width:64px;height:64px;background:var(--gradient-1);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:white">${user.username[0].toUpperCase()}</div>
                        <div>
                            <div style="font-size:20px;font-weight:600">${user.username}</div>
                            <div style="font-size:14px;color:var(--text-muted)">${user.email}</div>
                            <span class="tag" style="margin-top:4px">${user.role === 'admin' ? '管理员' : '用户'}</span>
                        </div>
                    </div>
                    <div style="border-top:1px solid var(--border);padding-top:16px">
                        <div style="display:flex;justify-content:space-between;font-size:14px;color:var(--text-secondary)">
                            <span>注册时间</span><span>${user.created_at || '未知'}</span>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <h3 style="font-size:16px;font-weight:600;margin-bottom:16px">服务器状态</h3>
                    <div id="serverStats" style="font-size:14px;color:var(--text-secondary)"><div class="spinner"></div></div>
                </div>
            </section>
        `;
        this.loadServerStats();
    },

    async loadServerStats() {
        const el = document.getElementById('serverStats');
        if (!el) return;
        try {
            const stats = await api.getStats();
            el.innerHTML = `
                <div style="display:grid;gap:12px">
                    <div style="display:flex;justify-content:space-between"><span>注册用户</span><strong>${stats.users}</strong></div>
                    <div style="display:flex;justify-content:space-between"><span>总任务数</span><strong>${stats.tasks}</strong></div>
                    <div style="display:flex;justify-content:space-between"><span>已完成</span><strong style="color:var(--success)">${stats.completedTasks}</strong></div>
                    <div style="display:flex;justify-content:space-between"><span>可用技能</span><strong>${stats.skills}</strong></div>
                    <div style="display:flex;justify-content:space-between"><span>可用内存</span><strong>${stats.server.freeMemory}</strong></div>
                    <div style="display:flex;justify-content:space-between"><span>运行时间</span><strong>${Math.round(stats.server.uptime / 60)} 分钟</strong></div>
                </div>
            `;
        } catch (e) {
            el.textContent = '加载失败';
        }
    }
};
