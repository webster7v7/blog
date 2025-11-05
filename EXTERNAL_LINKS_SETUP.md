# 外链导航功能部署指南

## 📋 概述

外链导航功能已全部开发完成，现在需要执行数据库迁移来启用此功能。

---

## 🚀 部署步骤

### 步骤 1：执行数据库迁移

1. **登录 Supabase Dashboard**
   - 访问：https://supabase.com/dashboard/project/gagxhuubqmqslwkzndxu
   - 进入 SQL Editor

2. **执行迁移脚本**
   - 打开项目根目录下的 `EXTERNAL_LINKS_MIGRATION.sql` 文件
   - 复制全部内容
   - 粘贴到 Supabase SQL Editor
   - 点击 "Run" 执行

3. **验证迁移结果**
   - 执行以下查询验证表已创建：
     ```sql
     SELECT * FROM public.external_links ORDER BY "order";
     ```
   - 应该能看到 5 条测试数据（GitHub、掘金、Stack Overflow、MDN、CSDN）

---

### 步骤 2：测试前台标签栏

1. **访问首页**
   - 打开：http://localhost:3000
   - 查看 Header 下方是否显示外链标签栏
   - 应该能看到 5 个外链标签

2. **测试交互**
   - ✅ 点击任一外链，应该在新窗口打开
   - ✅ 悬停时应该有颜色和图标动画效果
   - ✅ 响应式测试：调整浏览器宽度，标签栏应该支持水平滚动

---

### 步骤 3：测试管理后台

1. **访问管理页面**
   - 以管理员身份登录
   - 访问：http://localhost:3000/admin/external-links
   - 应该能看到外链管理页面

2. **测试 CRUD 功能**

   **创建外链：**
   - ✅ 点击"添加外链"按钮
   - ✅ 填写表单（名称、URL、图标、顺序）
   - ✅ 点击"创建外链"
   - ✅ 验证外链出现在列表中

   **编辑外链：**
   - ✅ 点击某个外链的"编辑"按钮
   - ✅ 修改信息并保存
   - ✅ 验证修改已生效

   **删除外链：**
   - ✅ 点击某个外链的"删除"按钮
   - ✅ 确认删除对话框
   - ✅ 验证外链已从列表中移除

   **拖拽排序：**
   - ✅ 拖动外链行到不同位置
   - ✅ 验证排序已更新
   - ✅ 刷新页面，验证排序被持久化

   **显示/隐藏切换：**
   - ✅ 点击"眼睛"图标切换可见性
   - ✅ 访问首页，验证隐藏的外链不显示
   - ✅ 取消隐藏，验证外链重新显示

---

## 📁 文件清单

### 新创建的文件（13 个）

1. `blog/EXTERNAL_LINKS_MIGRATION.sql` - 数据库迁移脚本
2. `blog/types/external-link.ts` - 外链类型定义
3. `blog/components/ExternalLinksBar.tsx` - 前台标签栏组件
4. `blog/app/api/external-links/route.ts` - 公开 API
5. `blog/app/api/admin/external-links/route.ts` - 管理员 API（创建）
6. `blog/app/api/admin/external-links/[id]/route.ts` - 管理员 API（更新/删除）
7. `blog/app/api/admin/external-links/reorder/route.ts` - 管理员 API（排序）
8. `blog/app/admin/external-links/page.tsx` - 管理后台主页面
9. `blog/components/admin/ExternalLinksList.tsx` - 外链列表组件
10. `blog/components/admin/ExternalLinkForm.tsx` - 外链表单组件
11. `blog/EXTERNAL_LINKS_SETUP.md` - 部署指南（本文件）

### 修改的文件（3 个）

1. `blog/types/database.ts` - 添加了 `external_links` 表类型
2. `blog/app/layout.tsx` - 集成了 `ExternalLinksBar` 组件，调整了主内容区顶部间距
3. `blog/app/admin/layout.tsx` - 添加了"外链导航"菜单项

---

## 🎨 设计特点

### 前台标签栏
- 🔗 固定在 Header 下方（`top-[73px]`）
- 🎭 半透明毛玻璃效果
- 🎨 紫粉渐变主题
- 📱 响应式水平滚动
- 🌙 深色模式支持
- ✨ 图标 + 文字 + 悬停动画

### 管理后台
- 📊 表格化展示外链列表
- 🖱️ 拖拽排序功能
- 👁️ 显示/隐藏快速切换
- 📝 模态表单编辑
- 🗑️ 删除确认对话框
- 🎯 图标选择器（30+ 常用图标）

---

## 🔧 技术栈

- **框架**：Next.js 15 App Router
- **数据库**：Supabase PostgreSQL
- **UI**：Tailwind CSS 4 + Framer Motion
- **图标**：Lucide React
- **通知**：Sonner
- **权限**：基于 Supabase Auth + RLS

---

## 📱 支持的图标

管理后台提供 30+ 常用图标选择：

- **社交媒体**：Github, Twitter, Facebook, Linkedin, Instagram, Youtube
- **通用**：Link, ExternalLink, Globe, Mail, Home, User, Users
- **内容**：Code, Book, BookOpen, FileText, Image, Video, Music
- **其他**：Star, Heart, Bookmark, Gem, Box, Archive, Package, ShoppingCart, Briefcase, Settings

---

## 🔒 权限控制

- **公开访问**：所有用户可以查看可见的外链（`GET /api/external-links`）
- **管理员专属**：
  - 创建外链（`POST /api/admin/external-links`）
  - 编辑外链（`PATCH /api/admin/external-links/[id]`）
  - 删除外链（`DELETE /api/admin/external-links/[id]`）
  - 排序外链（`PATCH /api/admin/external-links/reorder`）
  - 访问管理页面（`/admin/external-links`）

---

## 🐛 故障排除

### 问题 1：前台不显示标签栏
- **原因**：数据库迁移未执行或没有可见的外链
- **解决**：
  1. 确认已执行 `EXTERNAL_LINKS_MIGRATION.sql`
  2. 确认至少有一条 `is_visible = true` 的外链

### 问题 2：管理页面显示 403 错误
- **原因**：当前用户不是管理员
- **解决**：在 Supabase SQL Editor 中执行：
  ```sql
  UPDATE public.profiles 
  SET role = 'admin' 
  WHERE id = 'YOUR_USER_ID';
  ```

### 问题 3：拖拽排序不工作
- **原因**：浏览器不支持或 JavaScript 错误
- **解决**：
  1. 检查浏览器控制台是否有错误
  2. 尝试刷新页面
  3. 使用"显示顺序"字段手动设置

### 问题 4：图标不显示
- **原因**：图标名称不正确或不在 Lucide Icons 库中
- **解决**：从管理后台的下拉列表中选择图标，或设置为"无图标"

---

## ✅ 验收检查清单

- [ ] 数据库迁移成功执行
- [ ] 前台标签栏正常显示
- [ ] 外链点击可以跳转到正确 URL
- [ ] 管理员可以添加新外链
- [ ] 管理员可以编辑现有外链
- [ ] 管理员可以删除外链
- [ ] 拖拽排序功能正常
- [ ] 显示/隐藏切换正常
- [ ] 响应式布局在移动端正常
- [ ] 深色模式下显示正常
- [ ] 无 Linter 错误
- [ ] 无 TypeScript 类型错误

---

## 🎉 完成！

外链导航功能已全部实现，enjoy！如有任何问题，请查看控制台日志或联系开发者。

