# CLAUDE.md

本文件定义 AI 编码助手在 NoteHub 仓库中的工作约定。

## 项目简介

NoteHub 是面向嵌入式系统与电子工程从业者的中文技术文档站，基于 VitePress 和 Vue 3 构建。内容组织参考 Diátaxis 文档框架，架构示意见 `docs/diataxis-architecture.png`。

## 环境与命令

- Node.js：22（与 CI 保持一致）
- 包管理器：npm；依赖版本以 `package-lock.json` 为准

```bash
npm ci                         # 按锁文件安装依赖
npm run dev                    # 启动本地开发服务器
npm run build                  # 构建并检查站内链接
npm run preview                # 预览生产构建
npm run check:staged-doc-links # 检查暂存区文档链接
```

提交前至少运行与改动相关的检查。涉及站点配置、组件、依赖或构建流程时，必须运行 `npm run build`。

## 仓库结构

```text
docs/
├── .vitepress/          # 站点配置、主题、组件与样式
├── microcontrollers/    # MCU
├── protocols/           # 总线与通信协议
├── fpga/                # FPGA
├── interview-questions/ # 技术面试问答
├── should-know/         # 工程基础知识
└── datasheets/          # 数据手册摘要
```

关键文件：

- `docs/.vitepress/config.mts`：VitePress、导航、侧边栏与 Markdown 配置
- `docs/.vitepress/theme/`：主题入口和全局样式
- `docs/.vitepress/components/`：自定义 Vue 组件
- `docs/CONTRIBUTING.md`：投稿入口与内容规范
- `docs/TEMPLATE.md`：文章模板
- `Dockerfile`：将已构建的静态文件封装为 Nginx 镜像
- `.github/workflows/deploy.yml`：生产环境构建与部署流程

## 构建与部署边界

```text
docs/ ─VitePress→ docs/.vitepress/dist/ ─Docker→ Nginx 镜像 ─SSH→ 服务器
```

- VitePress 负责把文档和主题编译为静态站点。
- Dockerfile 只封装 `docs/.vitepress/dist/`，不负责安装依赖或编译源码。
- GitHub Actions 在推送到 `main` 时执行安装、构建、镜像推送和服务器部署。
- 推送 `main` 会触发生产部署；除非用户明确要求，否则不要代替用户推送。
- 修改部署脚本时保留健康检查、失败回滚和仅绑定宿主机回环地址的安全约束。

## 内容编辑约定

- 默认使用简体中文，保持原文语气；没有明确要求时不要大幅改写内容。
- 遵循 `docs/CONTRIBUTING.md` 及其专题规范，新增页面优先参考 `docs/TEMPLATE.md`。
- 文件名使用小写英文和连字符，不使用空格。
- 标题层级连续且语义清晰；正文通常从 H2 开始，页面标题由 frontmatter 或站点结构提供。
- 中文正文使用中文标点；代码、命令、路径、API 名称和英文术语保持其原始格式。
- 代码块必须标注语言；命令输出或纯文本使用 `text`。
- 公式使用 LaTeX，流程或关系图可使用 Mermaid；仅在确实提升理解时添加图表。
- 内部链接使用仓库内稳定路径，避免链接到构建产物。

## 修改原则

- 先阅读相关文件和既有实现，再进行最小范围修改。
- 保持现有信息架构、组件风格和命名方式，避免与任务无关的重构。
- 修改导航或新增、移动、删除页面时，同步检查侧边栏和站内链接。
- 修改依赖时同步更新 `package.json` 与 `package-lock.json`，使用 `npm audit` 核验安全状态。
- 不提交生成目录、缓存、调试文件或本机配置。
- 不提交 API Key、Token、SSH 密钥、服务器地址等敏感信息；部署凭据只通过 GitHub Secrets 提供。

## 禁止事项

- 不要编辑或提交 `docs/.vitepress/cache/`、`docs/.vitepress/dist/`。
- 不要手工修改 `package-lock.json`；应由 npm 生成。
- 不要绕过失败的检查或静默降低安全约束。
- 不要在未经明确授权的情况下推送、部署或执行破坏性 Git 操作。
