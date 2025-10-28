@echo off
echo 启动精灵客栈后端服务...
echo.

cd backend

echo 检查Node.js环境...
node --version
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

echo.
echo 检查依赖包...
if not exist node_modules (
    echo 安装依赖包...
    npm install
)

echo.
echo 启动服务器...
echo 服务器将在 http://localhost:3000 运行
echo 按 Ctrl+C 停止服务器
echo.

npm start
