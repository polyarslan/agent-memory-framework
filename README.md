# Agent Memory Framework

> **框架独立的 AI Agent 记忆系统**

A framework-independent AI Agent memory system built with pure Markdown. Zero database dependency, works with any AI platform.

## 🌟 Why Agent Memory Framework?

### The Problem

- **AI assistants forget everything** when you switch platforms (Claude → GPT → Local)
- **Memory systems are tied to specific frameworks** — can't migrate without losing context
- **Complex databases** make it hard to backup, version control, or simply read your own data

### Our Solution

| Feature | Benefit |
|---------|---------|
| ✅ **Pure Markdown** | Read with any text editor, no database needed |
| ✅ **Three-Layer Architecture** | Clear extraction path from experience to principles |
| ✅ **Framework Independent** | Works with OpenClaw, Claude Code, Cursor, or any AI |
| ✅ **Lint Tools** | Keep your memory healthy with dead-link detection + auto-fix |
| ✅ **Trigger-Based Maintenance** | Write when things change, not on schedule |
| ✅ **Git-Friendly** | Version control your memory, see what changed |

### 对比传统方案

| 传统方案 | Agent Memory Framework |
|---------|------------------------|
| SQLite/向量数据库 | 纯 Markdown 文件 |
| 绑定特定框架 | 任何 AI 都能读取 |
| 黑盒，无法查看 | 文本编辑器直接打开 |
| 迁移需要导出导入 | 复制文件夹即可迁移 |
| 依赖复杂 | 零依赖 |

## 📦 安装

```bash
# 克隆仓库
git clone https://github.com/openclaw/agent-memory-framework.git

# 或使用 npm（lint 工具）
npm install -g agent-memory-lint
```

## 🚀 快速开始

### 1. 创建记忆目录结构

```
your-project/
├── memory/
│   ├── 00-索引.md           # 总入口，快速导航
│   ├── 01-原则/             # 最高原则、行为准则（宪法层）
│   │   ├── 身份与关系.md
│   │   ├── 行为准则.md
│   │   └── 记忆系统规则.md
│   ├── 02-技能索引.md       # 技能方法、组件库（工具层）
│   ├── 03-项目进展.md       # 项目队列、当前状态（土壤层）
│   ├── 04-其他.md           # 临时记录、每日复盘
│   └── 05-工具/             # 可调用的 Agent 和工具
└── AGENTS.md                # Agent 行为指南
```

### 2. 配置 AGENTS.md

```markdown
# AGENTS.md - Your Workspace

## Every Session

Before doing anything else:
1. Read `SOUL.md` — this is who you are
2. Read `USER.md` — this is who you're helping
3. Read `memory/YYYY-MM-DD.md` (today + yesterday) for recent context
4. **If in MAIN SESSION**: Read memory files:
   - `memory/01-原则/身份与关系.md`
   - `memory/01-原则/行为准则.md`
   - `memory/02-技能索引.md`
   - `memory/03-项目进展.md`

## Memory

You wake up fresh each session. These files are your continuity:
- **Daily notes:** `memory/YYYY-MM-DD.md`
- **Long-term:** `MEMORY.md`

Capture what matters. Decisions, context, things to remember.
```

### 3. 运行 Lint 检查

```bash
# 检查死链和健康度
agent-memory-lint

# 自动修复死链
agent-memory-lint --fix

# 指定记忆根目录
agent-memory-lint --root /path/to/memory
```

## 🏗️ 三层架构（核心创新）

```
03-项目进展.md  ← 土壤层：项目记录、实战经验
     ↓ 提炼
02-技能索引.md  ← 工具层：技能方法、组件库
     ↓ 提炼
01-原则/        ← 宪法层：最高原则、行为准则
```

**提炼判断：**
- 明显是原则 → 直接提炼到 01
- 明显是技能方法 → 直接提炼到 02
- 边界模糊 → 一起探讨

