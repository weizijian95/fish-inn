-- 一键设置fish1用户为管理员
-- 运行此脚本：mysql -u root -p < backend/config/setup_fish1_admin.sql

-- 创建数据库
CREATE DATABASE IF NOT EXISTS fish_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE fish_db;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    nickname VARCHAR(50) NOT NULL,
    avatar VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 留言表
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    avatar VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_created_at (created_at),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户权限表
CREATE TABLE IF NOT EXISTS user_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    permission VARCHAR(100) NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_permission (user_id, permission),
    INDEX idx_user_id (user_id),
    INDEX idx_permission (permission)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 考试题目表
CREATE TABLE IF NOT EXISTS exam_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    option_a VARCHAR(500) NOT NULL,
    option_b VARCHAR(500) NOT NULL,
    option_c VARCHAR(500) NOT NULL,
    option_d VARCHAR(500) NOT NULL,
    correct_answer ENUM('A', 'B', 'C', 'D') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 考试设置表
CREATE TABLE IF NOT EXISTS exam_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_count INT NOT NULL DEFAULT 5,
    bedroom_permission_score INT NOT NULL DEFAULT 4,
    admin_permission_score INT NOT NULL DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 考试记录表
CREATE TABLE IF NOT EXISTS exam_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    answers JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入默认考试设置
INSERT INTO exam_settings (question_count, bedroom_permission_score, admin_permission_score) 
VALUES (5, 4, 5) 
ON DUPLICATE KEY UPDATE 
question_count = VALUES(question_count),
bedroom_permission_score = VALUES(bedroom_permission_score),
admin_permission_score = VALUES(admin_permission_score);

-- 创建fish1用户（如果不存在）
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

-- 插入测试题目
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

-- 显示fish1用户的权限信息
SELECT 
    'fish1用户设置完成' as status,
    u.username,
    u.nickname,
    GROUP_CONCAT(up.permission) as permissions
FROM users u
LEFT JOIN user_permissions up ON u.id = up.user_id
WHERE u.username = 'fish1'
GROUP BY u.id, u.username, u.nickname;
