# ✅ 部署最终检查清单

## 🎯 完整部署流程

本清单涵盖从代码清理到 Vercel 部署的完整流程。

---

## 📋 阶段 1: 本地准备 ✅

### 1.1 文件清理

- [x] 删除 17 个临时 .md 文档
- [x] 删除 3 个调试 .sql 脚本
- [x] 保留 9 个必需文档
- [x] 保留 8 个迁移脚本
- [x] 项目根目录整洁

### 1.2 环境配置

- [ ] 创建 `.env.local` 文件
- [ ] 配置 `NEXT_PUBLIC_SUPABASE_URL`
- [ ] 配置 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] 配置 `SUPABASE_SERVICE_ROLE_KEY`
- [ ] 本地测试通过（`npm run dev`）

### 1.3 代码验证

- [ ] 运行 `npm run build` 无错误
- [ ] 运行 `npm run lint` 无错误
- [ ] 所有页面可访问
- [ ] 管理员功能正常

---

## 📋 阶段 2: GitHub 上传 ⚠️

### 2.1 Git 初始化

- [ ] 执行 `git init`（如果是新项目）
- [ ] 验证 `.gitignore` 配置正确
- [ ] 确认 `.env.local` 不在跟踪中
- [ ] 确认 `node_modules/` 不在跟踪中

### 2.2 首次提交

```bash
□ git add .
□ git status  # 验证文件列表
□ git commit -m "Initial commit: Next.js 15 Blog"
□ git branch -M main
```

### 2.3 连接 GitHub

- [ ] 在 GitHub 创建新仓库
- [ ] ⚠️ 不勾选任何初始化选项
- [ ] 复制仓库 URL
- [ ] 执行 `git remote add origin <URL>`
- [ ] 执行 `git push -u origin main`

### 2.4 验证上传

- [ ] 刷新 GitHub 仓库页面
- [ ] 确认所有文件已上传
- [ ] 确认 `.env.local` **不在**仓库中
- [ ] 确认 `node_modules/` **不在**仓库中
- [ ] README.md 显示正常

**参考文档**: [GITHUB_UPLOAD_GUIDE.md](GITHUB_UPLOAD_GUIDE.md)

---

## 📋 阶段 3: Vercel 部署 ⚠️

### 3.1 连接 Vercel

- [ ] 访问 https://vercel.com/new
- [ ] 选择 "Import Git Repository"
- [ ] 连接你的 GitHub 账号
- [ ] 选择刚上传的仓库
- [ ] Framework Preset 自动识别为 "Next.js"

### 3.2 配置环境变量

**必需的 3 个变量**：

| 变量名 | 值 | 环境 |
|--------|----|----|
| `NEXT_PUBLIC_SUPABASE_URL` | (Supabase Dashboard → API) | ✅ Production + Preview + Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (Supabase Dashboard → API) | ✅ Production + Preview + Development |
| `SUPABASE_SERVICE_ROLE_KEY` | (Supabase Dashboard → API) | ✅ Production + Preview + Development |

配置步骤：
```
□ 点击 "Add Environment Variable"
□ 输入变量名
□ 粘贴变量值
□ 勾选 Production + Preview + Development
□ 点击 "Add"
□ 重复以上步骤添加全部 3 个变量
```

### 3.3 触发部署

- [ ] 点击 "Deploy" 按钮
- [ ] 等待构建完成（约 3-5 分钟）
- [ ] 查看构建日志，确认无错误
- [ ] 点击 "Visit" 访问部署的网站

### 3.4 获取部署 URL

- [ ] 复制 Vercel 提供的 URL
- [ ] 格式: `https://your-project-name.vercel.app`
- [ ] 保存此 URL（后续配置需要）

**参考文档**: [VERCEL_DEPLOYMENT_CHECKLIST.md](VERCEL_DEPLOYMENT_CHECKLIST.md)

---

## 📋 阶段 4: Supabase 配置 ⚠️

### 4.1 更新认证回调 URL

- [ ] 登录 Supabase Dashboard
- [ ] 进入 Authentication → URL Configuration
- [ ] Site URL 设置为: `https://your-project-name.vercel.app`
- [ ] Redirect URLs 添加:
  - `https://your-project-name.vercel.app/auth/callback`
  - `https://your-project-name.vercel.app`
- [ ] 点击 "Save"

### 4.2 执行数据库迁移

- [ ] 打开 Supabase Dashboard → SQL Editor
- [ ] 创建新查询
- [ ] 复制 `migrations/010_fix_personal_links_icon_field.sql` 内容
- [ ] 粘贴并执行
- [ ] 确认显示 "Success"

### 4.3 配置 Storage RLS 策略

#### 方法 A: UI 界面（推荐）

- [ ] Storage → Buckets → project-files → Policies
- [ ] 创建 INSERT 策略:
  - 名称: `Authenticated users can upload to project-files`
  - Target roles: `authenticated`
  - WITH CHECK: `bucket_id = 'project-files' AND auth.role() = 'authenticated'`
- [ ] 创建 DELETE 策略:
  - 名称: `Authenticated users can delete from project-files`
  - Target roles: `authenticated`
  - USING: `bucket_id = 'project-files' AND auth.role() = 'authenticated'`
- [ ] 创建 SELECT 策略（如果不存在）:
  - 名称: `Public can read project-files`
  - Target roles: `public`
  - USING: `bucket_id = 'project-files'`

#### 方法 B: SQL 脚本（快速）

- [ ] 打开 SQL Editor
- [ ] 执行以下脚本:

```sql
CREATE POLICY "Authenticated users can upload to project-files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'project-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete from project-files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'project-files' AND auth.role() = 'authenticated');

CREATE POLICY "Public can read project-files"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'project-files');
```

