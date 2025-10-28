# 服务器部署指南

## 服务器信息
- **域名**: fish-rabbit.site
- **协议**: HTTPS
- **API地址**: https://fish-rabbit.site/api

## 部署步骤

### 1. 上传文件到服务器
将以下文件上传到你的腾讯云服务器：
- 所有HTML文件
- auth-modal.js
- backend/ 目录（包含所有后端文件）

### 2. 服务器环境配置
确保服务器已安装：
- Node.js (推荐版本 16+)
- MySQL 数据库
- PM2 (用于进程管理，可选)

### 3. 数据库初始化
在服务器上运行：
```bash
mysql -u root -p < backend/config/setup_fish1_admin.sql
```

### 4. 安装依赖并启动服务
```bash
cd backend
npm install
npm start
```

### 5. 使用PM2管理进程（推荐）
```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start server.js --name "fish-backend"

# 查看状态
pm2 status

# 查看日志
pm2 logs fish-backend
```

### 6. 配置Nginx反向代理（如果使用）
```nginx
server {
    listen 80;
    server_name fish-rabbit.site;
    
    location / {
        root /path/to/your/html/files;
        index index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 环境变量配置

创建 `.env` 文件：
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=fish_db
JWT_SECRET=your_jwt_secret_key
```

## 验证部署

### 1. 健康检查
访问：https://fish-rabbit.site/health
应该返回：
```json
{
  "status": "ok",
  "message": "精灵客栈后端服务运行中"
}
```

### 2. 登录测试
访问：https://fish-rabbit.site
使用以下凭据登录：
- 用户名：fish1
- 密码：fish1

### 3. 功能测试
- 进入520房间测试考试功能
- 在1122-A页面测试卧室权限

## 常见问题

### 问题1：端口被占用
```bash
# 查找占用3000端口的进程
lsof -i :3000

# 结束进程
kill -9 <PID>
```

### 问题2：数据库连接失败
检查数据库配置和连接信息

### 问题3：CORS错误
确保后端CORS配置正确

### 问题4：HTTPS证书
确保SSL证书配置正确

## 监控和维护

### 查看日志
```bash
# 如果使用PM2
pm2 logs fish-backend

# 如果直接运行
# 查看控制台输出
```

### 重启服务
```bash
# PM2方式
pm2 restart fish-backend

# 直接方式
# 停止当前进程，然后重新运行 npm start
```

### 更新代码
1. 上传新文件
2. 重启服务
3. 验证功能正常
