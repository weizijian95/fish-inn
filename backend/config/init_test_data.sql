-- 初始化测试数据
USE fish_db;

-- 确保fish1用户存在并拥有所有权限
INSERT IGNORE INTO users (username, password, nickname, avatar) 
VALUES ('fish1', 'fish1', 'Fish1', 'https://api.dicebear.com/7.x/avataaars/svg?seed=fish1');

-- 为fish1用户授予所有权限
INSERT IGNORE INTO user_permissions (user_id, permission)
SELECT u.id, '前往1122卧室'
FROM users u 
WHERE u.username = 'fish1';

INSERT IGNORE INTO user_permissions (user_id, permission)
SELECT u.id, '客栈主人'
FROM users u 
WHERE u.username = 'fish1';

-- 插入一些测试题目
INSERT INTO exam_questions (question, option_a, option_b, option_c, option_d, correct_answer) VALUES
('520房间的主要功能是什么？', '存储文件', '爱的测试', '游戏娱乐', '聊天交流', 'B'),
('通过考试可以获得什么权限？', '管理员权限', '卧室访问权限', '以上都是', '没有权限', 'C'),
('客栈主人可以做什么？', '新增题目', '设置考试', '以上都是', '只能参加考试', 'C'),
('考试需要答对多少题才能获得卧室权限？', '3题', '4题', '5题', '6题', 'B'),
('520房间的测试主题是什么？', '数学测试', '爱的测试', '英语测试', '历史测试', 'B'),
('用户权限存储在哪个表中？', 'users', 'user_permissions', 'exam_questions', 'exam_records', 'B'),
('考试设置包括哪些内容？', '题目数量', '权限分数', '以上都是', '只有题目数量', 'C'),
('JWT token用于什么？', '身份验证', '权限验证', '以上都是', '数据加密', 'C'),
('520房间的装饰主题是什么？', '蓝色系', '粉红系', '绿色系', '黄色系', 'B'),
('考试结果包含哪些信息？', '分数', '正确答案', '以上都是', '只有分数', 'C');
