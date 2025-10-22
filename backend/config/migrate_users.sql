-- 数据库迁移脚本：为现有用户表添加 username 和 password 字段
-- 使用方法：mysql -u root -p fish_db < migrate_users.sql

USE fish_db;

-- 添加 username 字段（允许为空，用于兼容已有数据）
ALTER TABLE users 
ADD COLUMN username VARCHAR(50) UNIQUE AFTER id;

-- 添加 password 字段（允许为空，用于兼容已有数据）
ALTER TABLE users 
ADD COLUMN password VARCHAR(255) AFTER username;

-- 添加 username 索引
ALTER TABLE users 
ADD INDEX idx_username (username);

-- 迁移完成提示
SELECT '数据库迁移完成！现在用户表支持用户名和密码登录功能。' AS message;
SELECT '注意：已有的用户记录的 username 和 password 字段为 NULL，这些是快速注册的临时用户。' AS note;