**为什么是三层？**

- **宪法层（01）**：不变的规则，如"安全第一"、"隐私优先"
- **工具层（02）**：可复用的方法，如"Lint 检查流程"
- **土壤层（03）**：原始经验，如"今天修复了 22 个死链"

从土壤提炼工具，从工具提炼原则，形成闭环。

## 📝 记忆文件规范

### Wikilink 语法

使用 `[[文件名]]` 创建双向链接：

```markdown
参见 [[02-技能索引]] 了解更多技能。

项目进展见 [[03-项目进展]]。
```

### 文件命名规范

- 使用日期前缀：`YYYY-MM-DD_主题.md`
- 使用中文或英文，不混用
- 使用下划线或连字符，不使用空格

**示例：**
- ✅ `2026-05-17_记忆系统总结.md`
- ✅ `2026-05-17_Phase1-2总结.md`
- ❌ `Phase1-2总结.md`（缺少日期）

## 🔧 Lint 工具

### 功能

- 检查死链（`[[xxx]]` 指向不存在的文件）
- 检查过期信息（项目进展太久没更新）
- 计算健康度分数
- 自动修复死链

### 配置

创建 `memory-lint.config.json`：

```json
{
  "root": "./memory",
  "dirs": ["01-原则", "02-skills", "03-projects", "04-raw"],
  "files": ["00-索引.md", "03-项目进展.md"],
  "whitelist": ["总结", "审核"]
}
```

## 🔄 维护原则

### 触发式维护

- 变化时立即写下来，不依赖"我会记得"
- 每天首次对话时读一遍相关文件

### 定期维护

- 每周运行一次 lint 检查
- 每周整理一次，删除已提炼的日记文件
- 重大决策随时记录到 01-原则/、02、03

### 健康度标准

- 100 分：无死链，无过期信息
- 80-99 分：少量死链，可接受
- <80 分：需要维护

## 📚 使用场景

### 个人 AI 助手

- 记录用户偏好、习惯
- 跟踪项目进展
- 积累技能和方法

### 多 Agent 协作

- 共享"宪法层"（01-原则）
- 各自维护"工具层"和"土壤层"
- 通过索引文件导航

### 知识管理

- 替代复杂的笔记软件
- 纯文本，版本控制友好
- 任何工具都能查看和编辑

## 🤝 致谢

本项目借鉴了以下开源项目的设计思路：

### [TencentDB-Agent-Memory](https://github.com/Tencent/TencentDB-Agent-Memory)

感谢腾讯开源的 Agent Memory 框架，本项目借鉴了：

- **SessionMemory** — 会话记忆与长期记忆分离的概念
- **extractMemories** — 从对话中提取关键信息的机制
- **autoCompact** — 上下文自动压缩的思路

### [OpenHuman](https://github.com/tinyhumansai/openhuman)

感谢 OpenHuman 项目，本项目借鉴了：

- **Auto-fetch** — 自动拉取外部数据源的设计
- **Memory Tree** — 层级化记忆结构（daily/weekly/monthly）
- **TokenJuice** — Token 压缩降低成本的思路

### 本项目创新点

- **三层架构**（宪法/工具/土壤）— 独创的提炼路径，从实战经验提炼到原则
- **纯 Markdown 实现** — 无数据库依赖，任何 AI 都能读取
- **Lint 检查工具** — 死链检测 + 自动修复，保持记忆健康
- **触发式维护** — 变化时写，不依赖定时任务
- **框架独立** — 可迁移到任何 AI shell，记忆文件是核心

## 📄 License

MIT License - 可自由使用、修改、分发

## 🤝 Contributing

欢迎提交 Issue 和 Pull Request！

---

**为什么选择 Agent Memory Framework？**

因为简单。因为直接。因为你想换个 AI 时，记忆不用重新训练。

**Because it's simple. Because it works. Because your memory should survive the platform switch.**