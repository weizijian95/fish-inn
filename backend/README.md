# 精灵客栈后端服务

## 快速开始

### 1. 环境要求

- Node.js 14+ 
- MySQL 5.7+ 或 8.0+
- 腾讯云服务器（已有）

### 2. 安装步骤

#### 第一步：安装 Node.js（如果还没安装）

```bash
# 在你的腾讯云服务器上执行
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 验证安装
node -v
npm -v
```

#### 第二步：安装 MySQL（如果还没安装）

```bash
# CentOS/RHEL
sudo yum install -y mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Ubuntu/Debian
sudo apt update
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# 设置 MySQL root 密码
sudo mysql_secure_installation
```

#### 第三步：创建数据库

```bash
# 登录 MySQL
mysql -u root -p

# 执行初始化 SQL
source /path/to/fish/backend/config/init.sql

# 或者手动执行
mysql -u root -p < /path/to/fish/backend/config/init.sql
```

#### 第四步：配置环境变量

```bash
cd /path/to/fish/backend

# 创建 .env 文件
cat > .env << 'EOF'
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=你的MySQL密码
DB_NAME=fish_db
DB_PORT=3306
JWT_SECRET=随机生成一个复杂的密钥
EOF
```

#### 第五步：安装依赖

```bash
cd /path/to/fish/backend
npm install
```

#### 第六步：启动服务

```bash
# 开发模式（测试用）
npm run dev

# 生产模式
npm start

# 使用 PM2 管理（推荐生产环境）
sudo npm install -g pm2
pm2 start server.js --name fish-backend
pm2 startup  # 设置开机自启
pm2 save
```

### 3. 验证服务

```bash
# 测试健康检查
curl http://localhost:3000/health

# 应该返回：
# {"status":"ok","message":"精灵客栈后端服务运行中"}
```

## API 文档

### 用户相关

#### 注册用户
```
POST /api/users/register
Content-Type: application/json

{
  "nickname": "小鱼",
  "avatar": "fish"
}
```

#### 获取用户信息
```
GET /api/users/:id
```

### 留言相关

#### 获取留言列表
```
GET /api/messages?page=1&limit=50
```

#### 发表留言
```
POST /api/messages
Content-Type: application/json

{
  "userId": 1,
  "nickname": "小鱼",
  "avatar": "fish",
  "content": "这是一条测试留言"
}
```

#### 删除留言
```
DELETE /api/messages/:id?userId=1
```

## 使用 PM2 管理进程

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs fish-backend

# 重启服务
pm2 restart fish-backend

# 停止服务
pm2 stop fish-backend

# 删除服务
pm2 delete fish-backend
```

## 常见问题

### 1. 端口被占用
```bash
# 查看哪个进程占用了 3000 端口
lsof -i :3000
# 或
netstat -tulpn | grep 3000

# 杀死进程
kill -9 <PID>
```

### 2. MySQL 连接失败
- 检查 MySQL 是否运行：`systemctl status mysqld`
- 检查用户名密码是否正确
- 检查防火墙是否阻止连接

### 3. 跨域问题
后端已配置 CORS，如果仍有问题，检查 Nginx 配置。

## 安全建议

1. **修改默认端口**：不要使用 3000，改成其他端口
2. **设置强密码**：数据库密码、JWT_SECRET 都要复杂
3. **定期备份**：定期备份 MySQL 数据库
4. **使用 HTTPS**：配置 SSL 证书
5. **限流防护**：考虑添加请求频率限制

## 数据库备份

```bash
# 备份
mysqldump -u root -p fish_db > backup_$(date +%Y%m%d).sql

# 恢复
mysql -u root -p fish_db < backup_20231221.sql

# 设置定时备份（crontab）
0 2 * * * /usr/bin/mysqldump -u root -p你的密码 fish_db > /backup/fish_$(date +\%Y\%m\%d).sql
```

## 性能优化

1. **使用连接池**：已配置（connectionLimit: 10）
2. **添加索引**：已在关键字段添加索引
3. **启用 gzip**：可在 Nginx 配置
4. **使用缓存**：Redis（可选，后续扩展）

