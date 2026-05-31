/**
 * 管理后台核心功能
 * 包含网站管理、分类管理、仪表盘等完整功能
 */

// ==================== 全局配置 ====================
const SESSION_KEY = 'navhub_admin_session';
const API_BASE = '/api';

// 检测是否在本地开发环境
const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// 本地模拟数据
const mockData = {
    categories: [
        { id: '1', name: '开发工具', icon: 'fas fa-code', color: '#3b82f6' },
        { id: '2', name: '设计资源', icon: 'fas fa-paint-brush', color: '#ec4899' },
        { id: '3', name: '学习平台', icon: 'fas fa-graduation-cap', color: '#10b981' },
        { id: '4', name: '云服务', icon: 'fas fa-cloud', color: '#8b5cf6' }
    ],
    websites: [
        { id: '1', name: 'GitHub', url: 'https://github.com', category: '1', description: '代码托管平台', icon: 'fas fa-code', createdAt: new Date().toISOString() },
        { id: '2', name: 'Figma', url: 'https://figma.com', category: '2', description: '设计协作工具', icon: 'fas fa-paint-brush', createdAt: new Date().toISOString() },
        { id: '3', name: 'Coursera', url: 'https://coursera.org', category: '3', description: '在线学习平台', icon: 'fas fa-graduation-cap', createdAt: new Date().toISOString() }
    ]
};

// 全局状态
let state = {
    websites: [],
    categories: [],
    currentPage: 'dashboard',
    deleteCallback: null,
    deleteItemId: null,
    selectedIcon: 'fas fa-globe',
    selectedColor: '#3b82f6'
};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    initSidebar();
    initIconSelectors();
    initSearch();
    loadAllData();
    
    // 刷新按钮
    document.getElementById('refreshBtn').addEventListener('click', function() {
        this.querySelector('i').classList.add('fa-spin');
        loadAllData().then(() => {
            setTimeout(() => {
                this.querySelector('i').classList.remove('fa-spin');
            }, 500);
        });
    });
});

// ==================== 数据加载 ====================
async function loadAllData() {
    await Promise.all([
        loadCategories(),
        loadWebsites(),
        loadStats()
    ]);
    updateUI();
}

async function loadCategories() {
    // 本地开发环境使用模拟数据
    if (isLocalDev) {
        state.categories = [...mockData.categories];
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/categories`);
        const result = await response.json();
        if (result.success) {
            state.categories = result.data;
        }
    } catch (error) {
        console.error('加载分类失败:', error);
        showToast('加载分类失败', 'error');
    }
}

async function loadWebsites() {
    // 本地开发环境使用模拟数据
    if (isLocalDev) {
        state.websites = [...mockData.websites];
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/websites`);
        const result = await response.json();
        if (result.success) {
            state.websites = result.data;
        }
    } catch (error) {
        console.error('加载网站失败:', error);
        showToast('加载网站失败', 'error');
    }
}

