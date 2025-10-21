# 完整部署指南

## 🚀 部署到腾讯云服务器

### 前置条件

- ✅ 腾讯云服务器（CentOS/Ubuntu）
- ✅ 域名（可选，建议有）
- ✅ SSH 访问权限

---

## 📋 部署步骤

### 第一步：准备服务器环境

```bash
# 1. 连接到你的腾讯云服务器
ssh root@your-server-ip

# 2. 更新系统
sudo yum update -y  # CentOS/RHEL
# 或
sudo apt update && sudo apt upgrade -y  # Ubuntu/Debian

# 3. 安装必要工具
sudo yum install -y git wget curl  # CentOS
# 或
sudo apt install -y git wget curl  # Ubuntu
```

### 第二步：安装 Node.js

```bash
# 使用 NodeSource 安装 Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs  # CentOS

# 或 Ubuntu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node -v  # 应该显示 v18.x.x
npm -v   # 应该显示 9.x.x
```

### 第三步：安装 MySQL

```bash
# CentOS 7/8
sudo yum install -y mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Ubuntu
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全配置
sudo mysql_secure_installation
# 按提示设置：
# - 设置 root 密码
# - 删除匿名用户：Y
# - 禁止 root 远程登录：Y
# - 删除测试数据库：Y
# - 重新加载权限表：Y
```

### 第四步：安装 Nginx

```bash
# CentOS
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Ubuntu
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 检查 Nginx 是否运行
sudo systemctl status nginx
```

### 第五步：上传代码到服务器

**方案A：使用 Git（推荐）**

```bash
# 在服务器上
cd /var/www
sudo mkdir fish
sudo chown $USER:$USER fish
cd fish

# 如果你的代码在 Git 仓库
git clone your-git-repo .

# 或者直接从本地上传（在你的本地电脑执行）
scp -r F:/fish/* root@your-server-ip:/var/www/fish/
```

**方案B：使用 FTP 工具**
- 使用 FileZilla、WinSCP 等工具
- 上传整个 fish 文件夹到 `/var/www/fish`

### 第六步：配置数据库

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库和表
source /var/www/fish/backend/config/init.sql

# 或者手动执行
mysql -u root -p < /var/www/fish/backend/config/init.sql

# 验证数据库创建成功
mysql -u root -p
> USE fish_db;
> SHOW TABLES;
> exit;
```

### 第七步：配置后端

```bash
# 进入后端目录
cd /var/www/fish/backend

# 创建 .env 文件
cat > .env << 'EOF'
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=你的MySQL密码
DB_NAME=fish_db
DB_PORT=3306
JWT_SECRET=随机生成一个复杂的密钥例如jf8s9dfj2o3ij4f9dsf
EOF

# 安装依赖
npm install

# 测试启动（测试用）
npm start
# 看到 "✅ 数据库连接成功" 和 "🚀 服务器启动成功！" 表示成功
# 按 Ctrl+C 停止

# 使用 PM2 管理进程（生产环境）
sudo npm install -g pm2

# 启动服务
pm2 start server.js --name fish-backend

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs fish-backend
```

### 第八步：配置 Nginx

```bash
# 创建 Nginx 配置文件
sudo nano /etc/nginx/conf.d/fish.conf

# 复制以下内容（记得修改域名和路径）：
```

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 修改为你的域名或服务器IP

    root /var/www/fish;
    index index.html;

    # 启用 gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # 前端静态文件
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理到后端
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # 缓存静态资源
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
        expires 30d;
        add_header Cache-Control "public";
    }
}
```

```bash
# 测试 Nginx 配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 第九步：修改前端 API 地址

```bash
# 编辑留言板文件
nano /var/www/fish/1122-A-board.html

# 找到第 166 行左右：
# const API_BASE_URL = 'http://localhost:3000/api';

# 修改为（三选一）：
# 1. 使用域名（推荐）
const API_BASE_URL = 'http://your-domain.com/api';

# 2. 使用服务器 IP
const API_BASE_URL = 'http://你的服务器IP/api';

# 3. 使用相对路径（最简单，推荐）
const API_BASE_URL = '/api';
```

### 第十步：配置防火墙

```bash
# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# Ubuntu (ufw)
sudo ufw allow 'Nginx Full'
sudo ufw enable

