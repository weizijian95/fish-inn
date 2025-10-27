const express = require('express');
const router = express.Router();
const db = require('../config/database');
const jwt = require('jsonwebtoken');

// 用户注册（新接口 - 需要用户名密码）
router.post('/register', async (req, res) => {
    try {
        const { username, password, nickname, avatar } = req.body;

        // 验证参数
        if (!username || !password || !nickname || !avatar) {
            return res.status(400).json({ error: '用户名、密码、昵称和头像不能为空' });
        }

        // 验证长度
        if (username.length > 50) {
            return res.status(400).json({ error: '用户名不能超过50个字符' });
        }
        if (nickname.length > 50) {
            return res.status(400).json({ error: '昵称不能超过50个字符' });
        }

        // 检查用户名是否已存在
        const [existingUsers] = await db.query(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: '用户名已存在' });
        }

        // 插入用户（密码不加密，因为用户要求不需要安全性）
        const [result] = await db.query(
            'INSERT INTO users (username, password, nickname, avatar) VALUES (?, ?, ?, ?)',
            [username, password, nickname, avatar]
        );

        res.json({
            success: true,
            user: {
                id: result.insertId,
                username,
                nickname,
                avatar
            }
        });
    } catch (error) {
        console.error('注册用户失败:', error);
        res.status(500).json({ error: '注册用户失败' });
    }
});

// 用户登录
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 验证参数
        if (!username || !password) {
            return res.status(400).json({ error: '用户名和密码不能为空' });
        }

        // 查询用户
        const [rows] = await db.query(
            'SELECT id, username, nickname, avatar FROM users WHERE username = ? AND password = ?',
            [username, password]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        const user = rows[0];
        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        
        // 生成 JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            user: user,
            token: token
        });
    } catch (error) {
        console.error('登录失败:', error);
        res.status(500).json({ error: '登录失败' });
    }
});

// 快速注册（无需用户名密码，用于临时用户）
router.post('/quick-register', async (req, res) => {
    try {
        const { nickname, avatar } = req.body;

        // 验证参数
        if (!nickname || !avatar) {
            return res.status(400).json({ error: '昵称和头像不能为空' });
        }

        // 验证昵称长度
        if (nickname.length > 50) {
            return res.status(400).json({ error: '昵称不能超过50个字符' });
        }

        // 插入用户
        const [result] = await db.query(
            'INSERT INTO users (nickname, avatar) VALUES (?, ?)',
            [nickname, avatar]
        );

        const userId = result.insertId;
        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        
        // 生成 JWT token
        const token = jwt.sign(
            { id: userId, username: null },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            user: {
                id: userId,
                nickname,
                avatar
            },
            token: token
        });
    } catch (error) {
        console.error('快速注册失败:', error);
        res.status(500).json({ error: '快速注册失败' });
    }
});

// 修改头像
router.put('/:id/avatar', async (req, res) => {
    try {
        const { id } = req.params;
        const { avatar } = req.body;

        // 验证参数
        if (!avatar) {
            return res.status(400).json({ error: '头像不能为空' });
        }

        // 检查用户是否存在
        const [userRows] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
        if (userRows.length === 0) {
            return res.status(404).json({ error: '用户不存在' });
        }

        // 更新头像
        await db.query(
            'UPDATE users SET avatar = ? WHERE id = ?',
            [avatar, id]
        );

        // 获取更新后的用户信息
        const [updatedUser] = await db.query(
            'SELECT id, username, nickname, avatar FROM users WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            user: updatedUser[0]
        });
    } catch (error) {
        console.error('修改头像失败:', error);
        res.status(500).json({ error: '修改头像失败' });
    }
});

// 修改昵称
router.put('/:id/nickname', async (req, res) => {
    try {
        const { id } = req.params;
        const { nickname } = req.body;

        // 验证参数
        if (!nickname) {
            return res.status(400).json({ error: '昵称不能为空' });
        }

        if (nickname.length > 50) {
            return res.status(400).json({ error: '昵称不能超过50个字符' });
        }

        // 检查用户是否存在
        const [userRows] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
        if (userRows.length === 0) {
            return res.status(404).json({ error: '用户不存在' });
        }

        // 更新昵称
        await db.query(
            'UPDATE users SET nickname = ? WHERE id = ?',
            [nickname, id]
        );

        // 获取更新后的用户信息
        const [updatedUser] = await db.query(
            'SELECT id, username, nickname, avatar FROM users WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            user: updatedUser[0]
        });
    } catch (error) {
        console.error('修改昵称失败:', error);
        res.status(500).json({ error: '修改昵称失败' });
    }
});

// 获取用户信息
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
            'SELECT id, username, nickname, avatar, created_at FROM users WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: '用户不存在' });
        }

        res.json({
            success: true,
            user: rows[0]
        });
    } catch (error) {
        console.error('获取用户信息失败:', error);
        res.status(500).json({ error: '获取用户信息失败' });
    }
});

module.exports = router;

