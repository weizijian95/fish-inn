const express = require('express');
const router = express.Router();
const db = require('../config/database');
const jwt = require('jsonwebtoken');

// 中间件：验证JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: '需要登录' });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token无效' });
        }
        req.user = user;
        next();
    });
};

// 中间件：检查客栈主人权限
const checkAdminPermission = async (req, res, next) => {
    try {
        const [permissions] = await db.query(
            'SELECT permission FROM user_permissions WHERE user_id = ? AND permission = ?',
            [req.user.id, '客栈主人']
        );
        
        if (permissions.length === 0) {
            return res.status(403).json({ error: '需要客栈主人权限' });
        }
        
        next();
    } catch (error) {
        console.error('检查权限失败:', error);
        res.status(500).json({ error: '权限检查失败' });
    }
};

// 获取用户权限
router.get('/exam/users/:id/permissions', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // 验证用户ID
        if (parseInt(id) !== req.user.id) {
            return res.status(403).json({ error: '无权访问其他用户信息' });
        }

        const [permissions] = await db.query(
            'SELECT permission FROM user_permissions WHERE user_id = ?',
            [id]
        );

        res.json({
            success: true,
            permissions: permissions.map(p => p.permission)
        });
    } catch (error) {
        console.error('获取用户权限失败:', error);
        res.status(500).json({ error: '获取用户权限失败' });
    }
});

// 新增题目（需要客栈主人权限）
router.post('/exam/questions', authenticateToken, checkAdminPermission, async (req, res) => {
    try {
        const { question, optionA, optionB, optionC, optionD, correctAnswer } = req.body;

        // 验证参数
        if (!question || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
            return res.status(400).json({ error: '所有字段都不能为空' });
        }

        if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
            return res.status(400).json({ error: '正确答案必须是A、B、C或D' });
        }

        // 插入题目
        const [result] = await db.query(
            'INSERT INTO exam_questions (question, option_a, option_b, option_c, option_d, correct_answer) VALUES (?, ?, ?, ?, ?, ?)',
            [question, optionA, optionB, optionC, optionD, correctAnswer]
        );

        res.json({
            success: true,
            questionId: result.insertId
        });
    } catch (error) {
        console.error('新增题目失败:', error);
        res.status(500).json({ error: '新增题目失败' });
    }
});

// 获取所有题目（需要客栈主人权限）
router.get('/exam/questions', authenticateToken, checkAdminPermission, async (req, res) => {
    try {
        const [questions] = await db.query(
            'SELECT id, question, option_a, option_b, option_c, option_d, correct_answer, created_at FROM exam_questions ORDER BY created_at DESC'
        );

        res.json({
            success: true,
            questions: questions
        });
    } catch (error) {
        console.error('获取题目列表失败:', error);
        res.status(500).json({ error: '获取题目列表失败' });
    }
});

// 删除题目（需要客栈主人权限）
router.delete('/exam/questions/:id', authenticateToken, checkAdminPermission, async (req, res) => {
    try {
        const { id } = req.params;
        
        // 验证题目ID
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ error: '无效的题目ID' });
        }

        // 检查题目是否存在
        const [existingQuestion] = await db.query(
            'SELECT id FROM exam_questions WHERE id = ?',
            [id]
        );

        if (existingQuestion.length === 0) {
            return res.status(404).json({ error: '题目不存在' });
        }

        // 删除题目
        await db.query(
            'DELETE FROM exam_questions WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: '题目删除成功'
        });
    } catch (error) {
        console.error('删除题目失败:', error);
        res.status(500).json({ error: '删除题目失败' });
    }
});

// 设置考试规则（需要客栈主人权限）
router.post('/exam/settings', authenticateToken, checkAdminPermission, async (req, res) => {
    try {
        const { questionCount, bedroomPermissionScore, adminPermissionScore } = req.body;

        // 验证参数
        if (!questionCount || !bedroomPermissionScore || !adminPermissionScore) {
            return res.status(400).json({ error: '所有字段都不能为空' });
        }

        if (questionCount < 1 || questionCount > 20) {
            return res.status(400).json({ error: '题目数量必须在1-20之间' });
        }

        if (bedroomPermissionScore < 1 || bedroomPermissionScore > questionCount) {
            return res.status(400).json({ error: '卧室权限分数不能超过题目总数' });
        }

        if (adminPermissionScore < 1 || adminPermissionScore > questionCount) {
            return res.status(400).json({ error: '管理员权限分数不能超过题目总数' });
        }

        // 更新或插入设置
        await db.query(
            'INSERT INTO exam_settings (question_count, bedroom_permission_score, admin_permission_score) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE question_count = VALUES(question_count), bedroom_permission_score = VALUES(bedroom_permission_score), admin_permission_score = VALUES(admin_permission_score)',
            [questionCount, bedroomPermissionScore, adminPermissionScore]
        );

        res.json({
            success: true,
            message: '考试设置保存成功'
        });
    } catch (error) {
        console.error('保存考试设置失败:', error);
        res.status(500).json({ error: '保存考试设置失败' });
    }
});

