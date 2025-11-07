# 📝 Webster Blog - Next.js 15 博客系统

一个基于 Next.js 15 + Supabase 构建的现代化博客系统，具有完整的内容管理、用户认证、评论系统和管理后台。

## ✨ 主要特性

- 🚀 **Next.js 15** - 使用最新的 App Router 和 React Server Components
- 💾 **Supabase** - PostgreSQL 数据库 + 认证 + 存储
- 🎨 **Tailwind CSS** - 现代化的响应式设计
- 🔐 **完整认证** - 用户注册、登录、个人资料管理
- 💬 **评论系统** - 实时评论和互动
- ❤️ **互动功能** - 点赞、收藏、分享
- 👨‍💼 **管理后台** - 文章、分类、评论、用户管理
- ⚡ **性能优化** - 数据库索引、缓存策略、图片优化
- 📱 **响应式设计** - 完美支持移动端和桌面端

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/blog.git
cd blog
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `docs/ENV_TEMPLATE.md` 中的模板，创建 `.env.local` 文件：

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

详细配置说明：[docs/ENV_SETUP.md](docs/ENV_SETUP.md)

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 📚 完整文档

所有项目文档都已整理在 [`docs/`](docs/) 文件夹中：

### 🎯 快速指南
- [ENV_TEMPLATE.md](docs/ENV_TEMPLATE.md) - 环境变量快速配置模板
- [QUICK_SETUP.md](docs/QUICK_SETUP.md) - 本地开发快速启动指南
- [DEPLOYMENT_FINAL_CHECKLIST.md](docs/DEPLOYMENT_FINAL_CHECKLIST.md) - 完整部署清单（推荐）

### 📖 详细文档
- [PROJECT_SUMMARY.md](docs/PROJECT_SUMMARY.md) - 项目技术架构和功能总览
- [ENV_SETUP.md](docs/ENV_SETUP.md) - 环境变量详细配置说明
- [DATABASE_SETUP.md](docs/DATABASE_SETUP.md) - 数据库设置和迁移指南

### 🚀 部署指南
- [GITHUB_UPLOAD_GUIDE.md](docs/GITHUB_UPLOAD_GUIDE.md) - GitHub 上传完整教程
- [VERCEL_DEPLOYMENT_CHECKLIST.md](docs/VERCEL_DEPLOYMENT_CHECKLIST.md) - Vercel 部署详细清单
- [SUPABASE_FINAL_SETUP.md](docs/SUPABASE_FINAL_SETUP.md) - Supabase 最终配置指南
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - 通用部署说明

## 🏗️ 技术栈

- **前端框架**: Next.js 15 (App Router)
- **UI 库**: React 19
- **样式**: Tailwind CSS 4
- **语言**: TypeScript 5
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **存储**: Supabase Storage
- **部署**: Vercel

## 📦 主要功能模块

### 用户端
- ✅ 文章浏览和搜索
- ✅ 分类和标签导航
- ✅ 用户注册和登录
- ✅ 评论和互动（点赞、收藏）
- ✅ 个人主页和资料管理
- ✅ 自定义头像上传

### 管理端
- ✅ 文章管理（Markdown 编辑器）
- ✅ 分类和标签管理
- ✅ 评论审核和管理
- ✅ 用户管理
- ✅ 项目展示管理
- ✅ 外链导航管理
- ✅ 个人链接管理
- ✅ 仪表板数据统计

## ⚡ 性能优化

- **React Cache** - 请求去重和缓存
- **unstable_cache** - 服务端数据缓存
- **数据库索引** - 8+ 个性能索引
- **RPC 函数** - 减少 N+1 查询问题
- **图片优化** - WebP/AVIF 格式，自动压缩
- **静态资源缓存** - 长期缓存策略
- **Webpack 优化** - 包体积优化

## 🔧 开发命令

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# 包分析
npm run analyze
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

- 作者: Your Name
- 邮箱: your.email@example.com
- 网站: https://your-website.com

---

**开始使用**: 查看 [docs/QUICK_SETUP.md](docs/QUICK_SETUP.md)  
**部署指南**: 查看 [docs/DEPLOYMENT_FINAL_CHECKLIST.md](docs/DEPLOYMENT_FINAL_CHECKLIST.md)  
**项目详情**: 查看 [docs/PROJECT_SUMMARY.md](docs/PROJECT_SUMMARY.md)
