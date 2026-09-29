# 岗位题库数据规范

所有人工采集、Agent 批量采集和自动化导入必须遵循[岗位题库网络采集 Workflow](../../docs/contributing/question-bank-workflow.md)。正式题目写入本目录前，必须通过来源门禁、四分类、有限抽象、术语标准化、语义去重和最终准入门禁。

每个题目使用一个独立的 `.yaml` 文件，文件名和 `id` 均使用小写 kebab-case。不要编辑 `docs/public/question-bank/`，它是由 `npm run build:question-bank` 自动生成的。

```yaml
id: rgmii-length-001
question: RGMII 接口为什么需要等长？允许误差应该如何判断？
roles: [hardware, embedded-linux, fpga]
companies: [诺瓦星云, 全志科技]
topic: 高速接口与 FPGA
tags: [高速串行接口, 时钟与时序]
answers:
  hardware: |-
    硬件视角的 Markdown 答案。
  embedded-linux: |-
    嵌入式 Linux 视角的 Markdown 答案。
```

`roles` 与 `answers` 的键仅允许：`hardware`、`embedded-linux`、`embedded-mcu`、`fpga`。`topic` 与 `tags` 必须来自 `content/question-bank-taxonomy.yaml`，每道题只能选择一个一级专题和一至三个所属标签。所有数组必须非空且不含重复值；每题至少提供一个非空答案。

正式题目 YAML 只保存 canonical question 及其学习属性。来源平台、发布者标识、年份、轮次、原始问题和分类结果属于原始面经层，必须与本目录分开保存。原始链接允许留空；原作者身份未知时使用平台 UP 主作为发布者标识。
