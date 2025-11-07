# 🗄️ Supabase 最终配置指南

## 🎯 目标

完成 Supabase 的最终配置，确保 Vercel 部署后所有功能正常工作。

---

## ✅ 配置清单

### 必需配置（3项）

- [ ] 1. 更新认证回调 URL
- [ ] 2. 执行数据库迁移（010）
- [ ] 3. 配置 Storage RLS 策略

---

## 📋 配置 1: 更新认证回调 URL

### 何时配置

⚠️ **在 Vercel 部署成功后**立即配置（否则登录/注册功能无法使用）

### 配置步骤

1. **获取 Vercel 部署 URL**
   ```
   在 Vercel Dashboard 中查看你的项目 URL
   例如: https://your-project-name.vercel.app
   ```

2. **登录 Supabase Dashboard**
   ```
   访问: https://supabase.com/dashboard
   选择你的项目
   ```

3. **进入认证设置**
   ```
   Navigation: Authentication → URL Configuration
   ```

4. **添加 Site URL**
   ```
   Site URL: https://your-project-name.vercel.app
   ```

5. **添加 Redirect URLs**
   ```
   在 "Redirect URLs" 部分添加:
   
   https://your-project-name.vercel.app/auth/callback
   https://your-project-name.vercel.app
   ```

6. **保存配置**
   ```
   点击 "Save" 按钮
   ```

### 验证

访问你的 Vercel 部署 URL，测试登录/注册功能：
- [ ] 注册新用户成功
- [ ] 登录已有用户成功
- [ ] 登出功能正常
- [ ] 没有重定向到 localhost

---

## 📋 配置 2: 执行数据库迁移

### 迁移状态检查

| 迁移脚本 | 状态 | 说明 |
|---------|------|------|
| `004_projects_system_safe.sql` | ✅ 已执行 | 项目系统 |
| `005_cache_optimization_functions.sql` | ✅ 已执行 | 缓存优化函数 |
| `006_performance_indexes.sql` | ✅ 已执行 | 性能索引 |
| `007_advanced_rpc_functions.sql` | ✅ 已执行 | 高级RPC函数 |
| `008_admin_performance_optimization.sql` | ✅ 已执行 | 管理员性能优化 |
| `009_profile_performance_optimization.sql` | ✅ 已执行 | 用户档案优化 |
| `010_fix_personal_links_icon_field.sql` | ⚠️ **需要执行** | 个人链接图标字段修复 |

### 执行步骤（迁移 010）

1. **登录 Supabase Dashboard**
   ```
   访问: https://supabase.com/dashboard
   选择你的项目
   ```

2. **打开 SQL Editor**
   ```
   Navigation: SQL Editor → 点击 "New query"
   ```

3. **复制迁移脚本**
   ```
   打开项目中的文件:
   migrations/010_fix_personal_links_icon_field.sql
   
   复制全部内容
   ```

4. **粘贴并执行**
   ```
   在 SQL Editor 中粘贴脚本
   点击右下角 "Run" 按钮（或按 Ctrl+Enter）
   ```

5. **验证执行成功**
   ```
   应该看到:
   ✅ Success. 1 row(s) returned
   
   或者类似的成功消息
   ```

### 迁移脚本内容（参考）

```sql
-- 此迁移将 personal_links.icon 从 VARCHAR(50) 改为 TEXT
ALTER TABLE public.personal_links 
  ALTER COLUMN icon TYPE TEXT;

-- 移除 NOT NULL 约束
ALTER TABLE public.personal_links 
  ALTER COLUMN icon DROP NOT NULL;
```

### 验证

在 Supabase Dashboard → Table Editor 中检查：
```
1. 选择 personal_links 表
2. 查看 icon 字段类型: 应该是 "text"
3. 尝试在管理后台创建个人链接并上传自定义图标
```

---

## 📋 配置 3: Storage RLS 策略

### 为什么需要配置

项目使用 Supabase Storage 存储：
- 用户头像
- 项目图标
- 外链图标
- 个人链接图标

没有 RLS 策略会导致：
- ❌ 上传失败（403 Forbidden）
- ❌ 删除失败（403 Forbidden）

### 配置步骤

1. **登录 Supabase Dashboard**
   ```
   访问: https://supabase.com/dashboard
   选择你的项目
   ```

2. **进入 Storage 设置**
   ```
   Navigation: Storage → Buckets → project-files
   点击 "Policies" 标签
   ```

3. **创建 INSERT 策略**
   ```
   点击 "New Policy"
   选择 "For INSERT using" 模板
   
   策略名称:
   Authenticated users can upload to project-files
   
   Target roles:
   [x] authenticated
   
   WITH CHECK 表达式:
   bucket_id = 'project-files' AND auth.role() = 'authenticated'
   
   点击 "Save Policy"
   ```

