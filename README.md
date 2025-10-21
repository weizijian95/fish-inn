# 🏠 精灵客栈 - Fish Inn

一个温馨的个人网站，包含留言板功能的多房间系统。

## ✨ 功能特性

- 🎨 精美的响应式设计
- 💬 实时留言板系统
- 👤 用户头像和昵称系统
- 🏠 多房间导航
- 📱 完美适配移动端
- 🔒 数据持久化存储

## 🛠️ 技术栈

### 前端
- HTML5 + Tailwind CSS
- Vanilla JavaScript
- Font Awesome 6.4.0

### 后端
- Node.js + Express.js
- MySQL
- RESTful API

### 部署
- Nginx (反向代理)
- PM2 (进程管理)
- 腾讯云服务器

## 📁 项目结构

```
fish/
├── index.html              # 首页大堂
├── 1121.html              # 1121房间
├── 1122.html              # 1122房间
├── 1122-A.html            # 客厅
├── 1122-A-board.html      # 留言板
├── backend/               # 后端服务
│   ├── server.js          # Express服务器
│   ├── config/            # 配置文件
│   └── routes/            # API路由
├── DEPLOYMENT.md          # 完整部署指南
└── PROJECT_STRUCTURE.md   # 项目结构说明
```

## 🚀 快速开始

### 本地开发

1. **克隆项目**
```bash
git clone <your-repo-url>
cd fish
```

2. **安装依赖**
```bash
cd backend
npm install
```

3. **配置数据库**
```bash
# 创建数据库
mysql -u root -p < backend/config/init.sql

# 配置环境变量
cp backend/.env.template backend/.env
nano backend/.env  # 修改数据库配置
```

4. **启动服务**
```bash
# 启动后端
cd backend
npm start

# 前端直接用浏览器打开 index.html
# 或使用任何静态服务器
```

### 生产部署

详细部署步骤请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

**快速部署命令**：
```bash
# 在服务器上
git clone <your-repo-url> /var/www/fish
cd /var/www/fish/backend
npm install
cp .env.template .env
nano .env  # 配置数据库

# 初始化数据库
mysql -u root -p < config/init.sql

# 启动服务
pm2 start server.js --name fish-backend
pm2 save

# 配置Nginx
sudo cp nginx.conf /etc/nginx/conf.d/fish.conf
sudo nginx -t
sudo systemctl restart nginx
```

## 📡 API 接口

### 基础URL
```
http://your-domain.com/api
```

### 接口列表

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/users/register | 注册用户 |
| GET | /api/users/:id | 获取用户信息 |
| GET | /api/messages | 获取留言列表 |
| POST | /api/messages | 发表留言 |
| DELETE | /api/messages/:id | 删除留言 |

详细API文档请查看 [backend/README.md](./backend/README.md)

## 🗄️ 数据库

### 表结构

**users 用户表**
- id, nickname, avatar, created_at

**messages 留言表**
- id, user_id, nickname, avatar, content, created_at

完整SQL见 [backend/config/init.sql](./backend/config/init.sql)

## 🔧 配置说明

### 环境变量 (.env)
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=fish_db
```

### 前端API配置
修改 `1122-A-board.html` 第166行：
```javascript
const API_BASE_URL = '/api';  // 生产环境
// const API_BASE_URL = 'http://localhost:3000/api';  // 开发环境
```

## 📚 文档

- [DEPLOYMENT.md](./DEPLOYMENT.md) - 完整部署指南
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - 项目架构说明
- [backend/README.md](./backend/README.md) - 后端API文档
- [快速部署指南.txt](./快速部署指南.txt) - 简明部署步骤

## 🛡️ 安全建议

- ✅ 使用强密码
- ✅ 配置HTTPS
- ✅ 定期备份数据库
- ✅ 不要提交 .env 文件
- ✅ 更新依赖包

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👨‍💻 作者

Fish Team

---

**⭐ 如果这个项目对你有帮助，请给个星标！**