async function loadStats() {
    // 本地开发环境使用模拟数据
    if (isLocalDev) {
        updateStats({
            totalWebsites: mockData.websites.length,
            totalCategories: mockData.categories.length,
            todayVisits: 1234,
            lastUpdated: new Date().toISOString()
        });
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/stats`);
        const result = await response.json();
        if (result.success) {
            updateStats(result.data);
        }
    } catch (error) {
        console.error('加载统计失败:', error);
    }
}

// ==================== UI 更新 ====================
function updateUI() {
    updateCategoryFilter();
    renderWebsites();
    renderCategories();
    renderRecentWebsites();
}

function updateStats(stats) {
    document.getElementById('statWebsites').textContent = stats.totalWebsites || 0;
    document.getElementById('statCategories').textContent = stats.totalCategories || 0;
    document.getElementById('statViews').textContent = formatNumber(stats.todayVisits || 0);
    document.getElementById('statLastUpdate').textContent = formatTime(stats.lastUpdated);
}

function updateCategoryFilter() {
    const filter = document.getElementById('categoryFilter');
    const modalSelect = document.getElementById('websiteCategory');
    
    const options = state.categories.map(cat => 
        `<option value="${cat.id}">${cat.name}</option>`
    ).join('');
    
    filter.innerHTML = '<option value="">全部分类</option>' + options;
    modalSelect.innerHTML = '<option value="">请选择分类</option>' + options;
}

// ==================== 页面切换 ====================
function initSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        const icon = sidebarToggle.querySelector('i');
        icon.classList.toggle('fa-chevron-left');
        icon.classList.toggle('fa-chevron-right');
    });
    
    // 导航链接点击
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            switchPage(page);
        });
    });
}

function switchPage(page) {
    state.currentPage = page;
    
    // 更新导航激活状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    // 显示对应页面
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(page).classList.add('active');
    
    // 刷新数据
    if (page === 'dashboard') {
        loadStats();
        renderRecentWebsites();
    } else if (page === 'websites') {
        renderWebsites();
    } else if (page === 'categories') {
        renderCategories();
    }
}

// ==================== 网站管理 ====================
function renderWebsites() {
    const tbody = document.getElementById('websitesTable');
    const searchTerm = document.getElementById('websiteSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    let filtered = state.websites.filter(site => {
        const matchSearch = site.name.toLowerCase().includes(searchTerm) ||
                           site.url.toLowerCase().includes(searchTerm);
        const matchCategory = !categoryFilter || site.category === categoryFilter;
        return matchSearch && matchCategory;
    });
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>暂无数据</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filtered.map(site => {
        const category = state.categories.find(c => c.id === site.category) || { name: '未分类' };
        return `
            <tr>
                <td>${site.id.slice(-4)}</td>
                <td>
                    <div class="website-info">
                        <div class="website-icon" style="background: ${category.color || '#3b82f6'}20; color: ${category.color || '#3b82f6'};">
                            <i class="${site.icon || 'fas fa-globe'}"></i>
                        </div>
                        <div class="website-details">
                            <span class="website-name">${escapeHtml(site.name)}</span>
                            <span class="website-desc">${escapeHtml(site.description || '')}</span>
                        </div>
                    </div>
                </td>
                <td><span class="badge-tag" style="background: ${category.color || '#3b82f6'}20; color: ${category.color || '#3b82f6'};">${category.name}</span></td>
                <td><a href="${site.url}" target="_blank" class="website-link">${escapeHtml(site.url)}</a></td>
                <td>${formatDate(site.createdAt)}</td>
                <td>
                    <div class="table-actions">
                        <button class="icon-btn" onclick="editWebsite('${site.id}')" title="编辑">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="icon-btn" onclick="deleteWebsite('${site.id}')" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function renderRecentWebsites() {
    const tbody = document.getElementById('recentWebsitesTable');
    const recent = [...state.websites].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    ).slice(0, 5);
    
    if (recent.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>暂无数据</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = recent.map(site => {
        const category = state.categories.find(c => c.id === site.category) || { name: '未分类', color: '#3b82f6' };
        return `
            <tr>
                <td>
                    <div class="website-info">
                        <div class="website-icon" style="background: ${category.color}20; color: ${category.color}; width: 36px; height: 36px; font-size: 1rem;">
                            <i class="${site.icon || 'fas fa-globe'}"></i>
                        </div>
                        <div class="website-details">
                            <span class="website-name">${escapeHtml(site.name)}</span>
                        </div>
                    </div>
                </td>
                <td><span class="badge-tag" style="background: ${category.color}20; color: ${category.color};">${category.name}</span></td>
                <td>${formatDate(site.createdAt)}</td>
                <td>
                    <div class="table-actions">
                        <button class="icon-btn" onclick="editWebsite('${site.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="icon-btn" onclick="deleteWebsite('${site.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ==================== 分类管理 ====================
function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    
    if (state.categories.length === 0) {
        grid.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-inbox"></i>
                <p>暂无分类</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = state.categories.map(cat => {
        const count = state.websites.filter(w => w.category === cat.id).length;
        return `
            <div class="category-card" style="border-left-color: ${cat.color || '#3b82f6'}">
                <div class="category-header">
                    <div class="category-icon" style="background: ${cat.color || '#3b82f6'}20; color: ${cat.color || '#3b82f6'};">
                        <i class="${cat.icon || 'fas fa-folder'}"></i>
                    </div>
                    <div class="category-info">
                        <h4>${escapeHtml(cat.name)}</h4>
                        <span>${count} 个网站</span>
                    </div>
                </div>
                <div class="category-actions">
                    <button class="icon-btn" onclick="editCategory('${cat.id}')" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn" onclick="deleteCategory('${cat.id}')" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== 模态框操作 ====================
function showAddWebsiteModal() {
    document.getElementById('websiteModalTitle').textContent = '添加网站';
    document.getElementById('websiteForm').reset();
    document.getElementById('websiteId').value = '';
    state.selectedIcon = 'fas fa-globe';
    updateIconSelection('iconSelector', state.selectedIcon);
    document.getElementById('websiteModal').classList.add('active');
}

function editWebsite(id) {
    const site = state.websites.find(w => w.id === id);
    if (!site) return;
    
    document.getElementById('websiteModalTitle').textContent = '编辑网站';
    document.getElementById('websiteId').value = site.id;
    document.getElementById('websiteName').value = site.name;
    document.getElementById('websiteUrl').value = site.url;
    document.getElementById('websiteCategory').value = site.category;
    document.getElementById('websiteDescription').value = site.description || '';
    state.selectedIcon = site.icon || 'fas fa-globe';
    updateIconSelection('iconSelector', state.selectedIcon);
    
    document.getElementById('websiteModal').classList.add('active');
}

function closeWebsiteModal() {
    document.getElementById('websiteModal').classList.remove('active');
}

async function saveWebsite() {
    const id = document.getElementById('websiteId').value;
    const name = document.getElementById('websiteName').value.trim();
    const url = document.getElementById('websiteUrl').value.trim();
    const category = document.getElementById('websiteCategory').value;
    const description = document.getElementById('websiteDescription').value.trim();
    
    if (!name || !url || !category) {
        showToast('请填写必填项', 'error');
        return;
    }
    
    // 本地开发环境直接操作模拟数据
    if (isLocalDev) {
        if (id) {
            const index = mockData.websites.findIndex(w => w.id === id);
            if (index !== -1) {
                mockData.websites[index] = { ...mockData.websites[index], name, url, category, description, icon: state.selectedIcon };
            }
        } else {
            mockData.websites.push({
                id: Date.now().toString(),
                name, url, category, description,
                icon: state.selectedIcon,
                createdAt: new Date().toISOString()
            });
        }
        showToast(id ? '网站更新成功' : '网站添加成功');
        closeWebsiteModal();
        await loadWebsites();
        updateUI();
        return;
    }
    
    const data = {
        name, url, category, description,
        icon: state.selectedIcon
    };
    
    try {
        const method = id ? 'PUT' : 'POST';
        if (id) data.id = id;
        
        const response = await fetch(`${API_BASE}/websites`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast(id ? '网站更新成功' : '网站添加成功');
            closeWebsiteModal();
            await loadWebsites();
            updateUI();
        } else {
            showToast(result.error || '操作失败', 'error');
        }
    } catch (error) {
        showToast('网络错误', 'error');
    }
}

function showAddCategoryModal() {
    document.getElementById('categoryModalTitle').textContent = '添加分类';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
    state.selectedIcon = 'fas fa-folder';
    state.selectedColor = '#3b82f6';
    updateIconSelection('categoryIconSelector', state.selectedIcon);
    updateColorSelection(state.selectedColor);
    document.getElementById('categoryModal').classList.add('active');
}

function editCategory(id) {
    const cat = state.categories.find(c => c.id === id);
    if (!cat) return;
    
    document.getElementById('categoryModalTitle').textContent = '编辑分类';
    document.getElementById('categoryId').value = cat.id;
    document.getElementById('categoryName').value = cat.name;
    state.selectedIcon = cat.icon || 'fas fa-folder';
    state.selectedColor = cat.color || '#3b82f6';
    updateIconSelection('categoryIconSelector', state.selectedIcon);
    updateColorSelection(state.selectedColor);
    
    document.getElementById('categoryModal').classList.add('active');
}

function closeCategoryModal() {
    document.getElementById('categoryModal').classList.remove('active');
}

async function saveCategory() {
    const id = document.getElementById('categoryId').value;
    const name = document.getElementById('categoryName').value.trim();
    
    if (!name) {
        showToast('请输入分类名称', 'error');
        return;
    }
    
    const data = {
        name,
        icon: state.selectedIcon,
        color: state.selectedColor
    };
    
    try {
        const method = id ? 'PUT' : 'POST';
        if (id) data.id = id;
        
        const response = await fetch(`${API_BASE}/categories`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast(id ? '分类更新成功' : '分类添加成功');
            closeCategoryModal();
            await loadCategories();
            updateUI();
        } else {
            showToast(result.error || '操作失败', 'error');
        }
    } catch (error) {
        showToast('网络错误', 'error');
    }
}

// ==================== 删除操作 ====================
function deleteWebsite(id) {
    const site = state.websites.find(w => w.id === id);
    if (!site) return;
    
    state.deleteItemId = id;
    state.deleteCallback = async () => {
        try {
            const response = await fetch(`${API_BASE}/websites?id=${id}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            
            if (result.success) {
                showToast('网站删除成功');
                await loadWebsites();
                updateUI();
            } else {
                showToast(result.error || '删除失败', 'error');
            }
        } catch (error) {
            showToast('网络错误', 'error');
        }
    };
    
    document.getElementById('deleteItemName').textContent = site.name;
    document.getElementById('deleteModal').classList.add('active');
}

function deleteCategory(id) {
    const cat = state.categories.find(c => c.id === id);
    if (!cat) return;
    
    // 检查是否有网站使用此分类
    const usedCount = state.websites.filter(w => w.category === id).length;
    if (usedCount > 0) {
        showToast(`该分类下有 ${usedCount} 个网站，请先移除`, 'error');
        return;
    }
    
    state.deleteItemId = id;
    state.deleteCallback = async () => {
        try {
            const response = await fetch(`${API_BASE}/categories?id=${id}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            
            if (result.success) {
                showToast('分类删除成功');
                await loadCategories();
                updateUI();
            } else {
                showToast(result.error || '删除失败', 'error');
            }
        } catch (error) {
            showToast('网络错误', 'error');
        }
    };
    
    document.getElementById('deleteItemName').textContent = cat.name;
    document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    state.deleteCallback = null;
    state.deleteItemId = null;
}

function confirmDelete() {
    if (state.deleteCallback) {
        state.deleteCallback();
    }
    closeDeleteModal();
}

// ==================== 图标和颜色选择器 ====================
function initIconSelectors() {
    // 网站图标选择
    document.querySelectorAll('#iconSelector .icon-option').forEach(btn => {
        btn.addEventListener('click', () => {
            state.selectedIcon = btn.dataset.icon;
            updateIconSelection('iconSelector', state.selectedIcon);
        });
    });
    
    // 分类图标选择
    document.querySelectorAll('#categoryIconSelector .icon-option').forEach(btn => {
        btn.addEventListener('click', () => {
            state.selectedIcon = btn.dataset.icon;
            updateIconSelection('categoryIconSelector', state.selectedIcon);
        });
    });
    
    // 颜色选择
    document.querySelectorAll('#colorSelector .color-option').forEach(btn => {
        btn.addEventListener('click', () => {
            state.selectedColor = btn.dataset.color;
            updateColorSelection(state.selectedColor);
        });
    });
}

function updateIconSelection(containerId, selectedIcon) {
    document.querySelectorAll(`#${containerId} .icon-option`).forEach(btn => {
        btn.classList.toggle('active', btn.dataset.icon === selectedIcon);
    });
}

function updateColorSelection(selectedColor) {
    document.querySelectorAll('#colorSelector .color-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === selectedColor);
    });
}

// ==================== 搜索功能 ====================
function initSearch() {
    document.getElementById('websiteSearch').addEventListener('input', debounce(() => {
        renderWebsites();
    }, 300));
    
    document.getElementById('categoryFilter').addEventListener('change', () => {
        renderWebsites();
    });
    
    document.getElementById('globalSearch').addEventListener('input', debounce((e) => {
        const term = e.target.value.toLowerCase();
        if (term) {
            switchPage('websites');
            document.getElementById('websiteSearch').value = term;
            renderWebsites();
        }
    }, 500));
}

// ==================== 系统设置 ====================
function togglePassword(btn) {
    const input = btn.previousElementSibling;
    const icon = btn.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function resetSettings() {
    document.getElementById('siteName').value = 'NavHub';
    document.getElementById('siteDescription').value = '现代化网站导航平台';
    document.getElementById('adminPassword').value = '';
    showToast('设置已重置');
}

async function saveSettings() {
    const siteName = document.getElementById('siteName').value.trim();
    const siteDescription = document.getElementById('siteDescription').value.trim();
    const adminPassword = document.getElementById('adminPassword').value;
    
    // 保存到 localStorage（实际应该保存到服务器）
    localStorage.setItem('navhub_site_name', siteName);
    localStorage.setItem('navhub_site_description', siteDescription);
    
    if (adminPassword) {
        // 这里应该调用 API 修改密码
        showToast('密码修改功能需要后端支持', 'warning');
    }
    
    showToast('设置保存成功');
}

// ==================== 工具函数 ====================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('i');
    const text = document.getElementById('toastMessage');
    
    text.textContent = message;
    toast.className = 'toast show ' + type;
    
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
    } else if (type === 'warning') {
        icon.className = 'fas fa-exclamation-triangle';
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.replace('login.html');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatNumber(num) {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

function formatDate(dateString) {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

function formatTime(dateString) {
    if (!dateString) return '--';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
    return date.toLocaleDateString('zh-CN');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 定期验证会话
setInterval(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) {
        window.location.replace('login.html');
        return;
    }
    
    try {
        const sessionData = JSON.parse(session);
        if (sessionData.expires < Date.now()) {
            localStorage.removeItem(SESSION_KEY);
            window.location.replace('login.html');
        }
    } catch (e) {
        localStorage.removeItem(SESSION_KEY);
        window.location.replace('login.html');
    }
}, 5 * 60 * 1000); // 每5分钟检查一次