**参考文档**: [SUPABASE_FINAL_SETUP.md](SUPABASE_FINAL_SETUP.md)

---

## 📋 阶段 5: 功能验证 ⚠️

### 5.1 基础功能

访问: `https://your-project-name.vercel.app`

- [ ] 首页加载正常
- [ ] 文章列表显示
- [ ] 文章详情页可访问
- [ ] 分类页面正常
- [ ] 标签页面正常
- [ ] 归档页面正常

### 5.2 认证功能

- [ ] 用户注册成功
- [ ] 用户登录成功
- [ ] 登出功能正常
- [ ] **没有**重定向到 localhost
- [ ] 登录后个人信息显示正确

### 5.3 用户功能

- [ ] 发布评论成功
- [ ] 点赞文章成功
- [ ] 收藏文章成功
- [ ] 查看个人主页成功
- [ ] 修改个人资料成功
- [ ] 上传头像成功 ⭐

### 5.4 管理员功能

（需要管理员账号）

- [ ] 访问 `/admin` 成功
- [ ] 查看仪表板数据正确
- [ ] 文章管理（增删改查）
- [ ] 分类管理
- [ ] 评论管理（显示用户邮箱）
- [ ] 用户管理
- [ ] 项目管理（上传图标成功）⭐
- [ ] 外链管理（上传图标成功）⭐
- [ ] 个人链接管理（上传图标成功）⭐

### 5.5 性能验证

使用工具: https://pagespeed.web.dev/

- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Total Blocking Time < 300ms
- [ ] Cumulative Layout Shift < 0.1
- [ ] Performance Score > 90

### 5.6 错误检查

打开浏览器控制台（F12）：

- [ ] 无 404 错误
- [ ] 无 401 Unauthorized 错误
- [ ] 无 403 Forbidden 错误
- [ ] 无 500 Internal Server Error
- [ ] 无 JavaScript 错误

---

## 🚨 故障排除

### 问题 1: 环境变量未生效

**症状**: 500 错误, "SUPABASE_URL is not defined"

**解决方案**:
```
1. 检查 Vercel 环境变量拼写
2. 确认所有环境都已勾选
3. 重新部署: Vercel Dashboard → Deployments → Redeploy
```

### 问题 2: 认证重定向失败

**症状**: 登录后跳转到 localhost 或空白页

**解决方案**:
```
1. 检查 Supabase 回调 URL 是否正确
2. 确认 URL 包含 https://
3. 清除浏览器缓存和 Cookie
4. 重新登录
```

### 问题 3: 图片上传 403

**症状**: "Error uploading to storage: 403"

**解决方案**:
```
1. 检查 Storage RLS 策略是否创建
2. 确认用户已登录（authenticated 角色）
3. 检查 bucket_id 拼写是否正确
4. 查看 Supabase Logs 确认具体错误
```

### 问题 4: 管理后台 RPC 错误

**症状**: "function get_dashboard_stats does not exist"

**解决方案**:
```
1. 检查是否执行了所有迁移脚本（004-010）
2. 在 SQL Editor 中验证函数是否存在:
   SELECT * FROM pg_proc WHERE proname = 'get_dashboard_stats';
3. 如果不存在，重新执行对应的迁移脚本
```

---

## 🎉 部署完成

完成所有检查项后，你的博客系统应该：

- ✅ 在 Vercel 上正常运行
- ✅ 连接到 Supabase 数据库
- ✅ 认证功能正常
- ✅ 文件上传正常
- ✅ 性能优化到位
- ✅ 全球 CDN 加速
- ✅ 自动 HTTPS 证书

---

## 📊 部署后优化

### 可选配置

- [ ] 配置自定义域名
- [ ] 启用 Vercel Analytics
- [ ] 设置 GitHub Actions CI/CD
- [ ] 配置错误监控（Sentry）
- [ ] 设置定时任务（Vercel Cron）
- [ ] 启用 Web Vitals 监控

### SEO 优化

- [ ] 提交站点地图到 Google Search Console
- [ ] 配置 robots.txt
- [ ] 添加 Open Graph 标签
- [ ] 配置结构化数据（JSON-LD）

### 安全加固

- [ ] 启用 Vercel 防护（Pro 计划）
- [ ] 配置 CSP（Content Security Policy）
- [ ] 启用 Supabase Row Level Security
- [ ] 定期备份数据库

---

## 📚 相关文档

| 文档 | 用途 |
|------|------|
| [ENV_TEMPLATE.md](ENV_TEMPLATE.md) | 环境变量配置模板 |
| [GITHUB_UPLOAD_GUIDE.md](GITHUB_UPLOAD_GUIDE.md) | GitHub 上传详细指南 |
| [VERCEL_DEPLOYMENT_CHECKLIST.md](VERCEL_DEPLOYMENT_CHECKLIST.md) | Vercel 部署完整清单 |
| [SUPABASE_FINAL_SETUP.md](SUPABASE_FINAL_SETUP.md) | Supabase 最终配置指南 |
| [ENV_SETUP.md](ENV_SETUP.md) | 环境变量详细说明 |
| [../README.md](../README.md) | 项目主文档 |

---

## 📞 获取帮助

- **Next.js 文档**: https://nextjs.org/docs
- **Vercel 文档**: https://vercel.com/docs
- **Supabase 文档**: https://supabase.com/docs
- **项目 Issues**: GitHub Repository → Issues 标签

---

**最后更新**: 2025-11-08  
**部署版本**: Next.js 15 + Supabase + Vercel  
**预计部署时间**: 25-30 分钟

