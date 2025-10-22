-- 数据库迁移脚本：修改 avatar 字段长度以支持上传的头像路径
-- 使用方法：mysql -u root -p fish_db < migrate_avatar_length.sql

USE fish_db;

-- 修改 users 表的 avatar 字段长度
ALTER TABLE users 
MODIFY COLUMN avatar VARCHAR(255) NOT NULL;

-- 修改 messages 表的 avatar 字段长度
ALTER TABLE messages 
MODIFY COLUMN avatar VARCHAR(255) NOT NULL;

-- 迁移完成提示
SELECT '数据库迁移完成！avatar 字段已扩展到 255 个字符，现在可以支持上传的头像路径。' AS message;

