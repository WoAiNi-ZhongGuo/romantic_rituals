# Lover · 我们的故事

情侣恋爱记录 PWA，供两人私密使用。

**一句话**：React PWA + Supabase (数据库+存储) + GitHub Actions (自动备份)。总成本 0，无需绑定支付方式。

---

## 功能

| 模块 | 说明 |
|---|---|
| 恋爱天数统计 | 从在一起那天算起，实时显示首页 |
| 纪念日倒数 | 支持公历/农历，可配置每年重复 |
| 共享日记 | 两人都能写，Realtime 即时同步 |
| 共同打卡任务 | 双方分别打卡 |
| 私密相册 | 上传、浏览、下载，每天自动备份到 GitHub |

---

## 技术栈

| 层 | 方案 | 费用 |
|---|---|---|
| 前端 | React 19 + TypeScript + Vite 8 | 免费 |
| UI | Tailwind CSS 4 + Lucide 图标 | 免费 |
| PWA | vite-plugin-pwa，可添加到手机桌面 | 免费 |
| 数据库 | Supabase PostgreSQL (500MB) | 免费 |
| 实时同步 | Supabase Realtime | 免费 |
| 照片缓存 | Supabase Storage (1GB) | 免费 |
| 照片冷备 | GitHub 私有仓库（不限量） | 免费 |
| 定时备份 | GitHub Actions 每天凌晨 3 点 | 免费 |
| 托管 | GitHub Pages | 免费 |
| 鉴权 | 共享密码 | 免费 |
| 绑卡 | 不需要 | — |

---

## 部署步骤

### 1. 创建 Supabase 项目

1. 打开 supabase.com → Sign in（GitHub 账号登录）
2. New Project → 名称 lover，Region 选 Singapore，设好数据库密码
3. 等 1-2 分钟初始化完成
4. 左侧菜单 Project Settings → API，复制：
   - Project URL（https://xxx.supabase.co）
   - anon public key（eyJ...）
5. 左侧菜单 SQL Editor → New query → 粘贴 supabase/schema.sql 全部内容 → Run
6. 左侧菜单 Storage → Create bucket → 名称 photos → Public bucket → 创建
7. 左侧菜单 Project Settings → API → service_role key（仅备份脚本用）

### 2. 配置环境变量

复制 .env.example 为 .env：

`
cp .env.example .env
`

填入你的配置：

| 变量 | 值 |
|---|---|
| VITE_SUPABASE_URL | Supabase Project URL |
| VITE_SUPABASE_ANON_KEY | Supabase anon public key |
| VITE_APP_PASSWORD_HASH | 运行 pnpm hash <密码> 获得 |

### 3. 本地运行

`
pnpm install
pnpm run icons
pnpm dev
`

### 4. 部署到 GitHub Pages

1. 在 GitHub 创建仓库，推送代码到 main 分支
2. 进入仓库 Settings → Secrets and variables → Actions，添加：
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_APP_PASSWORD_HASH
3. Settings → Pages → Source 选择 GitHub Actions
4. 推送到 main，Actions 自动部署

### 5. 配置每日照片备份（可选但推荐）

1. 创建一个新的 GitHub 私有仓库用于存储照片，比如 lover-photos-backup
2. 在 GitHub 生成 Personal Access Token（Settings → Developer settings → Tokens → Fine-grained tokens，权限选 Contents: read/write）
3. 在主仓库 Secrets 中添加：
   - SUPABASE_SERVICE_KEY：Supabase 的 service_role key
   - BACKUP_PAT：上一步生成的 Personal Access Token
   - BACKUP_REPO：用户名/仓库名，如 yourname/lover-photos-backup

配置好后，每天凌晨 3 点（UTC）自动备份未备份的照片到私有仓库。
也可以在 GitHub Actions 页面手动触发 Backup Photos 工作流。

---

## 照片方案

| 类型 | 位置 | 大小 | 用途 |
|---|---|---|---|
| RAW 原档 | 拍摄者电脑硬盘 | 40-75MB/张 | 专业后期/冲印 |
| 分享版 95% | Supabase Storage (1GB) | 4-8MB/张 | 日常查看/下载 |
| 缩略图 | Supabase Storage | ~50KB/张 | 列表快速浏览 |
| 冷备份 | GitHub 私有仓库 | — | 长期存档 |

上传流程：手机拍照 → PWA 生成缩略图+分享版 → 上传到 Supabase Storage → 两人都能看
备份流程：每天凌晨 GitHub Actions 自动下载未备份的照片 → 推送到 GitHub 私有仓库
清理：1GB 空间不够时，在 PWA 相册中删除已备份的旧照片即可（不影响 GitHub 中的备份）

---

## 开发命令

| 命令 | 说明 |
|---|---|
| pnpm dev | 启动开发服务器 |
| pnpm build | 构建生产版本 |
| pnpm run icons | 生成 PWA 图标 |
| pnpm run hash <密码> | 计算密码哈希 |

---

## 数据库表（共 6 张）

- relationship：恋爱信息（start_date）
- anniversaries：纪念日
- diaries：共享日记
- missions：打卡任务定义
- mission_logs：打卡记录
- photos：照片记录

---

MIT