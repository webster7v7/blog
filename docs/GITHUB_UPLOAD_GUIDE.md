# 📤 GitHub 上传完整指南

## 🎯 目标

将本地项目上传到 GitHub 仓库，为 Vercel 部署做准备。

---

## ✅ 前置检查

在上传前，请确认以下项目：

- [ ] 已删除冗余文件（20个临时文档和脚本）
- [ ] `.gitignore` 文件存在且配置正确
- [ ] `.env.local` 文件**不在** Git 跟踪中
- [ ] `node_modules/` 文件夹**不在** Git 跟踪中
- [ ] 代码已通过测试

---

## 📋 方法 1: 新建 GitHub 仓库（推荐）

### Step 1: 初始化本地 Git 仓库

```bash
# 在项目根目录执行
git init
```

### Step 2: 添加所有文件到暂存区

```bash
git add .
```

### Step 3: 验证将要提交的文件

```bash
# 查看将要提交的文件列表
git status

# ⚠️ 确认以下文件**不在**列表中：
# - .env.local
# - node_modules/
# - .next/
```

**如果看到 `.env.local`**：
```bash
# 停止！检查 .gitignore 是否包含 .env*
cat .gitignore | grep "env"

# 如果没有，手动添加
echo ".env*" >> .gitignore
git add .gitignore
```

### Step 4: 首次提交

```bash
git commit -m "Initial commit: Next.js 15 Blog with Supabase"
```

### Step 5: 设置主分支名称

```bash
git branch -M main
```

### Step 6: 在 GitHub 创建远程仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `blog`（或你喜欢的名称）
   - **Description**: "Next.js 15 博客系统 with Supabase"
   - **Visibility**: Public 或 Private（推荐 Public）
3. ⚠️ **不要**勾选以下选项：
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
4. 点击 **Create repository**

### Step 7: 连接远程仓库

GitHub 会显示连接命令，复制并执行：

```bash
# 替换为你的用户名和仓库名
git remote add origin https://github.com/your-username/blog.git
```

### Step 8: 推送到 GitHub

```bash
git push -u origin main
```

**如果遇到认证问题**：

#### 方法 A: Personal Access Token（推荐）
```bash
# 1. 访问 https://github.com/settings/tokens/new
# 2. 勾选 repo 权限
# 3. 生成 Token
# 4. 使用 Token 作为密码进行推送
```

#### 方法 B: SSH Key
```bash
# 1. 生成 SSH Key
ssh-keygen -t ed25519 -C "your_email@example.com"

# 2. 添加到 GitHub
# 访问 https://github.com/settings/keys
# 点击 "New SSH key"
# 粘贴 ~/.ssh/id_ed25519.pub 内容

# 3. 使用 SSH URL
git remote set-url origin git@github.com:your-username/blog.git
git push -u origin main
```

### Step 9: 验证上传成功

1. 刷新 GitHub 仓库页面
2. 确认文件已上传
3. 检查 `.env.local` **不在**仓库中

---

## 📋 方法 2: 已有 GitHub 仓库

如果你已经有一个空仓库或想更新现有仓库：

```bash
# 添加远程仓库（如果还没添加）
git remote add origin https://github.com/your-username/your-repo.git

# 拉取远程更改（如果远程仓库不为空）
git pull origin main --allow-unrelated-histories

# 添加文件
git add .

# 提交
git commit -m "Clean up and optimize for deployment"

# 推送
git push origin main
```

---

## 🔍 验证清单

上传后，在 GitHub 仓库页面检查：

### ✅ 应该看到的文件

```
✅ app/
✅ components/
✅ lib/
✅ migrations/
✅ public/
✅ types/
✅ README.md
✅ package.json
✅ next.config.ts
✅ tsconfig.json
✅ .gitignore
✅ .vercelignore
✅ ENV_SETUP.md
✅ VERCEL_DEPLOYMENT_CHECKLIST.md
```

### ❌ 不应该看到的文件

```
❌ .env.local
❌ .env
❌ node_modules/
❌ .next/
❌ ADMIN_API_FIX_REPORT.md（已删除）
❌ AVATAR_FEATURE_IMPLEMENTATION.md（已删除）
❌ 其他临时报告文档
```

---

## 🚨 常见问题

### Q1: `git push` 提示 "failed to push"

**原因**: 远程仓库有本地没有的提交

**解决方案**:
```bash
# 方法 1: 拉取并合并
git pull origin main --rebase
git push origin main

# 方法 2: 强制推送（⚠️ 谨慎使用）
git push origin main --force
```

### Q2: 不小心提交了 `.env.local`

**解决方案**:
```bash
# 1. 从 Git 跟踪中移除（但保留本地文件）
git rm --cached .env.local

# 2. 确认 .gitignore 包含 .env*
echo ".env*" >> .gitignore

# 3. 提交更改
git add .gitignore
git commit -m "Remove .env.local from tracking"

# 4. 推送
git push origin main
```

### Q3: `.gitignore` 不生效

**原因**: 文件已经被 Git 跟踪

**解决方案**:
```bash
# 清除 Git 缓存
git rm -r --cached .
git add .
git commit -m "Fix .gitignore"
git push origin main
```

### Q4: 文件太大无法上传

**原因**: GitHub 单文件限制 100MB

**解决方案**:
```bash
# 找出大文件
find . -type f -size +10M

# 将大文件添加到 .gitignore
echo "path/to/large/file" >> .gitignore
```

---

## 📊 Git 分支策略（可选）

如果你想使用多分支开发：

```bash
# 创建开发分支
git checkout -b develop

# 进行开发
# ... 修改代码 ...

# 提交到开发分支
git add .
git commit -m "Feature: Add new feature"
git push origin develop

# 合并到主分支
git checkout main
git merge develop
git push origin main
```

---

## 🔄 日常更新流程

完成初次上传后，日常更新使用以下流程：

```bash
# 1. 查看修改状态
git status

# 2. 添加修改的文件
git add .

# 3. 提交修改
git commit -m "描述你的修改内容"

# 4. 推送到 GitHub
git push origin main
```

---

## 🎉 下一步

GitHub 上传完成后：

1. ✅ 验证仓库内容正确
2. ✅ 确认敏感信息未泄露
3. ➡️ 继续阅读 [VERCEL_DEPLOYMENT_CHECKLIST.md](VERCEL_DEPLOYMENT_CHECKLIST.md)
4. ➡️ 准备部署到 Vercel

---

## 📚 更多资源

- **Git 官方文档**: https://git-scm.com/doc
- **GitHub 快速入门**: https://docs.github.com/en/get-started/quickstart
- **Pro Git 中文版**: https://git-scm.com/book/zh/v2

---

**最后更新**: 2025-11-08  
**适用于**: Git 2.x + GitHub

