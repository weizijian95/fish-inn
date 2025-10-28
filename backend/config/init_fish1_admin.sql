-- 为fish1用户初始化管理员权限
USE fish_db;

-- 确保fish1用户存在，如果不存在则创建
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

-- 显示fish1用户的权限信息
SELECT 
    u.username,
    u.nickname,
    GROUP_CONCAT(up.permission) as permissions
FROM users u
LEFT JOIN user_permissions up ON u.id = up.user_id
WHERE u.username = 'fish1'
GROUP BY u.id, u.username, u.nickname;
