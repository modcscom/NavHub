# NavHub - 现代化网站导航平台

一个简洁高效的网站导航平台，支持响应式设计、深色/浅色模式切换，基于 Cloudflare Workers 部署。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Cloudflare](https://img.shields.io/badge/deploy-Cloudflare-orange.svg)

## 功能特性

### 导航首页
- 🎨 **现代化设计** - 渐变背景动画，流畅的视觉效果
- 🌓 **主题切换** - 支持深色/浅色模式，自动保存用户偏好
- 🔍 **智能搜索** - 实时搜索过滤，支持标签快速筛选
- 📱 **响应式布局** - 完美适配手机、平板、桌面设备
- ⚡ **流畅动画** - 卡片悬停效果，页面过渡动画

### 管理后台
- 📊 **数据仪表盘** - 统计卡片展示关键数据
- 📝 **网站管理** - 添加、编辑、删除网站链接
- 📁 **分类管理** - 自定义分类，灵活组织
- 🎨 **深色主题** - 专为管理后台设计的深色界面

### 技术特性
- 🚀 **Cloudflare Workers** - 边缘计算部署，全球加速
- 💾 **KV 存储** - 数据持久化存储
- 🔒 **安全头部** - XSS 防护、内容安全策略
- 🌐 **REST API** - 完整的 API 接口支持

## 项目结构

```
navhub/
├── index.html              # 导航首页
├── styles.css              # 首页样式
├── script.js               # 首页交互脚本
├── admin.html              # 管理后台
├── admin-styles.css        # 后台样式
├── package.json            # 项目依赖
├── wrangler.toml           # Cloudflare 配置
├── workers-site/
│   └── index.js            # Workers 脚本
└── README.md               # 项目文档
```

## 快速开始

### 方式一：本地预览

```bash
# 进入项目目录
cd navhub

# 使用 Python 启动本地服务器
python -m http.server 8080

# 或使用 Node.js
npx serve .

# 浏览器访问
open http://localhost:8080
```

### 方式二：Cloudflare 部署（推荐）

#### 前置要求

1. [Cloudflare 账号](https://dash.cloudflare.com/sign-up)
2. [Node.js](https://nodejs.org/) 16.x 或更高版本
3. [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

#### 安装 Wrangler

```bash
# 使用 npm 安装
npm install -g wrangler

# 或使用 npx（推荐）
npx wrangler --version
```

#### 登录 Cloudflare

```bash
# 认证 Cloudflare 账号
npx wrangler login

# 浏览器会打开认证页面，点击"允许"完成授权
```

#### 创建 KV 命名空间

```bash
# 创建生产环境 KV
npx wrangler kv:namespace create "NAVHUB_KV"

# 创建预览环境 KV
npx wrangler kv:namespace create "NAVHUB_KV" --preview

# 记录输出的 id 和 preview_id
```

#### 配置 wrangler.toml

编辑 `wrangler.toml` 文件，填入您的 KV ID：

```toml
name = "navhub"
main = "workers-site/index.js"
compatibility_date = "2026-05-31"

[site]
bucket = "./"

# 替换为您的 KV 命名空间 ID
[[kv_namespaces]]
binding = "NAVHUB_KV"
id = "您的_KV_ID"
preview_id = "您的预览_KV_ID"
```

#### 安装依赖

```bash
npm install
```

#### 本地开发

```bash
# 启动本地开发服务器
npm run dev

# 或
npx wrangler dev

# 访问 http://localhost:8787
```

#### 部署到生产环境

```bash
# 构建并部署
npm run deploy

# 或
npx wrangler deploy

# 部署成功后，会显示访问链接
# 例如：https://navhub.your-subdomain.workers.dev
```

#### 绑定自定义域名（可选）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 Workers & Pages
3. 选择您的项目
4. 点击 "Triggers" → "Custom Domains"
5. 添加您的域名（如 `nav.yourdomain.com`）

## API 接口文档

### 获取所有网站

```http
GET /api/websites
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": "123456",
      "name": "GitHub",
      "url": "https://github.com",
      "category": "开发工具",
      "description": "代码托管平台",
      "createdAt": "2026-05-31T12:00:00Z"
    }
  ]
}
```

### 添加网站

```http
POST /api/websites
Content-Type: application/json

{
  "name": "网站名称",
  "url": "https://example.com",
  "category": "分类名称",
  "description": "网站描述"
}
```

### 获取分类

```http
GET /api/categories
```

### 获取统计数据

```http
GET /api/stats
```

## 自定义配置

### 修改网站信息

编辑 `index.html` 中的卡片内容：

```html
<a href="https://your-site.com" target="_blank" class="nav-card">
    <div class="card-icon custom">
        <i class="fas fa-icon"></i>
    </div>
    <div class="card-content">
        <h3>网站名称</h3>
        <p>网站描述</p>
    </div>
</a>
```

### 添加自定义样式

在 `styles.css` 中添加新的图标颜色：

```css
.card-icon.custom {
    background: #your-color;
    color: white;
}
```

### 配置环境变量

在 `wrangler.toml` 中添加：

```toml
[vars]
SITE_NAME = "My Navigation"
SITE_DESCRIPTION = "My personal navigation site"
```

然后在 `workers-site/index.js` 中使用：

```javascript
const siteName = SITE_NAME || 'NavHub'
```

## 常见问题

### Q: 部署后样式丢失？

确保 `wrangler.toml` 中的 `bucket` 配置正确：
```toml
[site]
bucket = "./"
```

### Q: KV 数据如何备份？

```bash
# 导出 KV 数据
npx wrangler kv:key list --binding=NAVHUB_KV > backup.json
```

### Q: 如何更新已部署的项目？

```bash
# 修改代码后重新部署
npx wrangler deploy
```

### Q: 本地开发时 API 无法访问？

确保使用 `wrangler dev` 而不是普通的 HTTP 服务器，这样才能访问 KV 存储。

## 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (原生)
- **部署**: Cloudflare Workers
- **存储**: Cloudflare KV
- **字体**: Inter, Font Awesome

## 许可证

[MIT](LICENSE) © 2026 NavHub

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v1.0.0 (2026-05-31)
- ✨ 初始版本发布
- 🎨 现代化导航界面
- 🌓 深色/浅色模式
- 📱 响应式设计
- 🔧 管理后台
- 🚀 Cloudflare Workers 部署
