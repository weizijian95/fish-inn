const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 日志中间件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// 路由
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');

app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: '精灵客栈后端服务运行中' });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({ error: '接口不存在' });
});

// 错误处理
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: '服务器内部错误' });
});

// 启动服务器
app.listen(PORT, () => {
    console.log('=================================');
    console.log(`🚀 服务器启动成功！`);
    console.log(`📡 监听端口: ${PORT}`);
    console.log(`🌐 本地访问: http://localhost:${PORT}`);
    console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
    console.log('=================================');
});