4. **创建 DELETE 策略**
   ```
   点击 "New Policy"
   选择 "For DELETE using" 模板
   
   策略名称:
   Authenticated users can delete from project-files
   
   Target roles:
   [x] authenticated
   
   USING 表达式:
   bucket_id = 'project-files' AND auth.role() = 'authenticated'
   
   点击 "Save Policy"
   ```

5. **创建 SELECT 策略（如果不存在）**
   ```
   点击 "New Policy"
   选择 "For SELECT using" 模板
   
   策略名称:
   Public can read project-files
   
   Target roles:
   [x] public
   
   USING 表达式:
   bucket_id = 'project-files'
   
   点击 "Save Policy"
   ```

### 使用 SQL 快速创建（推荐）

如果你熟悉 SQL，可以在 SQL Editor 中执行：

```sql
-- 1. INSERT Policy
CREATE POLICY "Authenticated users can upload to project-files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-files' AND auth.role() = 'authenticated');

-- 2. DELETE Policy
CREATE POLICY "Authenticated users can delete from project-files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-files' AND auth.role() = 'authenticated');

-- 3. SELECT Policy（如果不存在）
CREATE POLICY "Public can read project-files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-files');
```

### 验证

在 Vercel 部署的网站上测试：

1. **测试头像上传**
   ```
   登录 → 进入设置页面 → 上传头像
   ✅ 应该上传成功
   ✅ 头像应该立即显示
   ```

2. **测试项目图标上传**
   ```
   登录管理员账号 → Admin → Projects → 创建/编辑项目 → 上传图标
   ✅ 应该上传成功
   ```

3. **测试链接图标上传**
   ```
   Admin → External Links / Personal Links → 上传自定义图标
   ✅ 应该上传成功
   ```

---

## 🔍 完整验证清单

### 认证功能

- [ ] 用户注册成功
- [ ] 用户登录成功
- [ ] 登出成功
- [ ] 没有重定向到 localhost
- [ ] OAuth 登录正常（如果启用）

### 数据库功能

- [ ] 文章列表加载正常
- [ ] 文章详情页可访问
- [ ] 评论功能正常
- [ ] 管理员后台数据正确
- [ ] 个人链接创建成功（文本长度不受限）

### Storage 功能

- [ ] 头像上传成功
- [ ] 头像显示正常
- [ ] 项目图标上传成功
- [ ] 外链图标上传成功
- [ ] 个人链接图标上传成功
- [ ] 旧图片自动删除（头像）

### 性能

- [ ] 首页加载速度快（< 2s）
- [ ] 管理后台响应快
- [ ] 图片加载优化（WebP/AVIF）

---

## 🚨 常见问题

### Q1: 回调 URL 配置后登录仍然失败

**症状**: 登录后跳转到空白页或错误页

**解决方案**:
```
1. 检查 Vercel 环境变量是否正确配置
2. 确认 Supabase 回调 URL 完全匹配（包括 https://）
3. 清除浏览器缓存和 Cookie
4. 重新部署 Vercel 项目
```

### Q2: 迁移脚本执行报错

**症状**: "relation personal_links does not exist"

**解决方案**:
```
确保之前的迁移脚本（004-009）已全部执行
按顺序重新执行所有迁移脚本
```

### Q3: Storage 上传仍然 403

**症状**: RLS 策略已创建但上传仍失败

**解决方案**:
```
1. 检查策略表达式是否正确
2. 确认 bucket_id 为 'project-files'（不是 'projectfiles'）
3. 检查用户是否已登录（authenticated 角色）
4. 查看 Supabase Logs 确认具体错误
```

### Q4: 如何回滚迁移

**症状**: 迁移脚本执行错误，需要回滚

**解决方案**:
```sql
-- 回滚 010 迁移（示例）
ALTER TABLE public.personal_links 
  ALTER COLUMN icon TYPE VARCHAR(50);

ALTER TABLE public.personal_links 
  ALTER COLUMN icon SET NOT NULL;
```

---

## 🎉 配置完成

完成所有配置后，你的 Supabase 应该：

- ✅ 支持 Vercel 部署的认证
- ✅ 包含所有必需的数据库结构
- ✅ 允许用户上传和管理文件
- ✅ 性能优化到位

---

## 📚 相关文档

- **Supabase 认证文档**: https://supabase.com/docs/guides/auth
- **Supabase Storage 文档**: https://supabase.com/docs/guides/storage
- **RLS 策略指南**: https://supabase.com/docs/guides/auth/row-level-security
- **项目环境变量配置**: [ENV_SETUP.md](ENV_SETUP.md)
- **Vercel 部署清单**: [VERCEL_DEPLOYMENT_CHECKLIST.md](VERCEL_DEPLOYMENT_CHECKLIST.md)

---

**最后更新**: 2025-11-08  
**适用于**: Supabase + Next.js 15 + Vercel

