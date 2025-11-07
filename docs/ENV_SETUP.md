# 环境变量配置指南

## 📋 必需的环境变量

创建 `.env.local` 文件（在项目根目录），添加以下配置：

```bash
# Supabase 配置
# 从 Supabase Dashboard > Project Settings > API 获取

# 公开的匿名密钥（可在客户端使用）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# ⚠️ 服务角色密钥（仅在服务端使用，切勿暴露给客户端）
# 用于管理员功能，如：
# - 获取用户邮箱（auth.admin.listUsers）
# - 批量用户管理
# - 跳过 RLS（Row Level Security）
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ⚡ Supabase 连接池配置（性能优化 - 可选但强烈推荐）
# Transaction Mode（事务模式）- 推荐用于大多数 API Routes
# 端口 6543，使用 PgBouncer 连接池，适合短连接和高并发
# DATABASE_URL="postgres://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Session Mode（会话模式）- 用于需要预处理语句或事务的场景
# 端口 5432，适合长连接和复杂查询
# DATABASE_URL_SESSION="postgres://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

---

## ⚡ 连接池配置详解（性能优化）

### 为什么需要连接池？

配置连接池可以显著提升应用性能：

- **减少连接延迟**：复用已建立的数据库连接，避免每次请求都创建新连接
- **提高并发能力**：支持更多同时请求，不受 PostgreSQL 连接数限制
- **降低数据库负载**：减少频繁的连接创建/销毁操作

### Transaction Mode vs Session Mode

#### Transaction Mode（推荐）

```bash
# 端口 6543，适合大多数 Next.js API Routes
DATABASE_URL="postgres://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

**优点**：
- ✅ 高并发支持（单个数据库连接可服务多个客户端）
- ✅ 响应速度快（连接池化）
- ✅ 适合 99% 的 API Routes 场景

**限制**：
- ⚠️ 不支持预处理语句（Prepared Statements）
- ⚠️ 不支持 LISTEN/NOTIFY
- ⚠️ 每个事务结束后会重置 session 状态

#### Session Mode

```bash
# 端口 5432，适合需要事务和复杂查询的场景
DATABASE_URL_SESSION="postgres://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

**优点**：
- ✅ 支持所有 PostgreSQL 特性
- ✅ 适合长连接和复杂事务

**限制**：
- ⚠️ 并发能力受限于数据库连接数
- ⚠️ 可能遇到连接数耗尽问题

### 如何获取连接池 URL？

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Project Settings** > **Database**
4. 在 **Connection string** 部分：
   - 选择 **Transaction** 或 **Session** 模式
   - 复制显示的连接字符串
5. 替换其中的 `[YOUR-PASSWORD]` 为你的数据库密码
6. 添加到 `.env.local` 文件

### 性能提升预期

配置连接池后的性能改进：

| 场景 | 改进幅度 |
|------|---------|
| API 响应时间 | ⬇️ 30-50% |
| 页面切换速度 | ⬆️ 40-60% |
| 并发处理能力 | ⬆️ 10-20x |
| 数据库连接数 | ⬇️ 70-90% |

### ⚠️ 注意事项

1. **密码安全**：连接字符串包含数据库密码，务必：
   - ❌ 不要提交到 Git
   - ✅ 确保 `.env.local` 在 `.gitignore` 中

2. **部署配置**：
   - Vercel/Netlify 等平台需在环境变量中单独配置
   - 生产环境和开发环境可使用不同的连接模式

3. **兼容性**：
   - 现有代码无需修改即可使用连接池
   - Supabase 客户端会自动使用配置的 URL

---

## 🔑 如何获取 Supabase 密钥

### 1. 登录 Supabase Dashboard
访问：https://supabase.com/dashboard

### 2. 选择你的项目

### 3. 获取 API 密钥
导航到：**Project Settings** (设置) > **API**

你会看到以下密钥：

#### **Project URL**（项目 URL）
- 复制到 `NEXT_PUBLIC_SUPABASE_URL`

#### **anon public**（匿名公钥）
- 复制到 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ 安全：可以在客户端使用
- 受 RLS（Row Level Security）策略保护

#### **service_role**（服务角色密钥）
- 复制到 `SUPABASE_SERVICE_ROLE_KEY`
- ⚠️ **重要**：这是超级密钥，拥有**完整数据库访问权限**
- ❌ **禁止**：不要提交到 Git
- ❌ **禁止**：不要在客户端代码中使用
- ✅ **仅用于**：服务端 API 路由和 Server Components

---

## ⚠️ 安全警告

### **切勿将 `service_role` 密钥暴露给客户端！**

❌ **错误示例**：
```typescript
// 客户端组件 - 危险！
'use client';
const client = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY); // ❌ 错误！
```

✅ **正确示例**：
```typescript
// 服务端组件 - 安全
export default async function Page() {
  const adminClient = createAdminClient(); // ✅ 正确！仅在服务端
  // ...
}
```

---

## 🧪 验证配置

启动开发服务器：
```bash
npm run dev
```

### **测试评论管理页面**
访问：http://localhost:3000/admin/comments

如果配置正确，应该能看到：
- ✅ 用户真实用户名
- ✅ 用户邮箱地址
- ✅ 评论内容

如果看到错误 `SUPABASE_SERVICE_ROLE_KEY is not configured`，说明：
- `.env.local` 文件不存在，或
- 密钥名称拼写错误，或
- 需要重启开发服务器（修改 `.env.local` 后必须重启）

---

## 📝 `.gitignore` 配置

确保 `.env.local` 在 `.gitignore` 中（通常 Next.js 项目默认已添加）：

```gitignore
# 环境变量
.env*.local
.env.local
```

---

## 🚀 部署到 Vercel

### 添加环境变量到 Vercel

1. 访问 Vercel Dashboard
2. 选择你的项目
3. **Settings** > **Environment Variables**
4. 添加以下变量：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | (你的 URL) | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (你的 anon key) | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | (你的 service role key) | Production, Preview, Development |

5. 点击 **Save**
6. **重新部署**项目以应用更改

---

## 🆘 常见问题

### Q1: 修改 `.env.local` 后没有生效？
**A**: 需要重启开发服务器：
```bash
# Ctrl+C 停止服务器
npm run dev  # 重新启动
```

### Q2: 报错 "supabaseKey is required"？
**A**: 确保：
1. `.env.local` 文件存在于项目根目录
2. 变量名拼写正确（区分大小写）
3. 密钥值已正确粘贴（无多余空格）
4. 已重启开发服务器

### Q3: 哪些功能需要 `service_role` 密钥？
**A**: 仅管理员功能需要：
- 查看用户邮箱（`/admin/comments`）
- 批量用户管理（`/admin/users`）
- 删除任何用户的内容
- 跳过 RLS 策略的操作

普通用户功能（登录、评论、点赞等）只需要 `anon` 密钥。

---

## ✅ 配置完成检查清单

- [ ] 创建 `.env.local` 文件
- [ ] 添加 `NEXT_PUBLIC_SUPABASE_URL`
- [ ] 添加 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] 添加 `SUPABASE_SERVICE_ROLE_KEY`
- [ ] 确认 `.env.local` 在 `.gitignore` 中
- [ ] 重启开发服务器
- [ ] 测试访问 `/admin/comments`
- [ ] 验证能看到用户邮箱

配置完成后，所有管理员功能应该正常工作！🎉

