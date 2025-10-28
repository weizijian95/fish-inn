# Fish1管理员设置说明

## 概述

已为fish1用户配置了所有权限，包括：
- ✅ 前往1122卧室权限
- ✅ 客栈主人权限

## 快速设置

### 方法1：一键初始化（推荐）
```bash
mysql -u root -p < backend/config/setup_fish1_admin.sql
```

这个脚本会：
1. 创建所有必要的数据库表
2. 创建fish1用户（如果不存在）
3. 为fish1用户授予所有权限
4. 插入测试题目
5. 显示设置结果

### 方法2：分步执行
```bash
# 1. 运行权限迁移
mysql -u root -p < backend/config/migrate_permissions.sql

# 2. 运行fish1管理员初始化
mysql -u root -p < backend/config/init_fish1_admin.sql

# 3. 运行测试数据初始化
mysql -u root -p < backend/config/init_test_data.sql
```

## 验证设置

运行以下SQL查询来验证fish1用户的权限：

```sql
USE fish_db;

SELECT 
    u.username,
    u.nickname,
    GROUP_CONCAT(up.permission) as permissions
FROM users u
LEFT JOIN user_permissions up ON u.id = up.user_id
WHERE u.username = 'fish1'
GROUP BY u.id, u.username, u.nickname;
```

预期结果：
```
+----------+----------+----------------------------------+
| username | nickname | permissions                      |
+----------+----------+----------------------------------+
| fish1    | Fish1    | 前往1122卧室,客栈主人            |
+----------+----------+----------------------------------+
```

## 功能测试

1. **登录测试**
   - 用户名：`fish1`
   - 密码：`fish1`

2. **权限测试**
   - 进入520房间，应该能看到"新增题目"和"设置考试"按钮
   - 在1122-A页面，应该能成功点击"前往卧室"按钮

3. **管理功能测试**
   - 可以新增题目
   - 可以设置考试规则
   - 可以查看所有题目

## 注意事项

1. 如果fish1用户已存在，脚本会使用`INSERT IGNORE`避免重复创建
2. 权限授予使用`INSERT IGNORE`，不会重复添加相同权限
3. 所有脚本都使用`ON DUPLICATE KEY UPDATE`确保数据一致性

## 文件说明

- `setup_fish1_admin.sql` - 一键初始化脚本（推荐使用）
- `init_fish1_admin.sql` - 仅初始化fish1管理员权限
- `migrate_permissions.sql` - 权限系统数据库迁移
- `init_test_data.sql` - 测试数据和fish1权限初始化
