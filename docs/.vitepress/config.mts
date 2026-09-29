import { MermaidMarkdown } from 'vitepress-plugin-mermaid'

export default {
  lang: 'zh-CN',
  title: 'NoteHub',
  description: '笔记与技术分享',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'alternate icon', href: '/favicon.svg' }]
  ],

  // 1. 配置 Markdown
  markdown: {
    math: true,
    config(md) {
      MermaidMarkdown(md)
    }
  },

  // Mermaid is loaded on demand and ships a few intentionally large diagram chunks.
  vite: {
    build: {
      chunkSizeWarningLimit: 2500,
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.code === 'EVAL' && warning.id?.includes('node_modules/mathjax-full')) return
          warn(warning)
        },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/mathjax-full') || id.includes('node_modules/markdown-it-mathjax3')) return 'mathjax'
            if (id.includes('node_modules/cytoscape')) return 'cytoscape'
            return undefined
          }
        }
      }
    }
  },

  // Mermaid 插件配置

  themeConfig: {
    logo: '/favicon.svg', 
    lastUpdated: {
      text: '最后更新于'
    },

    outline: {
      level: [2, 3],
      label: 'On this page' // 可选：自定义大纲标题
    },

    // 2. 开启本地搜索
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
              }
            }
          }
        }
      }
    },

    // 3. 导航栏配置
    nav: [
      { text: '首页', link: '/' },
      { text: '那我问你', link: '/interview-questions/' },
      { text: '岗位题库', link: '/question-bank/' },
      { text: '你知道吗', link: '/should-know/' },
      { text: '微控制器', link: '/microcontrollers/' },
      { text: 'FPGA', link: '/fpga/' },
      { text: '通信协议', link: '/protocols/' },
      { text: '效率工具', link: '/efficiency-tools/' },
    ],

    // 4. 侧边栏配置
    sidebar: {
      '/question-bank/': [
        {
          text: '岗位题库',
          items: [
            { text: '全部题目', link: '/question-bank/' },
            { text: '题库使用指南', link: '/question-bank/guide' },
            { text: '面试准备', link: '/question-bank/interview-preparation' },
          ],
        },
        {
          text: '按岗位',
          collapsed: false,
          items: [
            { text: '岗位介绍', link: '/question-bank/roles' },
            { text: '硬件工程师', link: '/question-bank/?role=hardware#filters-role' },
            { text: 'FPGA 工程师', link: '/question-bank/?role=fpga#filters-role' },
            { text: '嵌入式 MCU', link: '/question-bank/?role=embedded-mcu#filters-role' },
            { text: '嵌入式 Linux', link: '/question-bank/?role=embedded-linux#filters-role' },
          ],
        },
        {
          text: '按专题',
          collapsed: false,
          items: [
            { text: '电源与硬件设计', link: '/question-bank/?topic=电源与硬件设计#filters-topic' },
            { text: '高速接口与 FPGA', link: '/question-bank/?topic=高速接口与 FPGA#filters-topic' },
            { text: 'MCU 与嵌入式软件', link: '/question-bank/?topic=MCU 与嵌入式软件#filters-topic' },
            { text: '通信与网络', link: '/question-bank/?topic=通信与网络#filters-topic' },
            { text: '采集与控制', link: '/question-bank/?topic=采集与控制#filters-topic' },
            { text: '测试与系统工程', link: '/question-bank/?topic=测试与系统工程#filters-topic' },
          ],
        },
        {
          text: '按公司',
          collapsed: true,
          items: [
            { text: '公司介绍', link: '/question-bank/companies' },
            { text: '全志科技', link: '/question-bank/?company=全志科技#filters-company' },
            { text: '诺瓦星云', link: '/question-bank/?company=诺瓦星云#filters-company' },
            { text: '新凯来', link: '/question-bank/?company=新凯来#filters-company' },
          ],
        },
      ],
      '/contributing/': [
        {
          text: '投稿规范',
          collapsed: false,
          items: [
            { text: '概述', link: '/contributing/' },
            { text: '模板文件', link: '/TEMPLATE' },
            { text: '排版与组件', link: '/contributing/formatting' },
            { text: '内容结构', link: '/contributing/structure' },
            { text: '题库采集规范', link: '/contributing/question-bank-workflow' },
            { text: 'GitHub 新手教程', link: '/contributing/github-guide' },
            { text: '常见问题', link: '/contributing/faq' },
          ],
        },
      ],
      '/interview-questions/': [
        {
          text: '那我问你',
          link: '/interview-questions/'
        },
        {
          text: 'LINUX 开发',
          collapsed: false,
          base: '/interview-questions/',
          items: [
            { text: 'Linux驱动开发', link: 'linux/linux-driver' },
            { text: 'Linux应用开发', link: 'linux/linux-app' }
          ],
        },
        {
          text: 'FPGA 开发',
          collapsed: true,
          base: '/interview-questions/',
          items: [
            { text: 'FPGA开发', link: 'fpga/fpga' },
          ],
        },
        {
          text: '其它',
          collapsed: true,
          base: '/interview-questions/',
          items: [
            { text: 'C/C++编程', link: 'others/cpp' },
            { text: '通信协议', link: 'others/protocols' },
            { text: '硬件设计', link: 'others/hardware' },
          ],
        },
      ],
      '/should-know/': [
        {
          text: '你知道吗',
          link: '/should-know/'
        },
        {
          text: 'SI/PI 信号与电源完整性',
          collapsed: false,
          items: [
            { text: 'AC 耦合', link: '/should-know/si-pi/ac-coupling' },
            { text: '差分信号', link: '/should-know/si-pi/differential-signaling-lvds' },
            { text: '预加重与去加重', link: '/should-know/si-pi/pre-emphasis-de-emphasis' },
            { text: '滤波器设计', link: '/under-construction' },
          ],
        },
        {
          text: 'Git 版本控制',
          collapsed: false,
          items: [
            { text: 'Github Action', link: '/should-know/git/github-action' },
          ],
        },
        {
          text: '云服务',
          collapsed: false,
          items: [
            { text: '个人云端极速同步方案', link: '/should-know/cloud/personal-cloud-sync' },
            { text: '七牛云 + PicGo 免费图床实践', link: '/should-know/cloud/qiniu-cloud-picgo' },
          ],
        }
      ],
      '/efficiency-tools/': [
        {
          text: '科研与 AI 工具',
          collapsed: false,
          items: [
            { text: 'AI 工具最佳实践', link: '/efficiency-tools/' },
          ],
        },
      ],
      '/microcontrollers/': [
        {
          text: '微控制器 (MCU)',
          collapsed: false,
          items: [
            { text: '概述', link: '/microcontrollers/' },
            { text: 'STM32G0', link: '/microcontrollers/stm32g0' },
            { text: 'ESP32', link: '/microcontrollers/esp32' },
          ],
        },
      ],
      '/protocols/': [
        {
          text: '通信协议',
          link: '/protocols/'
        },
        {
          text: '硬件通信协议',
          collapsed: false,
          items: [
            { text: 'I2C 总线', link: '/protocols/hardware/i2c' },
            { text: 'SPI 总线', link: '/protocols/hardware/spi' },
          ],
        },
        {
          text: '网络与远程协议',
          collapsed: false,
          items: [
            { text: 'SSH 协议', link: '/protocols/network/ssh' },
            { text: 'HTTP 协议', link: '/protocols/network/http' },
            { text: 'SSL/TLS 协议', link: '/protocols/network/tls' },
            { text: 'HTTPS 协议', link: '/protocols/network/https' },
          ],
        },
      ],
      '/fpga/': [
        {
          text: 'FPGA 开发',
          collapsed: false,
          items: [
            { text: '概述', link: '/fpga/' },
            { text: 'XC7K325T', link: '/fpga/xc7k325t' },
          ],
        },
      ],
    },
  },
}
