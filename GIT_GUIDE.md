# Git 使用指南

## 📝 第一次上传代码到GitHub/Gitee

### 方案一：GitHub（推荐）

#### 步骤1：创建GitHub仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角 `+` → `New repository`
3. 填写信息：
   - Repository name: `fish-inn`（或其他名字）
   - Description: `精灵客栈 - 一个温馨的个人网站`
   - Public/Private: 选择公开或私有
   - **不要**勾选 "Add a README file"（我们已经有了）
4. 点击 `Create repository`

#### 步骤2：在本地初始化Git（在Windows本地执行）

```bash
# 1. 打开 PowerShell 或 Git Bash，进入项目目录
cd F:\fish

# 2. 初始化 Git 仓库
git init

# 3. 添加所有文件
git add .

# 4. 查看将要提交的文件（确认没有 .env）
git status

# 5. 提交到本地仓库
git commit -m "Initial commit: 精灵客栈初始版本"

# 6. 添加远程仓库（替换为你的GitHub仓库地址）
git remote add origin https://github.com/你的用户名/fish-inn.git

# 7. 推送到GitHub
git branch -M main
git push -u origin main
```

#### 步骤3：在服务器上拉取代码

```bash
# SSH登录到腾讯云服务器
ssh root@你的服务器IP

# 克隆仓库到服务器
cd /var/www
git clone https://github.com/你的用户名/fish-inn.git fish

# 如果是私有仓库，需要输入GitHub用户名和密码
# 或者配置SSH密钥（见下文）
```

---

### 方案二：Gitee（国内速度快）

#### 步骤1：创建Gitee仓库

1. 登录 [Gitee](https://gitee.com)
2. 点击右上角 `+` → `新建仓库`
3. 填写信息：
   - 仓库名称: `fish-inn`
   - 仓库介绍: `精灵客栈 - 一个温馨的个人网站`
   - 是否公开: 选择公开或私有
4. 点击 `创建`

#### 步骤2：推送代码

```bash
# 在本地 F:\fish 目录
cd F:\fish

# 初始化
git init
git add .
git commit -m "Initial commit: 精灵客栈初始版本"

# 添加Gitee远程仓库
git remote add origin https://gitee.com/你的用户名/fish-inn.git

# 推送
git branch -M main
git push -u origin main
```

#### 步骤3：服务器拉取

```bash
# 在服务器上
cd /var/www
git clone https://gitee.com/你的用户名/fish-inn.git fish
```

---

## 🔑 配置SSH密钥（推荐，避免每次输入密码）

### 在服务器上生成SSH密钥

```bash
# 1. 生成密钥（在服务器上执行）
ssh-keygen -t ed25519 -C "your_email@example.com"
# 一路回车即可

# 2. 查看公钥
cat ~/.ssh/id_ed25519.pub
# 复制输出的内容
```

### 添加到GitHub

1. 登录GitHub
2. 右上角头像 → Settings
3. 左侧菜单 → SSH and GPG keys
4. 点击 `New SSH key`
5. 粘贴公钥，点击 `Add SSH key`

### 添加到Gitee

1. 登录Gitee
2. 右上角头像 → 设置
3. 左侧菜单 → SSH公钥
4. 粘贴公钥，点击 `确定`

### 使用SSH方式克隆

```bash
# GitHub
git clone git@github.com:你的用户名/fish-inn.git fish

# Gitee
git clone git@gitee.com:你的用户名/fish-inn.git fish
```

---

## 🔄 日常开发流程

### 本地修改后推送到远程

```bash
# 1. 查看修改了哪些文件
git status

# 2. 添加修改的文件
git add .
# 或添加特定文件
git add 1122-A-board.html

# 3. 提交到本地
git commit -m "描述你的修改"

# 4. 推送到远程
git push
```

### 服务器拉取最新代码

```bash
# SSH登录服务器
ssh root@你的服务器IP

# 进入项目目录
cd /var/www/fish

# 拉取最新代码
git pull

# 如果修改了后端代码，重启服务
cd backend
npm install  # 如果有新依赖
pm2 restart fish-backend
```

---

## 📋 完整的自动化部署脚本

### 创建部署脚本（在服务器上）

```bash
# 创建部署脚本
nano /var/www/fish/deploy.sh
```

```bash
#!/bin/bash

echo "🚀 开始部署..."

# 进入项目目录
cd /var/www/fish

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull

# 安装后端依赖
echo "📦 安装依赖..."
cd backend
npm install

# 重启后端服务
echo "🔄 重启后端服务..."
pm2 restart fish-backend

# 重启Nginx（如果修改了前端）
echo "🔄 重启Nginx..."
sudo systemctl reload nginx

echo "✅ 部署完成！"
pm2 status
```

```bash
# 赋予执行权限
chmod +x /var/www/fish/deploy.sh

# 以后每次部署只需执行
/var/www/fish/deploy.sh
```

---

## 🎯 常用Git命令

```bash
# 查看状态
git status

# 查看修改内容
git diff

# 查看提交历史
git log --oneline

# 撤销修改（未add）
git checkout -- 文件名

# 撤销add（已add未commit）
git reset HEAD 文件名

# 回退到上一个版本
git reset --hard HEAD^

# 查看远程仓库
git remote -v

# 拉取并合并
git pull

# 只拉取不合并
git fetch
```

---

## ⚠️ 注意事项

### 1. 绝对不要提交敏感信息

```bash
# 如果不小心提交了 .env
git rm --cached backend/.env
git commit -m "Remove .env from git"
git push
```

### 2. 确认 .gitignore 正确

```bash
# 查看哪些文件会被忽略
git status --ignored

# 确保这些在 .gitignore 中：
# - backend/.env
# - node_modules/
# - *.log
# - *.sql
```

### 3. 提交前检查

```bash
# 养成好习惯
git status  # 看看改了什么
git diff    # 看看具体改动
git add .   # 添加文件
git status  # 再次确认
git commit -m "清晰的提交信息"
git push
```

---

## 🌟 示例：完整工作流程

### 本地开发

```bash
# 1. 修改代码
# 编辑 1122-A-board.html

# 2. 测试
# 在浏览器测试功能

# 3. 提交
cd F:\fish
git status
git add 1122-A-board.html
git commit -m "功能：添加留言置顶功能"
git push
```

### 服务器部署

```bash
# SSH登录服务器
ssh root@你的服务器IP

# 一键部署
/var/www/fish/deploy.sh

# 或手动
cd /var/www/fish
git pull
cd backend && npm install
pm2 restart fish-backend
```

---

## 🔧 故障排除

### 问题1：push被拒绝

```bash
# 原因：远程有本地没有的提交
# 解决：先拉取再推送
git pull --rebase
git push
```

### 问题2：合并冲突

```bash
# 1. 拉取时出现冲突
git pull

# 2. 查看冲突文件
git status

# 3. 手动编辑冲突文件，解决冲突标记
# <<<<<<< HEAD
# 你的修改
# =======
# 远程的修改
# >>>>>>> xxx

# 4. 标记为已解决
git add 冲突文件
git commit -m "解决冲突"
git push
```

### 问题3：忘记提交信息

```bash
# 修改最后一次提交信息
git commit --amend -m "新的提交信息"

# 如果已经push，需要强制推送（谨慎使用）
git push -f
```

---

## 📚 学习资源

- [Git官方文档](https://git-scm.com/doc)
- [GitHub指南](https://guides.github.com/)
- [Gitee帮助中心](https://gitee.com/help)

---

**提示**：建议使用GitHub存储代码，国内访问可以考虑Gitee作为镜像。

