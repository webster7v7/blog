# 🔐 环境变量配置模板

## 📋 快速配置

### 1. 创建 `.env.local` 文件

在项目根目录创建 `.env.local` 文件，复制以下内容：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 2. 获取 Supabase 密钥

1. 访问 https://supabase.com/dashboard
2. 选择你的项目
3. 进入 **Settings** > **API**
4. 复制以下值：

| 配置项 | Supabase Dashboard 位置 | 环境变量名 |
|--------|------------------------|-----------|
| Project URL | API Settings → Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| anon public | API Settings → Project API keys → anon public | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| service_role | API Settings → Project API keys → service_role | `SUPABASE_SERVICE_ROLE_KEY` |

### 3. 填入密钥

将复制的值替换到 `.env.local` 文件中对应的位置。

### 4. 重启开发服务器

```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
```

---

## ⚠️ 安全警告

### 🔴 切勿将 `.env.local` 提交到 Git

- ✅ `.env.local` 已在 `.gitignore` 中排除
- ❌ 不要删除 `.gitignore` 中的 `.env*` 规则
- ❌ 不要使用 `git add -f .env.local` 强制添加

### 🔴 `SUPABASE_SERVICE_ROLE_KEY` 保密

- ❌ 不要在客户端代码中使用
- ❌ 不要在公开的文档中粘贴实际的密钥
- ✅ 仅在服务端 API 路由中使用
- ✅ 此密钥拥有**完整数据库访问权限**

---

## 🚀 Vercel 部署配置

在 Vercel 部署时，需要在 Dashboard 中配置相同的环境变量：

### 配置步骤

1. 访问 https://vercel.com/dashboard
2. 选择你的项目
3. 进入 **Settings** > **Environment Variables**
4. 添加 3 个环境变量（见上表）
5. 为每个变量勾选：
   - ✅ Production
   - ✅ Preview
   - ✅ Development
6. 点击 **Save**
7. 重新部署项目

---

## 📚 详细配置指南

完整的环境变量配置说明请参考：[ENV_SETUP.md](ENV_SETUP.md)

---

**最后更新**: 2025-11-08  
**适用版本**: Next.js 15 + Supabase

