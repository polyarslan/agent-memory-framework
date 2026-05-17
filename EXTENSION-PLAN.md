# Agent Memory Framework - 扩展计划

> **版本：** v1.1
> **创建时间：** 2026-05-17
> **状态：** 计划中

---

## 📋 背景

基于 OpenHuman 项目的设计思路，为 Agent Memory Framework 增加以下功能：
1. Auto-fetch — 自动拉取外部数据
2. Token 压缩 — 降低 LLM 成本

**原则：**
- 不破坏现有三层架构
- 模块化，可选启用
- 保持纯 Markdown 核心

---

## 🏗️ 当前结构

```
memory/
├── 00-索引.md
├── 01-原则/
├── 02-技能索引.md
├── 03-项目进展.md
├── 04-raw/             # 原始数据（待整理）
├── 05-工具/
└── 02-skills/
    └── memory-lint/
```

---

## 🎯 Phase 1: Auto-fetch

### 目标

定时拉取外部数据源，自动写入记忆文件。

### 支持的数据源

| 数据源 | API | 输出格式 |
|--------|-----|----------|
| Gmail | Gmail API | `04-raw/email/YYYY-MM-DD.md` |
| Calendar | Google Calendar API | `04-raw/calendar/YYYY-MM-DD.md` |
| GitHub | GitHub API | `04-raw/github/events.md` |
| Notion | Notion API | `04-raw/notion/pages.md` |
| 本地文件 | fs | `04-raw/files/index.md` |

### 配置文件

创建 `auto-fetch.yaml`：

```yaml
# Auto-fetch 配置

# 全局设置
global:
  interval: 20m          # 每 20 分钟拉取一次
  output_dir: memory/04-raw
  max_items: 100        # 每次最多拉取 100 条

# 数据源配置
sources:
  email:
    enabled: false
    provider: gmail
    credentials: ~/.config/gmail-credentials.json
    output: email/YYYY-MM-DD.md
    max_age: 7d         # 只拉取 7 天内的邮件
    
  calendar:
    enabled: false
    provider: google-calendar
    credentials: ~/.config/calendar-credentials.json
    output: calendar/YYYY-MM-DD.md
    max_events: 50
    
  github:
    enabled: false
    provider: github
    token: ${GITHUB_TOKEN}
    repos:
      - owner/repo1
      - owner/repo2
    output: github/events.md
    
  notion:
    enabled: false
    provider: notion
    token: ${NOTION_TOKEN}
    databases:
      - database_id_1
    output: notion/pages.md
    
  files:
    enabled: true
    provider: local
    paths:
      - ~/Documents/notes
      - ~/Projects
    output: files/index.md
    extensions:
      - .md
      - .txt
```

### 工具结构

```
bin/
├── lint.js             # 已有
├── auto-fetch.js       # 新增
└── compress.js         # 新增（Phase 2）

lib/
├── providers/
│   ├── gmail.js
│   ├── calendar.js
│   ├── github.js
│   ├── notion.js
│   └── local.js
└── utils/
    ├── oauth.js
    └── format.js
```

### 输出格式

每个数据源输出 Markdown 文件：

```markdown
# Email - 2026-05-17

> **来源：** Gmail
> **拉取时间：** 2026-05-17 18:00
> **数量：** 15 封

## 未读邮件

### 1. [项目更新] Phase 3 进展
- **发件人：** alice@example.com
- **时间：** 2026-05-17 17:30
- **摘要：** Phase 3 测试完成，150/150 通过...

### 2. [会议邀请] 明天 10:00 产品评审
- **发件人：** bob@example.com
- **时间：** 2026-05-17 16:00
- **摘要：** 请确认参加明天 10:00 的产品评审会议...

---

**自动生成 by Auto-fetch**
```

### 使用方式

```bash
# 手动拉取
node bin/auto-fetch.js

# 指定数据源
node bin/auto-fetch.js --source email

# 定时运行（cron）
*/20 * * * * cd /path/to/memory && node bin/auto-fetch.js
```

### 依赖

- Node.js 18+
- 各 API 的 SDK（可选）
- OAuth 凭证（需要用户配置）

---

## 🎯 Phase 2: Token 压缩

### 目标

压缩长文本，降低 LLM 成本。

### 压缩规则

| 类型 | 原始 | 压缩后 | 压缩率 |
|------|------|--------|--------|
| HTML | `<div class="...">` | Markdown | ~70% |
| 长文本 | 10k tokens | 3k tokens | ~70% |
| URL | `https://...` | `[link]` | ~90% |
| 重复内容 | 多次出现 | 合并 | ~50% |

### 工具结构

```
bin/
└── compress.js

lib/
└── compress/
    ├── html-to-md.js
    ├── truncate.js
    ├── dedupe.js
    └── summarize.js
```

### 使用方式

```bash
# 压缩单个文件
node bin/compress.js input.md output.md

# 压缩目录
node bin/compress.js --dir memory/04-raw

# 指定目标长度
node bin/compress.js --max-tokens 3000 input.md output.md
```

### 压缩流程

```
原始文本
    ↓ HTML → Markdown
    ↓ 去重
    ↓ 截断（保留关键信息）
    ↓ 摘要（可选）
压缩文本（≤3k tokens）
```

### 配置

在 `memory-lint.config.json` 中添加：

```json
{
  "compression": {
    "enabled": true,
    "maxTokens": 3000,
    "preserveStructure": true,
    "summarize": false
  }
}
```

---

## 📅 实施计划

### Phase 1: Auto-fetch

| 步骤 | 任务 | 时间 |
|------|------|------|
| 1.1 | 创建 `auto-fetch.yaml` 配置模板 | 1h |
| 1.2 | 实现 `local` provider（本地文件扫描） | 2h |
| 1.3 | 实现 `github` provider（最常用） | 3h |
| 1.4 | 实现 `gmail` provider（需要 OAuth） | 4h |
| 1.5 | 实现 `calendar` provider | 3h |
| 1.6 | 实现 `notion` provider | 3h |
| 1.7 | 添加定时运行脚本 | 1h |
| 1.8 | 文档和测试 | 2h |

**总计：** ~19h

### Phase 2: Token 压缩

| 步骤 | 任务 | 时间 |
|------|------|------|
| 2.1 | 实现 HTML → Markdown 转换 | 2h |
| 2.2 | 实现智能截断 | 2h |
| 2.3 | 实现去重 | 1h |
| 2.4 | 实现摘要（可选） | 3h |
| 2.5 | 集成到 lint 工具 | 1h |
| 2.6 | 文档和测试 | 2h |

**总计：** ~11h

---

## ⚠️ 注意事项

### 兼容性

- Auto-fetch 输出到 `04-raw/`，不影响现有结构
- Token 压缩是可选的，不强制启用
- 保持纯 Markdown 核心，SQLite 可选

### 安全

- OAuth 凭证不提交到 Git
- 敏感数据加密存储
- 本地文件扫描限制路径范围

### 性能

- Auto-fetch 增量拉取，不重复
- Token 压缩缓存结果
- 大文件分批处理

---

## 📚 参考

- [OpenHuman Memory Tree](https://tinyhumans.gitbook.io/openhuman/features/memory-tree)
- [OpenHuman Auto-fetch](https://tinyhumans.gitbook.io/openhuman/features/integrations/auto-fetch)
- [OpenHuman TokenJuice](https://tinyhumans.gitbook.io/openhuman/features/token-compression)

---

**下一步：** 等待用户确认后开始实施
