const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 创建或获取用户
router.post('/register', async (req, res) => {
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

        res.json({
            success: true,
            user: {
                id: result.insertId,
                nickname,
                avatar
            }
        });
    } catch (error) {
        console.error('创建用户失败:', error);
        res.status(500).json({ error: '创建用户失败' });
    }
});

// 获取用户信息
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
            'SELECT id, nickname, avatar, created_at FROM users WHERE id = ?',
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