# 腾讯云安全组
# 在腾讯云控制台添加安全组规则：
# - 允许 TCP 80 端口（HTTP）
# - 允许 TCP 443 端口（HTTPS）
```

### 第十一步：测试访问

```bash
# 1. 测试后端 API
curl http://localhost:3000/health
# 应该返回：{"status":"ok","message":"精灵客栈后端服务运行中"}

# 2. 在浏览器访问
http://your-domain.com
# 或
http://你的服务器IP

# 3. 测试留言板
# 访问 http://your-domain.com/1122-A-board.html
# 尝试发表留言
```

---

## 🔒 配置 HTTPS（强烈推荐）

### 使用 Let's Encrypt 免费证书

```bash
# 安装 certbot
sudo yum install -y certbot python3-certbot-nginx  # CentOS
# 或
sudo apt install -y certbot python3-certbot-nginx  # Ubuntu

# 自动配置 HTTPS
sudo certbot --nginx -d your-domain.com

# 按提示操作：
# 1. 输入邮箱
# 2. 同意服务条款
# 3. 选择是否重定向 HTTP 到 HTTPS（推荐选择重定向）

# 证书自动续期
sudo certbot renew --dry-run

# 设置定时任务自动续期
echo "0 3 * * * certbot renew --quiet" | sudo crontab -
```

### 修改前端 API 地址为 HTTPS

```bash
nano /var/www/fish/1122-A-board.html

# 修改 API_BASE_URL
const API_BASE_URL = 'https://your-domain.com/api';
```

---

## 📊 监控和维护

### 查看服务状态

```bash
# 查看 PM2 进程
pm2 status
pm2 logs fish-backend
pm2 monit

# 查看 Nginx 状态
sudo systemctl status nginx
sudo tail -f /var/log/nginx/fish_access.log
sudo tail -f /var/log/nginx/fish_error.log

# 查看 MySQL 状态
sudo systemctl status mysqld
```

### 备份数据库

```bash
# 手动备份
mysqldump -u root -p fish_db > /backup/fish_$(date +%Y%m%d).sql

# 设置自动备份（每天凌晨2点）
sudo mkdir -p /backup
sudo crontab -e
# 添加以下行：
0 2 * * * /usr/bin/mysqldump -u root -p你的密码 fish_db > /backup/fish_$(date +\%Y\%m\%d).sql
```

### 更新代码

```bash
# 如果使用 Git
cd /var/www/fish
git pull

# 如果修改了后端代码
cd backend
npm install  # 如果有新依赖
pm2 restart fish-backend

# 如果修改了前端代码
# 无需重启，刷新浏览器即可
```

---

## ⚠️ 常见问题

### 1. 502 Bad Gateway
```bash
# 检查后端是否运行
pm2 status
pm2 logs fish-backend

# 检查端口是否正确
netstat -tulpn | grep 3000

# 重启服务
pm2 restart fish-backend
```

### 2. 数据库连接失败
```bash
# 检查 MySQL 是否运行
sudo systemctl status mysqld

# 检查 .env 配置
cat /var/www/fish/backend/.env

# 测试 MySQL 连接
mysql -u root -p fish_db
```

### 3. 留言无法加载
```bash
# 检查浏览器控制台错误
# F12 -> Console

# 检查 API 地址是否正确
# 1122-A-board.html 中的 API_BASE_URL

# 检查 CORS 问题
# 查看后端日志：pm2 logs fish-backend
```

### 4. 权限问题
```bash
# 确保 Nginx 有权限访问文件
sudo chown -R nginx:nginx /var/www/fish  # CentOS
# 或
sudo chown -R www-data:www-data /var/www/fish  # Ubuntu

# 设置正确的权限
sudo chmod -R 755 /var/www/fish
```

---

## 🎯 性能优化建议

1. **启用 HTTP/2**：在 Nginx 配置中添加 `http2`
2. **CDN 加速**：使用腾讯云 CDN 加速静态资源
3. **数据库索引**：已在 SQL 中添加
4. **Redis 缓存**：可选，用于缓存热门数据
5. **图片优化**：压缩图片，使用 WebP 格式

---

## 📞 技术支持

如有问题，可以：
1. 查看日志：`pm2 logs fish-backend`
2. 查看 Nginx 日志：`tail -f /var/log/nginx/fish_error.log`
3. 检查数据库：`mysql -u root -p fish_db`

## 🎉 完成！

现在你的网站应该已经成功部署了！

访问：
- 首页：http://your-domain.com
- 留言板：http://your-domain.com/1122-A-board.html

