# Vercel 部署指南

## 方式一：通过 Vercel CLI 部署（推荐）

### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

### 2. 登录 Vercel

```bash
vercel login
```

### 3. 部署项目

在项目目录中执行：

```bash
cd blog
vercel
```

按照提示操作：
- Set up and deploy? **Y**
- Which scope? 选择你的账户
- Link to existing project? **N**
- What's your project's name? **blog** (或自定义名称)
- In which directory is your code located? **./** (默认)
- Want to override the settings? **N**

### 4. 配置环境变量

部署成功后，添加环境变量：

```bash
# 方式 A：通过 CLI 添加
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_SITE_URL

# 方式 B：通过 Dashboard
# 访问 https://vercel.com/dashboard
# 进入项目 > Settings > Environment Variables
```

### 5. 重新部署以应用环境变量

```bash
vercel --prod
```

## 方式二：通过 GitHub 部署

### 前提条件

1. 确保 GitHub 仓库存在并可访问
2. 如果仓库不存在，创建新仓库：
   - 访问 https://github.com/new
   - Repository name: `blog`
   - 点击 Create repository

### 推送代码到 GitHub

```bash
# 如果需要重新配置远程仓库
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/blog.git

# 推送代码
git push -u origin master
```

### 在 Vercel 导入项目

1. 访问 https://vercel.com/new
2. 选择 Import Git Repository
3. 选择你的 GitHub 仓库
4. 配置项目：
   - Framework Preset: **Next.js**
   - Root Directory: **blog**
   - Build Command: `npm run build`（默认）
   - Output Directory: `.next`（默认）

5. 添加环境变量：
   ```
   NEXT_PUBLIC_SUPABASE_URL=你的_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
   ```

6. 点击 Deploy

## 获取 Supabase 凭据

访问 Supabase Dashboard:
https://supabase.com/dashboard/project/gagxhuubqmqslwkzndxu/settings/api

复制：
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 部署后配置

### 更新 Supabase 认证回调 URL

1. 获取 Vercel 部署域名（例如：https://blog-xxx.vercel.app）

2. 访问 Supabase Authentication Settings:
   https://supabase.com/dashboard/project/gagxhuubqmqslwkzndxu/auth/url-configuration

3. 添加 Redirect URL:
   ```
   https://your-vercel-domain.vercel.app/auth/callback
   ```

4. 更新 Site URL:
   ```
   https://your-vercel-domain.vercel.app
   ```

## 验证清单

- [ ] 网站可以访问
- [ ] 主页正常显示
- [ ] 文章详情页可以打开
- [ ] 用户可以注册/登录
- [ ] 管理后台可以访问（`/admin`）
- [ ] 评论功能正常
- [ ] 点赞/收藏功能正常
- [ ] 外链导航菜单显示正常

## 常见问题

### Q: 构建失败 "Cannot find module"

**A:** 确保所有依赖都在 `package.json` 中。运行本地构建测试：
```bash
npm run build
```

### Q: 环境变量未生效

**A:** 
1. 检查环境变量名称是否正确（必须以 `NEXT_PUBLIC_` 开头）
2. 在 Vercel Dashboard 中重新部署
3. 清除构建缓存：Deployments > ... > Redeploy

### Q: 认证回调失败

**A:**
1. 确认 Supabase Redirect URLs 包含你的 Vercel 域名
2. URL 必须完全匹配，包括 `https://` 和 `/auth/callback`
3. 保存后可能需要几分钟生效

## 自定义域名（可选）

在 Vercel Dashboard:
1. 进入项目 > Settings > Domains
2. 添加自定义域名
3. 按照提示配置 DNS
4. 更新 Supabase 认证 URLs（添加自定义域名）

## 性能优化建议

- 启用 Vercel Analytics
- 配置图片优化
- 启用 Edge Functions（如需要）
- 配置缓存策略

更多信息参考：
- Vercel 文档：https://vercel.com/docs
- Next.js 部署：https://nextjs.org/docs/deployment

