# NavHub - Cloudflare Pages 部署指南

## 手动部署步骤（无需命令行）

### 步骤 1：创建 KV 命名空间

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 在左侧菜单找到并点击 **"KV"**
3. 点击 **"Create a namespace"** 按钮
4. 输入名称：`NAVHUB_KV`
5. 点击 **"Add"**

### 步骤 2：打包项目文件

将以下文件打包成 ZIP：

```
navhub.zip
├── index.html
├── styles.css
├── script.js
├── admin.html
├── admin-styles.css
└── functions/
    └── api/
        ├── websites.js
        ├── categories.js
        └── stats.js
```

### 步骤 3：创建 Pages 项目

1. 在 Cloudflare Dashboard 左侧菜单点击 **"Pages"**
2. 点击 **"Create a project"**
3. 选择 **"Upload assets"**（直接上传静态文件）
4. 输入项目名称：`navhub`
5. 点击 **"Create project"**
6. 上传刚才打包的 `navhub.zip` 文件
7. 点击 **"Deploy site"**

### 步骤 4：绑定 KV 到 Pages

1. 进入刚创建的 Pages 项目
2. 点击顶部 **"Settings"** 标签
3. 在左侧菜单点击 **"Functions"**
4. 找到 **"KV namespace bindings"** 部分
5. 点击 **"Add binding"**
   - Variable name: `NAVHUB_KV`
   - KV namespace: 选择 `NAVHUB_KV`
6. 点击 **"Save"**

### 步骤 5：重新部署

1. 返回项目概览页面
2. 点击 **"Create deployment"**
3. 重新上传 `navhub.zip` 文件
4. 点击 **"Deploy"**

### 步骤 6：访问网站

部署完成后，您会获得一个类似 `https://navhub.pages.dev` 的链接，点击即可访问。

---

## 绑定自定义域名（可选）

1. 在 Pages 项目中点击 **"Custom domains"** 标签
2. 点击 **"Set up a custom domain"**
3. 输入您的域名，如 `nav.yourdomain.com`
4. 按照提示添加 DNS 记录
5. 等待 SSL 证书自动配置（通常几分钟）

---

## API 端点

部署完成后，以下 API 可用：

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/websites` | GET | 获取所有网站 |
| `/api/websites` | POST | 添加网站 |
| `/api/websites` | PUT | 更新网站 |
| `/api/websites?id=xxx` | DELETE | 删除网站 |
| `/api/categories` | GET | 获取所有分类 |
| `/api/categories` | POST | 添加分类 |
| `/api/stats` | GET | 获取统计数据 |

---

## 更新网站

需要更新时：

1. 修改本地文件
2. 重新打包成 ZIP
3. 在 Pages 项目中点击 **"Create deployment"**
4. 上传新的 ZIP 文件
5. 点击 **"Deploy"**

---

## 故障排除

### API 返回 500 错误

检查 KV binding 是否正确配置：
- Variable name 必须是 `NAVHUB_KV`
- 确保选择了正确的 KV namespace

### 样式没有生效

确保 ZIP 中包含所有静态文件（HTML、CSS、JS）

### 管理后台无法访问

检查 `admin.html` 是否在 ZIP 根目录中

---

## 项目文件说明

| 文件 | 说明 |
|------|------|
| `index.html` | 导航首页 |
| `styles.css` | 首页样式 |
| `script.js` | 首页交互 |
| `admin.html` | 管理后台 |
| `admin-styles.css` | 后台样式 |
| `functions/api/*.js` | API 接口 |
