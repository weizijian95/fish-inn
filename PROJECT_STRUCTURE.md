# 精灵客栈 - 项目结构

## 📁 目录结构

```
fish/
├── frontend（前端）
│   ├── index.html              # 大堂首页
│   ├── 1121.html              # 1121房间
│   ├── 1122.html              # 1122房间
│   ├── 1122-A.html            # 1122客厅
│   └── 1122-A-board.html      # 留言板（已对接API）
│
├── backend/（后端 - 新增）
│   ├── server.js              # Express服务器主文件
│   ├── package.json           # 依赖配置
│   ├── .env.template          # 环境变量模板
│   ├── .gitignore             # Git忽略文件
│   │
│   ├── config/                # 配置文件
│   │   ├── database.js        # 数据库连接配置
│   │   └── init.sql           # 数据库初始化SQL
│   │
│   └── routes/                # API路由
│       ├── users.js           # 用户相关API
│       └── messages.js        # 留言相关API
│
└── 部署文档
    ├── DEPLOYMENT.md          # 完整部署指南
    ├── 快速部署指南.txt       # 快速参考
    ├── nginx.conf             # Nginx配置示例
    └── backend/README.md      # 后端使用说明
```

## 🔌 技术栈

### 前端
- HTML5
- Tailwind CSS（CDN）
- Vanilla JavaScript
- Font Awesome 6.4.0

### 后端
- Node.js 18+
- Express.js 4.18
- MySQL 5.7+/8.0+
- CORS支持

### 服务器
- Nginx（反向代理 + 静态文件服务）
- PM2（进程管理）
- 腾讯云服务器

## 📡 API接口

### 基础URL
```
http://your-domain.com/api
```

### 用户接口
- `POST /api/users/register` - 注册用户
- `GET /api/users/:id` - 获取用户信息

### 留言接口
- `GET /api/messages` - 获取留言列表
- `POST /api/messages` - 发表留言
- `DELETE /api/messages/:id` - 删除留言
- `GET /api/messages/:id` - 获取单条留言

## 🗄️ 数据库设计

### users表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| nickname | VARCHAR(50) | 昵称 |
| avatar | VARCHAR(50) | 头像类型 |
| created_at | TIMESTAMP | 创建时间 |

### messages表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| user_id | INT | 用户ID（外键） |
| nickname | VARCHAR(50) | 昵称（冗余） |
| avatar | VARCHAR(50) | 头像（冗余） |
| content | TEXT | 留言内容 |
| created_at | TIMESTAMP | 创建时间 |

## 🚀 部署流程

1. **环境准备**：安装 Node.js、MySQL、Nginx
2. **代码上传**：上传到服务器 `/var/www/fish`
3. **数据库初始化**：执行 `init.sql`
4. **后端配置**：配置 `.env`，安装依赖
5. **启动服务**：使用 PM2 启动后端
6. **Nginx配置**：配置反向代理
7. **修改API地址**：前端改为实际API地址
8. **测试访问**：浏览器测试

## 📝 重要配置文件

### 1. backend/.env
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=fish_db
```

### 2. 1122-A-board.html
```javascript
// 第166行
const API_BASE_URL = '/api';  // 或 http://your-domain.com/api
```

### 3. nginx.conf
```nginx
location /api/ {
    proxy_pass http://localhost:3000/api/;
}
```

## 🔧 维护命令

```bash
# 查看后端状态
pm2 status

# 查看日志
pm2 logs fish-backend

# 重启服务
pm2 restart fish-backend

# 备份数据库
mysqldump -u root -p fish_db > backup.sql

# 更新代码后重启
cd /var/www/fish/backend
git pull
npm install
pm2 restart fish-backend
```

## 🔒 安全建议

1. ✅ 使用强密码（数据库、JWT_SECRET）
2. ✅ 配置 HTTPS（Let's Encrypt）
3. ✅ 定期备份数据库
4. ✅ 更新系统和依赖包
5. ✅ 配置防火墙规则
6. ⚠️ 考虑添加请求频率限制
7. ⚠️ 考虑添加用户认证

## 📊 功能特性

### 已实现
- ✅ 用户注册（昵称+头像）
- ✅ 发表留言
- ✅ 查看留言列表
- ✅ 删除自己的留言
- ✅ 实时时间显示
- ✅ 响应式设计
- ✅ 数据持久化

### 可扩展
- 💡 用户登录认证（JWT）
- 💡 留言点赞/评论
- 💡 图片上传
- 💡 实时通知（WebSocket）
- 💡 留言搜索
- 💡 用户个人中心
- 💡 管理员后台

## 🎨 自定义建议

1. **更换头像**：修改 `AVATAR_CONFIG`
2. **修改颜色**：调整 Tailwind 配置
3. **添加房间**：参考现有房间结构
4. **增加功能**：扩展 API 接口

## 📞 常见问题

### Q: 留言无法显示？
A: 检查 API_BASE_URL 是否正确，检查后端是否运行

### Q: 502 错误？
A: 检查后端服务是否启动（pm2 status）

### Q: 数据库连接失败？
A: 检查 .env 配置，检查 MySQL 是否运行

详细问题排查请查看 `DEPLOYMENT.md`

## 📅 更新日志

### 2025-10-21
- ✨ 添加完整的后端系统
- ✨ 留言板功能从 localStorage 迁移到 MySQL
- ✨ 添加用户注册功能
- ✨ 完善部署文档
- ✨ 添加 Nginx 配置
- 🐛 修复前端所有 linter 警告

---

**开发者**: Fish Team  
**技术支持**: 查看 DEPLOYMENT.md

