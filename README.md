# PACKLOG 行前志 V1

PACKLOG 行前志是一个场景化出行装备清单应用（Next.js + Supabase + Vercel）。

## 需求文档

- 产品需求主文档：`packlog-prd-v1.md`
- 本仓库后续功能迭代统一以该文档为准

## 当前 V1 能力

- Supabase 邮箱验证码登录
- 邮箱密码登录（开发应急，绕开发信限流）
- 行程创建（多场景模板叠加）
- 模板物品去重生成行程清单
- 清单按分类/容器视图查看与状态更新
- 参考收藏（link/note）

## 本地启动

1. 安装依赖
   ```bash
   npm install
   ```
2. 配置环境变量（`.env.local`）
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
3. 启动开发环境
   ```bash
   npm run dev
   ```

## 数据库迁移与同步

- 首次建表 SQL：`supabase/migrations/20260421073000_init_v1.sql`
- 推荐同步流程：
  1. 开发期使用 MCP `execute_sql` 快速试验
  2. 稳定后把改动整理为 migration 文件并提交
  3. 生产环境只通过 migration 回放，避免手工改表漂移

## 部署到 Vercel

1. 导入 Git 仓库到 Vercel
2. 配置环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`（生产域名）
3. 在 Supabase Auth URL 配置里加入：
   - Site URL（Vercel 生产域名）
   - Redirect URL：`https://your-domain.com/auth/callback`
4. 每次合并前执行：
   ```bash
   npm run lint && npm run build
   ```

## 目录约定

- `src/app`: 页面与路由
- `src/features`: 业务动作与逻辑
- `src/entities`: 核心领域类型
- `src/shared`: 配置与共享工具
- `supabase/migrations`: 数据库迁移脚本
