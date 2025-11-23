# Chrome DevTools 诊断报告 - 个人主页收藏功能

## 🔍 诊断时间
2025-11-08 17:34 (北京时间)

## 📍 诊断URL
```
https://blog.webster7v7.top/profile/ab040a4d-a026-4d19-b3d3-665342c85521/favorites
```

---

## 🐛 问题症状

### 页面显示
- ✅ 页面成功加载
- ✅ 用户信息显示正常
- ✅ 统计数据显示：文章 1、收藏 3、点赞 3
- ❌ 收藏列表区域显示：**"Unauthorized"**

### 控制台错误
```
[error] Minified React error #418
[error] Failed to load resource: the server responded with a status of 401/500
[error] Error fetching favorites: Failed to fetch favorites
```

---

## 🔍 详细诊断结果

### 网络请求分析

#### 请求 #21 (初始加载)
```
GET /api/user/favorites?userId=ab040a4d-a026-4d19-b3d3-665342c85521
状态: 401 Unauthorized
时间: 09:32:58
响应: {"error":"Unauthorized"}
```

**原因**: 页面加载时用户尚未完成认证（时序问题）

---

#### 请求 #32 (认证)
```
POST https://gagxhuubqmqslwkzndxu.supabase.co/auth/v1/token?grant_type=password
状态: 200 OK
时间: 09:33:09
```

**说明**: 用户随后成功登录

---

#### 请求 #37 (手动重试)
```
GET /api/user/favorites?userId=ab040a4d-a026-4d19-b3d3-665342c85521
状态: 500 Internal Server Error
时间: 09:34:05
响应: {"error":"Failed to fetch favorites"}
```

**关键发现**: 
- ✅ 认证通过（不再是 401）
- ❌ API 内部错误（500）

---

## 🔍 根本原因分析

### 原因 1: 数据库字段不存在（高概率）

我们在代码中添加了以下字段：
```typescript
// 新增字段
- cover_image
- published
- created_at
- updated_at
- category  // ⚠️ 最可疑
```

**问题**: 如果 Supabase 数据库中的 `posts` 表没有这些字段，查询会失败。

**验证方法**:
```sql
-- 在 Supabase SQL Editor 中运行
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'posts' 
  AND table_schema = 'public';
```

**预期字段列表**:
- ✅ id, title, slug, excerpt
- ✅ published_at, views, tags
- ✅ comments_count, likes_count, favorites_count
- ⚠️ **category** (可能缺失)
- ⚠️ **cover_image** (可能缺失)
- ⚠️ **published** (可能缺失)

---

### 原因 2: 外键关系问题（中等概率）

**简化前的语法**:
```typescript
posts!favorites_post_slug_fkey (...)
```

**简化后的语法**:
```typescript
posts (...)
```

**问题**: Supabase 可能无法自动识别 `favorites.post_slug → posts.slug` 的外键关系（因为使用的是 `slug` 而不是 `id`）。

**验证方法**:
```sql
-- 检查外键约束
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'favorites' 
  AND tc.constraint_type = 'FOREIGN KEY';
```

---

### 原因 3: Row Level Security (RLS) 权限问题（低概率）

**可能性**: 新添加的字段可能受 RLS 策略限制。

**验证方法**:
1. 检查 Supabase Dashboard > Authentication > Policies
2. 查看 `posts` 表的 SELECT 策略
3. 确认策略允许读取所有字段

---

## 🔧 推荐修复方案

### 方案 A: 检查数据库结构（首选）

**步骤**:
1. 登录 Supabase Dashboard
2. 打开 SQL Editor
3. 运行以下查询检查字段：

```sql
-- 查看 posts 表结构
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'posts'
ORDER BY ordinal_position;
```

4. **如果缺少字段**，运行迁移：

```sql
-- 添加缺失的字段
ALTER TABLE posts 
  ADD COLUMN IF NOT EXISTS cover_image TEXT,
  ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS category TEXT;
```

---

### 方案 B: 恢复显式外键语法（临时）

如果字段存在，可能是外键问题。临时恢复显式语法：

```typescript
// app/api/user/favorites/route.ts
posts!favorites_post_slug_fkey (
  // 字段列表
)
```

---

### 方案 C: 渐进式字段添加（安全）

先测试基础字段，逐步添加：

**步骤 1**: 最小字段集
```typescript
posts (
  id,
  title,
  slug,
  excerpt,
  published_at,
  views,
  tags
)
```

**步骤 2**: 如果成功，逐个添加新字段
```typescript
posts (
  id,
  title,
  slug,
  excerpt,
  published_at,
  views,
  tags,
  category  // 先只添加 category
)
```

---

## 📋 验证清单

- [ ] 检查 Supabase `posts` 表是否有 `category` 字段
- [ ] 检查 `posts` 表是否有 `cover_image` 字段
- [ ] 检查 `posts` 表是否有 `published` 字段
- [ ] 验证外键关系配置：`favorites.post_slug → posts.slug`
- [ ] 检查 RLS 策略是否允许读取所有字段
- [ ] 查看 Vercel 服务端日志（Function Logs）获取详细错误

---

## 🎯 下一步行动

### 立即执行

1. **查看 Vercel 日志**
   - 访问 Vercel Dashboard
   - 进入项目 > Functions 标签
   - 查看最新的 `/api/user/favorites` 请求日志
   - 获取详细的 Supabase 错误信息

2. **检查数据库结构**
   - 登录 Supabase Dashboard
   - 运行 SQL 查询验证字段
   - 必要时添加缺失字段

3. **回滚测试**
   - 如果问题复杂，可先回滚 select 查询
   - 使用最小字段集测试
   - 逐步添加字段定位问题

---

## 📊 诊断数据

### 认证状态
- ✅ 用户已登录
- ✅ 有效的 Supabase Auth Token
- ✅ Token 包含正确的 user_id: `ab040a4d-a026-4d19-b3d3-665342c85521`
- ✅ Email: `2399880172@qq.com`
- ✅ Role: `authenticated`

### 页面状态
- ✅ 页面 HTML 正常渲染
- ✅ 导航栏正常
- ✅ 用户信息卡片正常
- ✅ 统计数据显示（文章 1, 收藏 3, 点赞 3）
- ❌ 收藏列表内容显示 "Unauthorized"

### API 状态
- ❌ 第一次调用：401 (认证失败 - 时序问题)
- ✅ 用户登录成功
- ❌ 第二次调用：500 (服务端错误 - 当前问题)

---

## 💡 关键洞察

1. **时序问题已解决**: 用户现在已登录，401 错误不再出现
2. **新问题出现**: 500 错误表明 API 代码或数据库结构有问题
3. **最可能原因**: 数据库缺少新添加的字段（特别是 `category`）
4. **需要验证**: Vercel 服务端日志会提供确切的 Supabase 错误信息

---

**生成时间**: 2025-11-08 17:34 CST
**诊断工具**: Chrome DevTools MCP
**状态**: 需要进一步数据库结构验证

