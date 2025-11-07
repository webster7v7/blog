# 🚀 GitHub + Vercel 快速部署指南

**预计完成时间**: 25-30 分钟  
**适用于**: 首次部署 Next.js 15 + Supabase 项目到 Vercel

---

## 📝 部署流程总览

```
本地准备 → GitHub 上传 → Vercel 部署 → Supabase 配置 → 测试验证
  (5分钟)     (3分钟)       (10分钟)       (7分钟)       (5分钟)
```

---

## ✅ 第一步：本地准备（5 分钟）

### 1.1 验证本地构建

在项目根目录执行：

```bash
# 1. 测试构建
npm run build

# 2. 检查 Lint
npm run lint

# 3. 本地运行（可选）
npm run dev
```

**✅ 预期结果**: 无错误，构建成功

### 1.2 检查环境变量

确认 `.env.local` 文件存在且配置正确：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

⚠️ **重要**: `.env.local` 不应该提交到 Git

---

## ✅ 第二步：上传到 GitHub（3 分钟）

### 2.1 初始化 Git（如果是新项目）

```bash
# 初始化仓库
git init

# 添加所有文件
git add .

# 验证文件列表（确保 .env.local 不在其中）
git status

# 首次提交
git commit -m "Initial commit: Next.js 15 Blog with Supabase"

# 设置主分支
git branch -M main
```

### 2.2 创建 GitHub 仓库

1. 访问 https://github.com/new
2. Repository name: `blog`（或你喜欢的名称）
3. Visibility: **Public**（推荐）或 Private
4. ⚠️ **不要勾选**任何初始化选项
5. 点击 **Create repository**

### 2.3 推送到 GitHub

```bash
# 连接远程仓库（替换为你的 GitHub 用户名）
git remote add origin https://github.com/your-username/blog.git

# 推送代码
git push -u origin main
```

**提示**: 如果遇到认证问题，使用 Personal Access Token 作为密码

### 2.4 验证上传成功

刷新 GitHub 仓库页面，确认：
- ✅ 所有文件已上传
- ✅ `.env.local` **不在**仓库中
- ✅ `node_modules/` **不在**仓库中

---

## ✅ 第三步：部署到 Vercel（10 分钟）

### 3.1 导入 GitHub 仓库

1. 访问 https://vercel.com/new
2. 使用 GitHub 账号登录
3. 点击 **Import Git Repository**
4. 选择刚上传的 `blog` 仓库
5. Framework Preset 自动识别为 **Next.js** ✅

### 3.2 配置环境变量

在 **Environment Variables** 部分添加以下 3 个变量：

| 变量名 | 值 | 从哪里获取 |
|--------|---|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJxxx...` | Supabase Dashboard → Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJxxx...` | Supabase Dashboard → Settings → API → service_role key |

**配置步骤**:
```
1. 点击 "Add Environment Variable"
2. 输入变量名（复制粘贴）
3. 粘贴变量值
4. 勾选 ✅ Production + ✅ Preview + ✅ Development
5. 点击 "Add"
6. 重复添加全部 3 个变量
```

### 3.3 开始部署

1. 点击 **Deploy** 按钮
2. 等待构建完成（约 3-5 分钟）
3. 构建成功后，点击 **Visit** 访问网站

### 3.4 保存部署 URL

**✅ 复制你的 Vercel 部署 URL**，格式如下：
```
https://your-project-name.vercel.app
```

⚠️ **重要**: 这个 URL 在下一步配置 Supabase 时需要使用

---

## ✅ 第四步：配置 Supabase（7 分钟）

### 4.1 更新认证回调 URL

1. 登录 https://supabase.com/dashboard
2. 选择你的项目
3. 进入 **Authentication** → **URL Configuration**
4. 配置以下内容：

**Site URL**:
```
https://your-project-name.vercel.app
```

**Redirect URLs** (添加 2 个):
```
https://your-project-name.vercel.app/auth/callback
https://your-project-name.vercel.app
```

5. 点击 **Save** 保存

### 4.2 执行数据库迁移（仅一次）

1. 打开 Supabase Dashboard → **SQL Editor**
2. 点击 **New query**
3. 打开项目中的 `migrations/010_fix_personal_links_icon_field.sql`
4. 复制全部内容，粘贴到 SQL Editor
5. 点击 **Run**（或按 Ctrl+Enter）
6. ✅ 确认显示 "Success"

### 4.3 配置 Storage RLS 策略

**方法 A: 使用 SQL（推荐，快速）**

在 SQL Editor 中执行：

```sql
-- 允许已认证用户上传文件
CREATE POLICY "Authenticated users can upload to project-files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-files' AND auth.role() = 'authenticated');

-- 允许已认证用户删除文件
CREATE POLICY "Authenticated users can delete from project-files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-files' AND auth.role() = 'authenticated');

-- 允许公开读取文件
CREATE POLICY "Public can read project-files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-files');
```

✅ 确认显示 "Success. No rows returned"

**方法 B: 使用界面（详细步骤见 SUPABASE_FINAL_SETUP.md）**