// 获取考试设置
router.get('/exam/settings', async (req, res) => {
    try {
        const [settings] = await db.query(
            'SELECT question_count, bedroom_permission_score, admin_permission_score FROM exam_settings ORDER BY id DESC LIMIT 1'
        );

        if (settings.length === 0) {
            // 返回默认设置
            res.json({
                success: true,
                settings: {
                    questionCount: 5,
                    bedroomPermissionScore: 4,
                    adminPermissionScore: 5
                }
            });
        } else {
            res.json({
                success: true,
                settings: {
                    questionCount: settings[0].question_count,
                    bedroomPermissionScore: settings[0].bedroom_permission_score,
                    adminPermissionScore: settings[0].admin_permission_score
                }
            });
        }
    } catch (error) {
        console.error('获取考试设置失败:', error);
        res.status(500).json({ error: '获取考试设置失败' });
    }
});

// 开始考试
router.post('/exam/start', authenticateToken, async (req, res) => {
    try {
        // 获取考试设置
        const [settings] = await db.query(
            'SELECT question_count FROM exam_settings ORDER BY id DESC LIMIT 1'
        );

        const questionCount = settings.length > 0 ? settings[0].question_count : 5;

        // 随机获取题目（确保不重复）
        const [allQuestions] = await db.query(
            'SELECT id, question, option_a, option_b, option_c, option_d FROM exam_questions'
        );
        
        if (allQuestions.length === 0) {
            return res.status(400).json({ error: '暂无可用题目，请联系管理员添加题目' });
        }
        
        if (allQuestions.length < questionCount) {
            return res.status(400).json({ error: `题目数量不足，当前只有${allQuestions.length}道题目，需要${questionCount}道` });
        }
        
        // 使用Fisher-Yates洗牌算法确保随机且不重复
        const shuffled = [...allQuestions];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        const questions = shuffled.slice(0, questionCount);

        // 格式化题目数据
        const formattedQuestions = questions.map(q => ({
            id: q.id,
            question: q.question,
            optionA: q.option_a,
            optionB: q.option_b,
            optionC: q.option_c,
            optionD: q.option_d
        }));

        res.json({
            success: true,
            exam: {
                id: Date.now(), // 简单的考试ID
                questions: formattedQuestions
            }
        });
    } catch (error) {
        console.error('开始考试失败:', error);
        res.status(500).json({ error: '开始考试失败' });
    }
});

// 提交考试答案
router.post('/exam/submit', authenticateToken, async (req, res) => {
    try {
        const { examId, answers } = req.body;
        const userId = req.user.id;

        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: '答案格式错误' });
        }

        // 获取考试设置
        const [settings] = await db.query(
            'SELECT bedroom_permission_score, admin_permission_score FROM exam_settings ORDER BY id DESC LIMIT 1'
        );

        const bedroomPermissionScore = settings.length > 0 ? settings[0].bedroom_permission_score : 4;
        const adminPermissionScore = settings.length > 0 ? settings[0].admin_permission_score : 5;

        // 获取题目正确答案和内容
        const questionIds = answers.map(a => a.questionId);
        const placeholders = questionIds.map(() => '?').join(',');
        const [questions] = await db.query(
            `SELECT id, question, correct_answer FROM exam_questions WHERE id IN (${placeholders})`,
            questionIds
        );

        const correctAnswers = {};
        const questionContents = {};
        questions.forEach(q => {
            correctAnswers[q.id] = q.correct_answer;
            questionContents[q.id] = q.question;
        });

        // 计算分数
        let score = 0;
        const details = [];

        answers.forEach(answer => {
            const isCorrect = correctAnswers[answer.questionId] === answer.answer;
            if (isCorrect) score++;

            // 获取题目内容用于显示
            details.push({
                questionId: answer.questionId,
                question: questionContents[answer.questionId] || '题目已删除',
                userAnswer: answer.answer,
                correctAnswer: correctAnswers[answer.questionId],
                isCorrect: isCorrect
            });
        });

        // 保存考试记录
        await db.query(
            'INSERT INTO exam_records (user_id, score, total_questions, answers) VALUES (?, ?, ?, ?)',
            [userId, score, answers.length, JSON.stringify(answers)]
        );

        // 检查是否获得新权限
        const newPermissions = [];
        
        // 检查卧室权限
        if (score >= bedroomPermissionScore) {
            const [bedroomPermission] = await db.query(
                'SELECT id FROM user_permissions WHERE user_id = ? AND permission = ?',
                [userId, '前往1122卧室']
            );
            
            if (bedroomPermission.length === 0) {
                await db.query(
                    'INSERT INTO user_permissions (user_id, permission) VALUES (?, ?)',
                    [userId, '前往1122卧室']
                );
                newPermissions.push('前往1122卧室');
            }
        }

        // 检查管理员权限
        if (score >= adminPermissionScore) {
            const [adminPermission] = await db.query(
                'SELECT id FROM user_permissions WHERE user_id = ? AND permission = ?',
                [userId, '客栈主人']
            );
            
            if (adminPermission.length === 0) {
                await db.query(
                    'INSERT INTO user_permissions (user_id, permission) VALUES (?, ?)',
                    [userId, '客栈主人']
                );
                newPermissions.push('客栈主人');
            }
        }

        res.json({
            success: true,
            score: score,
            totalQuestions: answers.length,
            newPermissions: newPermissions,
            details: details
        });
    } catch (error) {
        console.error('提交考试失败:', error);
        res.status(500).json({ error: '提交考试失败' });
    }
});

// 获取考试记录
router.get('/exam/records', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const [records] = await db.query(
            'SELECT id, score, total_questions, created_at FROM exam_records WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        res.json({
            success: true,
            records: records
        });
    } catch (error) {
        console.error('获取考试记录失败:', error);
        res.status(500).json({ error: '获取考试记录失败' });
    }
});

module.exports = router;
