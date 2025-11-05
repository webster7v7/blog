# 部署指南

## 环境变量配置

部署到 Vercel 需要配置以下环境变量：

### 必需的环境变量

在 Vercel Dashboard > 项目 > Settings > Environment Variables 中添加：

```bash
# Supabase 配置
# 从 Supabase Dashboard > Settings > API 获取
# 访问: https://supabase.com/dashboard/project/gagxhuubqmqslwkzndxu/settings/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 网站 URL（可选，默认 localhost:3000）
# 生产环境设置为你的 Vercel 域名
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### 获取 Supabase 凭据

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard/project/gagxhuubqmqslwkzndxu/settings/api)
2. 在 **Project API keys** 部分:
   - **Project URL**: 复制作为 `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: 复制作为 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Vercel 部署步骤

### 1. 项目设置

- **Framework Preset**: Next.js
- **Root Directory**: `blog` （重要！项目在子目录中）
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### 2. 环境变量配置

在 Vercel 中添加上述所有环境变量，应用到所有环境（Production, Preview, Development）。

### 3. 部署后配置

部署成功后，需要更新 Supabase 认证回调 URL：

1. 访问 [Supabase Authentication Settings](https://supabase.com/dashboard/project/gagxhuubqmqslwkzndxu/auth/url-configuration)

2. **Site URL** 设置为:
   ```
   https://your-vercel-domain.vercel.app
   ```

3. **Redirect URLs** 添加:
   ```
   https://your-vercel-domain.vercel.app/auth/callback
   ```
   
   保留现有的 localhost URLs 方便本地开发。

## 验证清单

部署后验证以下功能：

- [ ] 主页正常访问
- [ ] 文章详情页正常显示
- [ ] 用户登录/注册功能
- [ ] 管理后台访问
- [ ] 评论、点赞、收藏功能
- [ ] 外链导航菜单

## 数据库设置

确保已按照 `DATABASE_SETUP.md` 完成 Supabase 数据库表的创建和配置。

