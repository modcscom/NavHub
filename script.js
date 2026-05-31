/**
 * 导航页面交互脚本
 * 支持深色/浅色模式切换、搜索、移动端菜单等功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化主题
    initTheme();
    
    // 初始化移动端菜单
    initMobileMenu();
    
    // 初始化搜索功能
    initSearch();
    
    // 初始化导航链接
    initNavLinks();
    
    // 初始化滚动效果
    initScrollEffects();
});

/**
 * 主题管理
 */
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');
    
    // 检查本地存储或系统偏好
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
    
    // 切换主题
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        if (newTheme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });
}

/**
 * 移动端菜单
 */
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    
    mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        
        if (mobileMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
    
    // 点击导航链接后关闭菜单
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
    
    // 点击外部关闭菜单
    document.addEventListener('click', function(e) {
        if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            mobileMenu.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

/**
 * 搜索功能
 */
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-btn');
    const navCards = document.querySelectorAll('.nav-card');
    const tags = document.querySelectorAll('.tag');
    
    // 搜索输入
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        filterCards(query);
    });
    
    // 搜索按钮
    searchBtn.addEventListener('click', function() {
        const query = searchInput.value.toLowerCase().trim();
        filterCards(query);
    });
    
    // 回车搜索
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const query = this.value.toLowerCase().trim();
            filterCards(query);
        }
    });
    
    // 标签点击
    tags.forEach(tag => {
        tag.addEventListener('click', function() {
            const tagText = this.textContent.toLowerCase();
            searchInput.value = tagText;
            filterCards(tagText);
        });
    });
}

/**
 * 过滤卡片
 */
function filterCards(query) {
    const navCards = document.querySelectorAll('.nav-card');
    const sections = document.querySelectorAll('.categories-section');
    
    navCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        
        if (title.includes(query) || description.includes(query)) {
            card.style.display = 'flex';
            card.style.opacity = '1';
        } else {
            card.style.display = query === '' ? 'flex' : 'none';
        }
    });
    
    // 隐藏空分类
    sections.forEach(section => {
        const visibleCards = section.querySelectorAll('.nav-card[style*="flex"]');
        if (visibleCards.length === 0 && query !== '') {
            section.style.display = 'none';
        } else {
            section.style.display = 'block';
        }
    });
}

/**
 * 导航链接高亮
 */
function initNavLinks() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}

/**
 * 滚动效果
 */
function initScrollEffects() {
    const header = document.querySelector('.header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // 头部阴影效果
        if (currentScroll > 10) {
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
}

/**
 * 平滑滚动到锚点
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});
