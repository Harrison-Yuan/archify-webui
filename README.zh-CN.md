# Archify AI

<div align="center">

**自然语言 → 专业架构图**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-20+-green.svg)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[English](README.md) · [中文版](README.zh-CN.md)

</div>

---

## 🚀 用自然语言一键生成专业架构图

**Archify AI** 是一个开源工具，只需用自然语言描述你的系统，就能**自动生成专业级别的架构图**。基于 LLM（DeepSeek / OpenAI）和自定义 SVG 渲染引擎，帮助工程师、架构师和学生快速可视化复杂系统。

### ✨ 为什么选择 Archify AI？

| 问题 | 解决 |
|------|------|
| "画架构图太费时间" | **描述一次** — Archify 自动生成 |
| "工具太复杂" | **零学习成本** — 无需拖拽，无需学习图库 |
| "图容易过时" | **随时重新生成** — 更新描述即可 |
| "找不到合适的工具" | **开源免费** — 可自部署或在线使用 |

### 🔥 核心功能

- **🤖 AI 驱动生成** — 自然语言描述，自动生成专业架构图 JSON
- **📊 5 种图表类型** — 架构图、流程图、时序图、数据流图、生命周期图
- **🎨 高质量 SVG 渲染** — 清晰、现代、可发表的质量
- **🌐 中英文双语** — 一键切换语言
- **📦 多种导出格式** — PNG、JPEG、WebP、SVG、剪贴板复制
- **🌙 暗色主题** — 精致玻璃态设计风格
- **🔌 API 优先** — REST API，方便集成
- **🆓 开源免费** — MIT 许可证，任意使用

### 🖼️ 界面预览

```
┌─────────────────────────────────────────────────────┐
│  Archify AI                                          │
│  ┌──────────────────────────────────────────────────┐ │
│  │ [架构图] [流程图] [时序图] [数据流图] [生命周期图]  │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ 请输入自然语言描述，例如：一个电商平台...           │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ [✨ 生成架构图]                                    │ │
│  │ 试试以下示例：                                     │ │
│  │ [电商平台...] [微服务架构...] [SaaS平台...]         │ │
│  ├──────────────────────────────────────────────────┤ │
│  │                                                  │ │
│  │         🖼️  架构图渲染区域                         │ │
│  │                                                  │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 🏗️ 系统架构

```
用户输入（自然语言）
        │
        ▼
┌─────────────────┐     ┌──────────────┐
│   前端           │────▶│  后端 API     │
│  (React + Vite)  │◀────│  (Express)    │
└─────────────────┘     └──────┬───────┘
                               │
                      ┌────────▼────────┐
                      │   LLM 服务       │
                      │ (DeepSeek/GPT)   │
                      └────────┬────────┘
                               │
                      ┌────────▼────────┐
                      │   JSON → HTML    │
                      │  SVG 渲染引擎    │
                      └─────────────────┘
```

### 🛠️ 技术栈

| 层 | 技术 |
|-------|-----------|
| **前端** | React 18, TypeScript, Vite 6, Tailwind CSS v4, shadcn/ui |
| **后端** | Node.js, Express, TypeScript, tsx |
| **LLM** | DeepSeek / OpenAI 兼容 API |
| **渲染** | 自定义 SVG 渲染引擎（7 种图表类型） |
| **国际化** | react-i18next (中文 / English) |
| **仓库** | npm workspaces 单仓库 |

### 📦 快速开始

```bash
# 1. 克隆
git clone https://github.com/your-username/archify.git
cd archify

# 2. 安装依赖
npm install

# 3. 配置 LLM
cp .env.example .env
# 编辑 .env — 填入 LLM_API_KEY

# 4. 启动（前后端一起）
npm run dev

# 打开 http://localhost:5173
```

### 🔧 配置

通过 `.env` 文件配置：

```env
# LLM 提供商（DeepSeek / OpenAI 兼容格式）
LLM_API_KEY=sk-xxx
LLM_BASE_URL=https://api.deepseek.com
LLM_MODEL=deepseek-chat
LLM_TIMEOUT=60000
LLM_MAX_RETRIES=2

# 服务端口
PORT=3001
```

### 📡 API

```bash
# 自然语言 → 架构图 JSON
curl -X POST http://localhost:3001/api/generate \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"微服务电商平台","diagramType":"architecture","language":"zh"}'

# 架构图 JSON → HTML
curl -X POST http://localhost:3001/api/render \
  -H 'Content-Type: application/json' \
  -d '{"json":{...},"diagramType":"architecture"}'
```

### 🤝 参与贡献

欢迎提交 PR！详情请查看 [CONTRIBUTING.md](CONTRIBUTING.md)。

### 📄 开源协议

[MIT](LICENSE)
