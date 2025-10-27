const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads/photos');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer 存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名：时间戳 + 随机数 + 原始扩展名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'photo-' + uniqueSuffix + ext);
    }
});

// 文件过滤器 - 只允许图片
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('只允许上传图片文件 (JPEG, PNG, GIF, WebP)'), false);
    }
};

// 配置 multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 限制 10MB
    }
});

// JWT 验证中间件
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: '未授权' });
    }

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT验证失败:', err.message);
            return res.status(403).json({ error: '无效的令牌' });
        }
        console.log('JWT验证成功，用户信息:', user);
        req.user = user;
        next();
    });
}

// 上传照片接口
router.post('/upload', authenticateToken, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '请选择要上传的照片' });
        }

        const { name } = req.body;
        if (!name || !name.trim()) {
            // 删除已上传的文件
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: '请输入照片名称' });
        }

        // 获取用户信息
        const [users] = await db.query('SELECT nickname, avatar FROM users WHERE id = ?', [req.user.id]);
        
        if (users.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: '用户不存在' });
        }

        const user = users[0];
        const photoUrl = `/uploads/photos/${req.file.filename}`;

        // 保存到数据库
        const [result] = await db.query(
            'INSERT INTO photos (user_id, nickname, avatar, name, photo_url) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, user.nickname, user.avatar, name.trim(), photoUrl]
        );

        res.json({
            success: true,
            photo: {
                id: result.insertId,
                name: name.trim(),
                photo_url: photoUrl,
                user_id: req.user.id,
                nickname: user.nickname,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('上传照片失败:', error);
        // 如果有文件上传，删除它
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (e) {
                console.error('删除文件失败:', e);
            }
        }
        res.status(500).json({ error: '上传照片失败' });
    }
});

// 获取所有照片
router.get('/', async (req, res) => {
    try {
        const [photos] = await db.query(
            'SELECT id, user_id, nickname, avatar, name, photo_url, created_at FROM photos ORDER BY created_at DESC'
        );
        res.json(photos);
    } catch (error) {
        console.error('获取照片列表失败:', error);
        res.status(500).json({ error: '获取照片列表失败' });
    }
});

// 获取单张照片详情
router.get('/:id', async (req, res) => {
    try {
        const [photos] = await db.query(
            'SELECT id, user_id, nickname, avatar, name, photo_url, created_at FROM photos WHERE id = ?',
            [req.params.id]
        );

        if (photos.length === 0) {
            return res.status(404).json({ error: '照片不存在' });
        }

        res.json(photos[0]);
    } catch (error) {
        console.error('获取照片详情失败:', error);
        res.status(500).json({ error: '获取照片详情失败' });
    }
});

// 删除照片
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        // 查询照片信息
        const [photos] = await db.query(
            'SELECT user_id, photo_url FROM photos WHERE id = ?',
            [req.params.id]
        );

        if (photos.length === 0) {
            return res.status(404).json({ error: '照片不存在' });
        }

        const photo = photos[0];

        // 检查是否是照片的所有者
        if (photo.user_id !== req.user.id) {
            return res.status(403).json({ error: '只能删除自己的照片' });
        }

        // 从数据库删除
        await db.query('DELETE FROM photos WHERE id = ?', [req.params.id]);

        // 删除文件
        const filePath = path.join(__dirname, '..', photo.photo_url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({ success: true, message: '照片已删除' });
    } catch (error) {
        console.error('删除照片失败:', error);
        res.status(500).json({ error: '删除照片失败' });
    }
});

// 错误处理中间件
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: '文件大小不能超过 10MB' });
        }
        return res.status(400).json({ error: error.message });
    } else if (error) {
        return res.status(400).json({ error: error.message });
    }
    next();
});

module.exports = router;

