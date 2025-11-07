# 🚀 Vercel 部署完整检查清单

## 📋 部署前准备

### 1. 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

#### 必需环境变量 (Required)

```bash
# Supabase 连接配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Next.js 配置
NODE_ENV=production
```

#### 环境变量获取方式

1. **登录 Supabase Dashboard**: https://app.supabase.com
2. **选择您的项目**
3. **点击 Settings > API**
4. 复制以下值:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` (API Keys 部分) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` (API Keys 部分) → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **重要提示**: 
- `SUPABASE_SERVICE_ROLE_KEY` 具有完全访问权限，切勿泄露
- 所有 `NEXT_PUBLIC_*` 前缀的变量会暴露给浏览器，确保不包含敏感信息

---

## 🔧 Vercel 项目配置

### 1. 项目设置

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "devCommand": "npm run dev"
}
```

### 2. 环境变量设置位置

Vercel Dashboard → Your Project → Settings → Environment Variables

为不同环境配置变量：
- ✅ **Production**: 生产环境（必需）
- ⚠️ **Preview**: 预览环境（推荐）
- 🔧 **Development**: 本地开发环境（可选）

---

## 🗄️ Supabase 配置

### 1. 更新 Supabase 回调 URL

在 Supabase Dashboard → Authentication → URL Configuration 中添加：

```
https://your-project-name.vercel.app/auth/callback
https://your-project-name.vercel.app
```

### 2. 数据库迁移检查

确保所有迁移文件已在 Supabase 中执行：

```bash
migrations/
├── 004_projects_system_safe.sql ✅
├── 005_cache_optimization_functions.sql ✅
├── 006_performance_indexes.sql ✅
├── 007_advanced_rpc_functions.sql ✅
├── 008_admin_performance_optimization.sql ✅
├── 009_profile_performance_optimization.sql ✅
└── 010_fix_personal_links_icon_field.sql ⚠️ (需要手动执行)
```

**执行步骤**:
1. Supabase Dashboard → SQL Editor
2. 创建新查询
3. 复制 `migrations/010_fix_personal_links_icon_field.sql` 内容
4. 执行查询

### 3. Storage 配置检查

确保 `project-files` bucket 已配置 RLS 策略：

```sql
-- 1. INSERT Policy: 允许认证用户上传
CREATE POLICY "Authenticated users can upload to project-files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-files');

-- 2. DELETE Policy: 允许认证用户删除
CREATE POLICY "Authenticated users can delete from project-files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-files');

-- 3. SELECT Policy: 允许公开读取
CREATE POLICY "Public can read project-files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-files');
```

---

## 🌐 部署流程

### 方法 1: 通过 Vercel Dashboard（推荐）

1. **登录 Vercel**: https://vercel.com
2. **点击 "Add New" → "Project"**
3. **导入 Git 仓库**（GitHub/GitLab/Bitbucket）
4. **配置环境变量**（见上文）
5. **点击 "Deploy"**

### 方法 2: 通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署到生产环境
vercel --prod

# 配置环境变量（交互式）
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

---

## ✅ 部署后验证

### 1. 功能测试清单

- [ ] **首页加载正常**
- [ ] **文章列表显示正常**
- [ ] **文章详情页可访问**
- [ ] **用户登录/注册功能**
- [ ] **评论功能**
- [ ] **管理员后台访问**
- [ ] **文件上传功能（头像、图标）**
- [ ] **项目展示页**
- [ ] **外链导航页**
- [ ] **个人链接页**

### 2. 性能检查

使用以下工具检查性能：

```bash
# Google PageSpeed Insights
https://pagespeed.web.dev/

# GTmetrix
https://gtmetrix.com/

# WebPageTest
https://www.webpagetest.org/
```

**预期指标**：
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.8s
- Cumulative Layout Shift (CLS): < 0.1

### 3. 错误监控

检查 Vercel Dashboard 中的日志：

Vercel Dashboard → Your Project → Deployments → [Latest] → View Function Logs

---

## 🐛 常见问题排查

### 问题 1: 500 Internal Server Error

**原因**: 环境变量未配置或配置错误

**解决方案**:
```bash
# 检查环境变量
vercel env ls

# 验证 Supabase 连接
curl https://your-project-url.vercel.app/api/health
```

### 问题 2: 401 Unauthorized (Supabase API)

**原因**: `SUPABASE_SERVICE_ROLE_KEY` 未配置或错误

**解决方案**:
1. 检查 Vercel 环境变量是否正确
2. 重新部署项目: `vercel --prod --force`

### 问题 3: 图片上传失败

**原因**: Supabase Storage RLS 策略未配置

**解决方案**:
1. 参考上文 "Storage 配置检查"
2. 在 Supabase Dashboard → Storage → project-files → Policies 中检查策略

### 问题 4: 认证重定向失败

**原因**: Supabase 回调 URL 未配置

**解决方案**:
1. Supabase Dashboard → Authentication → URL Configuration
2. 添加 Vercel 部署 URL

### 问题 5: Next.js 动态参数警告

**原因**: Next.js 15 要求 `await params`

**状态**: ✅ 已修复（Phase 4）

---

## 📊 优化配置

### 1. Vercel 边缘网络（Edge Functions）

项目已启用中间件 (`middleware.ts`) 在 Edge Runtime 运行

**优势**:
- 全球 CDN 加速
- 更低的延迟
- 自动缓存静态资产

### 2. 图片优化

项目已配置 Next.js Image Optimization:

```typescript
// next.config.ts
images: {
  remotePatterns: [{ hostname: '**.supabase.co' }],
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 86400
}
```

### 3. 静态资产缓存

项目已配置长期缓存策略 (`next.config.ts`):

```typescript
headers: async () => [
  {
    source: '/public/:path*',
    headers: [
      { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
    ]
  }
]
```

---

## 📝 部署清单总结

### 必需步骤 ✅

1. [ ] 配置 Vercel 环境变量（3 个）
2. [ ] 更新 Supabase 回调 URL
3. [ ] 执行数据库迁移 `010_fix_personal_links_icon_field.sql`
4. [ ] 配置 Supabase Storage RLS 策略
5. [ ] 部署到 Vercel

### 推荐步骤 ⚠️

6. [ ] 配置自定义域名
7. [ ] 启用 Vercel Analytics
8. [ ] 配置错误监控（Sentry/LogRocket）
9. [ ] 设置 CI/CD 自动部署
10. [ ] 性能测试和优化

---

## 🎉 完成

部署完成后，您的博客将可通过以下 URL 访问：

- **生产环境**: `https://your-project-name.vercel.app`
- **自定义域名**: `https://your-domain.com`（需要配置）

**下一步建议**:
- 监控 Vercel 部署日志
- 使用 Google Search Console 提交站点地图
- 配置 CDN 缓存策略
- 定期备份 Supabase 数据库

---

**维护文档版本**: v1.0  
**最后更新**: 2025-11-08  
**适用于**: Next.js 15 + Supabase + Vercel

