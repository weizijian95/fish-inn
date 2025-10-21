const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 获取所有留言（分页）
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;

        // 获取留言总数
        const [countResult] = await db.query('SELECT COUNT(*) as total FROM messages');
        const total = countResult[0].total;

        // 获取留言列表
        const [rows] = await db.query(
            `SELECT id, user_id, nickname, avatar, content, created_at 
             FROM messages 
             ORDER BY created_at DESC 
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        res.json({
            success: true,
            data: {
                messages: rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('获取留言列表失败:', error);
        res.status(500).json({ error: '获取留言列表失败' });
    }
});

// 发表留言
router.post('/', async (req, res) => {
    try {
        const { userId, nickname, avatar, content } = req.body;

        // 验证参数
        if (!userId || !nickname || !avatar || !content) {
            return res.status(400).json({ error: '参数不完整' });
        }

        // 验证内容长度
        if (content.length > 500) {
            return res.status(400).json({ error: '留言内容不能超过500个字符' });
        }

        if (content.trim().length === 0) {
            return res.status(400).json({ error: '留言内容不能为空' });
        }

        // 验证用户是否存在
        const [userRows] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) {
            return res.status(404).json({ error: '用户不存在' });
        }

        // 插入留言
        const [result] = await db.query(
            'INSERT INTO messages (user_id, nickname, avatar, content) VALUES (?, ?, ?, ?)',
            [userId, nickname, avatar, content]
        );

        // 获取刚插入的留言
        const [newMessage] = await db.query(
            'SELECT id, user_id, nickname, avatar, content, created_at FROM messages WHERE id = ?',
            [result.insertId]
        );

        res.json({
            success: true,
            message: newMessage[0]
        });
    } catch (error) {
        console.error('发表留言失败:', error);
        res.status(500).json({ error: '发表留言失败' });
    }
});

// 删除留言
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: '缺少用户ID' });
        }

        // 检查留言是否存在且属于该用户
        const [rows] = await db.query(
            'SELECT id, user_id FROM messages WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: '留言不存在' });
        }

        if (rows[0].user_id !== parseInt(userId)) {
            return res.status(403).json({ error: '无权删除此留言' });
        }

        // 删除留言
        await db.query('DELETE FROM messages WHERE id = ?', [id]);

        res.json({
            success: true,
            message: '留言已删除'
        });
    } catch (error) {
        console.error('删除留言失败:', error);
        res.status(500).json({ error: '删除留言失败' });
    }
});

// 获取单条留言
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
            'SELECT id, user_id, nickname, avatar, content, created_at FROM messages WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: '留言不存在' });
        }

        res.json({
            success: true,
            message: rows[0]
        });
    } catch (error) {
        console.error('获取留言失败:', error);
        res.status(500).json({ error: '获取留言失败' });
    }
});

module.exports = router;