---

## ✅ 第五步：测试验证（5 分钟）

访问你的 Vercel 部署 URL: `https://your-project-name.vercel.app`

### 5.1 基础功能测试

- [ ] 首页加载正常
- [ ] 文章列表显示
- [ ] 点击文章进入详情页
- [ ] 分类、归档页面正常

### 5.2 认证功能测试

- [ ] 点击"注册"，创建新账号
- [ ] 注册成功（⚠️ 如果失败，检查 Supabase 回调 URL）
- [ ] 登录成功
- [ ] 用户菜单显示正常
- [ ] 登出功能正常

### 5.3 用户功能测试

- [ ] 发布评论成功
- [ ] 点赞文章成功
- [ ] 进入设置页面，上传头像 ⭐
- [ ] 头像显示正常

### 5.4 管理员功能测试（如果是管理员账号）

- [ ] 访问 `/admin` 成功
- [ ] 仪表板数据显示正常
- [ ] 创建项目并上传图标 ⭐
- [ ] 管理外链并上传图标 ⭐

### 5.5 错误检查

打开浏览器控制台（F12 → Console）：

- [ ] 无红色错误
- [ ] 无 401/403 错误
- [ ] 无 500 错误

---

## 🎉 部署完成！

恭喜！你的博客系统现在已经：

- ✅ 部署到 Vercel（全球 CDN 加速）
- ✅ 连接到 Supabase（数据库 + 认证 + 存储）
- ✅ 自动 HTTPS 证书
- ✅ 每次 Git Push 自动部署

---

## 🚨 常见问题快速修复

### ❌ 问题 1: 登录后跳转到 localhost

**原因**: Supabase 回调 URL 配置错误

**解决方案**:
```
1. 检查 Supabase → Authentication → URL Configuration
2. 确认 Redirect URLs 包含: https://your-domain.vercel.app/auth/callback
3. 清除浏览器 Cookie 后重新登录
```

---

### ❌ 问题 2: 图片上传失败（403 Forbidden）

**原因**: Storage RLS 策略未配置

**解决方案**:
```
1. 检查是否执行了第 4.3 步的 SQL 脚本
2. 在 Supabase → Storage → Policies 中验证策略存在
3. 确认用户已登录
```

---

### ❌ 问题 3: 管理后台报错 "function does not exist"

**原因**: 数据库迁移未执行

**解决方案**:
```
1. 检查是否执行了第 4.2 步的迁移脚本
2. 在 SQL Editor 中验证函数是否存在:
   SELECT * FROM pg_proc WHERE proname = 'get_dashboard_stats';
3. 如果不存在，重新执行 migrations/008_admin_performance_optimization.sql
```

---

### ❌ 问题 4: 环境变量未生效（500 错误）

**原因**: Vercel 环境变量配置错误

**解决方案**:
```
1. 检查 Vercel Dashboard → Settings → Environment Variables
2. 确认变量名拼写正确（区分大小写）
3. 确认所有环境都已勾选（Production + Preview + Development）
4. 重新部署: Deployments → ... → Redeploy
```

---

## 📚 详细文档参考

如需更详细的说明，请参考以下文档：

| 文档 | 内容 |
|------|------|
| [GITHUB_UPLOAD_GUIDE.md](GITHUB_UPLOAD_GUIDE.md) | GitHub 上传详细步骤、故障排除 |
| [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) | Vercel CLI 部署、自定义域名 |
| [SUPABASE_FINAL_SETUP.md](SUPABASE_FINAL_SETUP.md) | Supabase 完整配置、RLS 策略详解 |
| [DEPLOYMENT_FINAL_CHECKLIST.md](DEPLOYMENT_FINAL_CHECKLIST.md) | 完整部署检查清单 |
| [ENV_SETUP.md](ENV_SETUP.md) | 环境变量详细说明 |

---

## 🎯 下一步优化（可选）

部署成功后，你可以考虑：

- [ ] 配置自定义域名（Vercel → Settings → Domains）
- [ ] 启用 Vercel Analytics（监控访问量）
- [ ] 设置 GitHub Actions CI/CD
- [ ] 提交站点地图到 Google Search Console
- [ ] 配置错误监控（Sentry）

---

## 💡 日常更新流程

部署完成后，日常更新非常简单：

```bash
# 1. 修改代码
# ... 在本地进行修改 ...

# 2. 提交到 Git
git add .
git commit -m "描述你的修改"

# 3. 推送到 GitHub
git push origin main

# ✅ Vercel 会自动检测推送并重新部署（约 2-3 分钟）
```

---

## 📞 获取帮助

- **项目文档**: 查看 `docs/` 目录下的所有文档
- **Vercel 支持**: https://vercel.com/support
- **Supabase 支持**: https://supabase.com/docs
- **Next.js 文档**: https://nextjs.org/docs

---

**最后更新**: 2025-11-08  
**部署版本**: Next.js 15 + Supabase + Vercel  
**预计完成时间**: 25-30 分钟

🎉 祝部署顺利！

