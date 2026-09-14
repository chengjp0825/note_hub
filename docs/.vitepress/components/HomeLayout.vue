<script setup>
import { nextTick, ref, onMounted } from 'vue'

const terminalInput = ref(null)
const terminalBody = ref(null)
const currentCommand = ref('')
const isLoaded = ref(false)

const terminalLogs = ref([
  { type: 'info', text: 'NoteHub OS v1.0.0 (x86_64-linux-gnu)' },
  { type: 'info', text: 'Establishing secure connection to main branch... [OK]' },
  { type: 'warn', text: '警告：检测到野生 Bug。你的每一次 Commit 都在拯救同门。' },
  { type: 'success', text: '输入 `help` 查看可用命令，或输入 `join` 查看项目与社区状态。' }
])

onMounted(() => {
  setTimeout(() => { isLoaded.value = true }, 80)
})

const focusInput = () => {
  if (terminalInput.value)
    terminalInput.value.focus()
}

const runTerminalShortcut = async (command) => {
  currentCommand.value = command
  await executeCommand()
}

const executeCommand = async () => {
  const cmd = currentCommand.value.trim()
  if (!cmd)
    return

  terminalLogs.value.push({ type: 'input', text: cmd })
  currentCommand.value = ''

  const commandLower = cmd.toLowerCase()
  switch (commandLower) {
    case 'help':
      terminalLogs.value.push(
        { type: 'success', text: 'AVAILABLE COMMANDS:' },
        { type: 'info', text: '  help   - 打印此帮助信息' },
        { type: 'info', text: '  join   - 查看 GitHub 仓库与社区状态' },
        { type: 'info', text: '  buffs  - 扫描社区联机增益模块' },
        { type: 'info', text: '  clear  - 清屏 (掉 SAN 值恢复)' }
      )
      break
    case 'join':
      terminalLogs.value.push(
        { type: 'success', text: '>_ 正在生成跃迁门...' },
        { type: 'info', text: 'GitHub 仓库: https://github.com/chengjp0825/note_hub' },
        { type: 'info', text: '交流社区: 筹备中' }
      )
      break
    case 'buffs':
      terminalLogs.value.push(
        { type: 'success', text: '已挂载的服务器增益：' },
        { type: 'info', text: '- [Bug 墓地] 免疫 30% 硬件踩坑伤害' },
        { type: 'info', text: '- [反向拷打] 面试气场提升 50%' }
      )
      break
    case 'clear':
      terminalLogs.value = []
      break
    default:
      terminalLogs.value.push({ type: 'warn', text: `bash: ${cmd}: command not found. 输入 'help' 查看指令。` })
  }

  await nextTick()
  if (terminalBody.value) {
    terminalBody.value.scrollTop = terminalBody.value.scrollHeight
  }
}
</script>

<template>
  <div class="home-container" :class="{ loaded: isLoaded }">

    <!-- Dot grid background -->
    <div class="dot-grid" aria-hidden="true"></div>

    <!-- HERO -->
    <section class="hero">
      <!-- Circuit decoration SVG -->
      <svg class="circuit-deco" viewBox="0 0 400 340" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <!-- Trace 1: top-right horizontal -->
        <path class="trace" d="M 280 40 L 360 40 L 360 80 L 310 80" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="310" cy="80" r="3" class="node"/>
        <circle cx="360" cy="40" r="3" class="node"/>

        <!-- Trace 2: right side vertical with branches -->
        <path class="trace" d="M 360 80 L 360 140 L 320 140 L 320 180" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="320" cy="180" r="3" class="node"/>

        <!-- Trace 3: horizontal going left -->
        <path class="trace" d="M 200 180 L 240 180 L 240 220 L 360 220 L 360 260" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="200" cy="180" r="3" class="node"/>
        <circle cx="360" cy="260" r="3" class="node"/>

        <!-- Trace 4: bottom left branch -->
        <path class="trace" d="M 200 180 L 200 260 L 160 260 L 160 300" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="160" cy="300" r="3" class="node"/>

        <!-- Trace 5: small chip outline -->
        <rect x="270" y="30" width="50" height="35" rx="3" class="chip-box" stroke-width="1.2"/>
        <path class="trace" d="M 275 30 L 275 20 L 290 20" stroke-width="1.2" stroke-linecap="round"/>
        <path class="trace" d="M 295 30 L 295 20 L 315 20" stroke-width="1.2" stroke-linecap="round"/>
        <path class="trace" d="M 320 30 L 320 20 L 330 20" stroke-width="1.2" stroke-linecap="round"/>
        <path class="trace" d="M 275 65 L 275 75 L 290 75" stroke-width="1.2" stroke-linecap="round"/>
        <path class="trace" d="M 315 65 L 315 75 L 330 75" stroke-width="1.2" stroke-linecap="round"/>

        <!-- Trace 6: scattered dots/nodes -->
        <circle cx="100" cy="60" r="2.5" class="node"/>
        <circle cx="100" cy="60" r="6" class="node-ring"/>
        <circle cx="140" cy="120" r="2.5" class="node"/>
        <path class="trace" d="M 100 60 L 120 60 L 120 120 L 140 120" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>

        <circle cx="80" cy="200" r="2.5" class="node"/>
        <circle cx="50" cy="200" r="2.5" class="node"/>
        <path class="trace" d="M 50 200 L 80 200" stroke-width="1" stroke-linecap="round"/>

        <!-- Additional subtle traces -->
        <path class="trace trace-faint" d="M 340 120 L 380 120 L 380 160" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="380" cy="160" r="2" class="node node-small"/>
      </svg>

      <div class="hero-inner">
        <div class="hero-eyebrow">
          <span class="eyebrow-dot"></span>
          笔记与技术分享
        </div>
        <div class="hero-title-row">
          <img class="hero-logo-inline" src="/favicon.svg" alt="NoteHub Logo" />
          <h1 class="hero-title">NoteHub</h1>
        </div>
        <p class="hero-lead">别在数据手册里单排了，这儿有活人。</p>
        <p class="hero-sub">基于 Diátaxis 架构的赛博修理铺。拒绝纸上谈兵，专治三类疑难杂症：软件卡死、硬件漏电，以及面试官的无理取闹。</p>
        <div class="hero-actions">
          <a href="/microcontrollers/" class="btn btn-primary">接入节点</a>
          <a href="/interview-questions/" class="btn btn-secondary">接受拷打</a>
          <a href="/CONTRIBUTING" class="btn btn-ghost">投稿规范</a>
        </div>
      </div>
    </section>

    <!-- DIATAXIS GRID -->
    <section class="section">
      <div class="section-header">
        <div class="section-label">// 知识收容协议</div>
        <h2 class="section-title">Diátaxis 四象限</h2>
        <p class="section-desc">确保排障时不再像无头苍蝇乱撞。每个内容都有明确的用途和学习路径。</p>
      </div>

      <div class="quad-grid">
        <div class="quad-card quad-large" style="--delay: 0">
          <div class="quad-meta">
            <span class="quad-num">01</span>
            <span class="quad-tag tag-blue">Learning · Action</span>
          </div>
          <h3>主线通关</h3>
          <p>带你从点亮第一颗 LED 到手搓 Linux 驱动底层架构的完整闭环。绝不卖关子，全是经过验证的干货。</p>
          <div class="quad-bar bar-blue"></div>
        </div>

        <div class="quad-card quad-tall" style="--delay: 1">
          <div class="quad-meta">
            <span class="quad-num">02</span>
            <span class="quad-tag tag-orange">Working · Action</span>
          </div>
          <h3>救火手册</h3>
          <p>深夜排查软件 Bug？主控跑飞无响应？别急着摔板子，这里提供针对真实翻车现场的精准排错 SOP，直接抄作业。</p>
          <div class="quad-bar bar-orange"></div>
        </div>

        <div class="quad-card" style="--delay: 2">
          <div class="quad-meta">
            <span class="quad-num">03</span>
            <span class="quad-tag tag-green">Learning · Theory</span>
          </div>
          <h3>设定集</h3>
          <p>深挖底层逻辑与彩蛋。不仅要知其然，还要扒开各种编解码和协议背后那些隐秘的真相。</p>
          <div class="quad-bar bar-green"></div>
        </div>

        <div class="quad-card quad-large" style="--delay: 3">
          <div class="quad-meta">
            <span class="quad-num">04</span>
            <span class="quad-tag tag-purple">Working · Theory</span>
          </div>
          <h3>物理外挂</h3>
          <p>高频寄存器配置模板、引脚复用字典与 API 源码速查。拒绝繁文缛节，CV 工程师的快乐源泉。</p>
          <div class="quad-bar bar-purple"></div>
        </div>
      </div>
    </section>

    <!-- MODULES -->
    <section class="section">
      <div class="section-header">
        <div class="section-label">// 专业装备</div>
        <h2 class="section-title">两个核心入口</h2>
      </div>

      <div class="mod-grid">
        <a href="/interview-questions/" class="mod-card" style="--delay: 4">
          <div class="mod-icon">🎯</div>
          <div class="mod-body">
            <h3>那我问你</h3>
            <p>面试官的终极拷问模拟器。从 Linux 驱动黑洞到 FPGA 时序地狱，从 C++ 模板魔法到软件协议死锁。每个问题都有标准答案 + 深度解析。</p>
          </div>
          <div class="mod-arrow">→</div>
        </a>

        <a href="/should-know/" class="mod-card" style="--delay: 5">
          <div class="mod-icon">📚</div>
          <div class="mod-body">
            <h3>你知道吗</h3>
            <p>那些“本该知道却总是忘记”的硬核基础。从 AC 耦合原理到服务迁“云”陷阱，从 Git 版本管理到信号完整性。主打一个非教科书式、不搭嘎的血泪经验。</p>
          </div>
          <div class="mod-arrow">→</div>
        </a>
      </div>
    </section>

    <!-- HIGHLIGHTS -->
    <section class="section">
      <div class="section-header">
        <div class="section-label">// 本站亮点</div>
        <h2 class="section-title">不是普通教程站</h2>
        <p class="section-desc">阅读过程中会突然触发提问与交互演示，帮助你把概念真正记住，而不是看完就忘。</p>
      </div>

      <div class="mod-grid">
        <div class="mod-card highlight-card" style="--delay: 5">
          <div class="mod-icon">❓</div>
          <div class="mod-body">
            <h3>正文会突然冒出的提问环节</h3>
            <p>你会在正文里遇到「那我问你」和「那我接着问你」的突击环节，用面试式追问帮你及时检查理解深度。</p>
            <div class="mod-preview qa-preview" aria-hidden="true">
              <div class="qa-head">那我问你</div>
              <div class="qa-line">为什么差分更抗共模干扰？</div>
              <div class="qa-chip-row">
                <span class="qa-chip">那我问你</span>
                <span class="qa-chip">那我接着问你</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mod-card highlight-card" style="--delay: 6">
          <div class="mod-icon">🧪</div>
          <div class="mod-body">
            <h3>正文会突然出现交互式演示</h3>
            <p>遇到难以理解的抽象概念时，正文会直接插入交互式演示，让你边拖参数边看结果。</p>
            <div class="mod-preview frame-preview" aria-hidden="true">
              <div class="frame-topbar">
                <i></i><i></i><i></i>
                <span>IIC Demo</span>
              </div>
              <div class="frame-body">
                <div class="frame-chart"></div>
                <div class="frame-controls">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- COMMUNITY -->
    <section class="section">
      <div class="section-header">
        <div class="section-label">// 服务器联机增益</div>
        <h2 class="section-title">告别单机闭门造车</h2>
        <p class="section-desc">已为你接通硬核火力支援，疑难杂症随时摇人。</p>
      </div>

      <div class="buff-row">
        <div class="buff-item" style="--delay: 6">
          <span class="buff-emoji">🪦</span>
          <div class="buff-text">
            <h4>Bug 墓地</h4>
            <p>埋葬着无数前辈的血泪史。从 FPGA 综合报错到 insmod 加载失败，看一眼少掉两根头发。</p>
          </div>
        </div>
        <div class="buff-item" style="--delay: 7">
          <span class="buff-emoji">🎯</span>
          <div class="buff-text">
            <h4>反向拷打指南</h4>
            <p>重构你的底层逻辑。带入 C++ 架构的工程视角，面试时气场全开。</p>
          </div>
        </div>
        <div class="buff-item" style="--delay: 8">
          <span class="buff-emoji">🔄</span>
          <div class="buff-text">
            <h4>永不宕机的 Patch</h4>
            <p>发现文档有错？直接提 PR 糊我脸上。一本由玩家共同进化的活文档。</p>
          </div>
        </div>
        <div class="buff-item" style="--delay: 9">
          <span class="buff-emoji">📈</span>
          <div class="buff-text">
            <h4>波形图社交</h4>
            <p>屏蔽闲聊水群。示波器截图和工程技术就是这里的唯一货币。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- TERMINAL -->
    <section class="section terminal-section">
      <div class="section-header">
        <div class="section-label">// 终端联机</div>
        <h2 class="section-title">在本地完成所有操作</h2>
        <p class="section-desc terminal-desc">
          仿佛置身真实的服务器机房。点击
          <button type="button" class="terminal-chip" @click="runTerminalShortcut('help')">help</button>
          开始，或者点击
          <button type="button" class="terminal-chip terminal-chip-join" @click="runTerminalShortcut('join')">join</button>
          查看社区状态。
        </p>
      </div>

      <div class="console">
        <div class="console-titlebar">
          <div class="console-dots"><i></i><i></i><i></i></div>
          <span>bash — notehub_join_raid.sh</span>
          <span class="console-status">● 在线</span>
        </div>
        <div class="console-body" ref="terminalBody" @click="focusInput">
          <div v-for="(log, index) in terminalLogs" :key="index" class="log-line">
            <template v-if="log.type === 'input'">
              <span class="log-prompt">root@notehub:~#</span> <span class="log-cmd">{{ log.text }}</span>
            </template>
            <template v-else-if="log.type === 'info'">
              <span class="log-info">{{ log.text }}</span>
            </template>
            <template v-else-if="log.type === 'warn'">
              <span class="log-warn">{{ log.text }}</span>
            </template>
            <template v-else-if="log.type === 'success'">
              <span class="log-ok">{{ log.text }}</span>
            </template>
          </div>
          <div class="input-row">
            <span class="log-prompt">root@notehub:~#</span>
            <input
              ref="terminalInput"
              v-model="currentCommand"
              @keydown.enter="executeCommand"
              spellcheck="false"
              autocomplete="off"
            />
          </div>
        </div>
      </div>

      <div class="mobile-links">
        <a href="https://github.com/chengjp0825/note_hub" class="btn btn-small btn-outline" target="_blank" rel="noopener noreferrer">发起 PR</a>
      </div>
    </section>

  </div>
</template>

<style scoped>
/* =========================================
   TOKENS — VitePress theme-aware + terminal fixed
   ========================================= */
.home-container {
  /* VitePress theme variables: automatically switch light/dark */
  --bg:              var(--vp-c-bg);
  --surface:         var(--vp-c-bg-soft);
  --border:          var(--vp-c-border);
  --border-light:    var(--vp-c-divider);
  --text-1:          var(--vp-c-text-1);
  --text-2:          var(--vp-c-text-2);
  --text-3:          var(--vp-c-text-3);
  --accent:          var(--vp-c-brand-1);
  --accent-soft:     var(--vp-c-brand-soft);

  /* Tag colors — light mode defaults */
  --tag-blue-bg:     #eef3ff;
  --tag-blue-text:   #2d5ba8;
  --tag-orange-bg:   #fff3e6;
  --tag-orange-text: #b35a1a;
  --tag-green-bg:    #eefaf0;
  --tag-green-text:  #2a7a42;
  --tag-purple-bg:   #f5efff;
  --tag-purple-text: #6b3a9e;
  --green:           #27a05a;
  --green-dim:       #d4eddf;

  /* Shadows */
  --shadow-sm: 0 1px 3px var(--vp-c-shadow-1), 0 1px 2px var(--vp-c-shadow-2);
  --shadow-md: 0 4px 12px var(--vp-c-shadow-1), 0 2px 4px var(--vp-c-shadow-2);
  --shadow-lg: 0 12px 32px var(--vp-c-shadow-1), 0 4px 8px var(--vp-c-shadow-2);

  /* Easing & layout */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --radius: 10px;
  --radius-lg: 16px;
  --font-sans:  var(--vp-font-family-smaller), var(--vp-font-family-base), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-serif: var(--vp-font-family-smaller), Georgia, 'Times New Roman', serif;
  --font-mono:  var(--vp-font-family-smaller), ui-monospace, SFMono-Regular, 'Fira Code', Menlo, Monaco, Consolas, monospace;

  background: var(--bg);
  color: var(--text-1);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding-bottom: 5rem;
  position: relative;
  transition: background 0.2s ease, color 0.2s ease;
}

/* =========================================
   DARK MODE — adjust tag colors for dark bg
   ========================================= */
.dark {
  --tag-blue-bg:     rgba(45, 91, 168, 0.2);
  --tag-blue-text:   #7aa8e8;
  --tag-orange-bg:   rgba(179, 90, 26, 0.2);
  --tag-orange-text: #e8a87a;
  --tag-green-bg:    rgba(42, 122, 66, 0.2);
  --tag-green-text:  #7ed49a;
  --tag-purple-bg:   rgba(107, 58, 158, 0.2);
  --tag-purple-text: #b084e8;
  --green:           #4ade80;
  --green-dim:       rgba(74, 222, 128, 0.15);
}

/* =========================================
   DOT GRID BACKGROUND
   ========================================= */
.dot-grid {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image: radial-gradient(circle, var(--vp-c-border) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: radial-gradient(ellipse at 50% 0%, black 0%, transparent 65%);
  -webkit-mask-image: radial-gradient(ellipse at 50% 0%, black 0%, transparent 65%);
  opacity: 0.6;
  transition: background-image 0.2s ease;
}

/* =========================================
   LAYOUT
   ========================================= */
.section {
  max-width: 960px;
  margin: 0 auto;
  padding: 5rem 2rem;
  position: relative;
  z-index: 1;
}

.section-header {
  margin-bottom: 3rem;
}

.section-label {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--text-3);
  margin-bottom: 0.6rem;
  letter-spacing: 0.02em;
  transition: color 0.2s ease;
}

.section-title {
  font-family: var(--font-serif);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  color: var(--text-1);
  margin: 0 0 0.75rem;
  letter-spacing: -0.02em;
  line-height: 1.2;
  transition: color 0.2s ease;
}

.section-desc {
  color: var(--text-2);
  font-size: 1rem;
  line-height: 1.7;
  margin: 0;
  max-width: 520px;
  transition: color 0.2s ease;
}

/* =========================================
   HERO
   ========================================= */
.hero {
  max-width: 960px;
  margin: 0 auto;
  padding: 8rem 2rem 6rem;
  border-bottom: 1px solid var(--border-light);
  position: relative;
  overflow: hidden;
  z-index: 1;
  transition: border-color 0.2s ease;
}

/* Circuit decoration SVG */
.circuit-deco {
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 380px;
  height: 320px;
  pointer-events: none;
  z-index: 0;
  opacity: 0.45;
}

.trace {
  stroke: var(--text-3);
  fill: none;
}

.trace-faint {
  opacity: 0.4;
}

.node {
  fill: var(--text-3);
  opacity: 0.6;
}

.node-ring {
  fill: none;
  stroke: var(--text-3);
  stroke-width: 1;
  opacity: 0.25;
}

.node-small {
  opacity: 0.5;
}

.chip-box {
  fill: var(--surface);
  stroke: var(--text-3);
  opacity: 0.5;
}

.hero-inner {
  max-width: 600px;
  position: relative;
  z-index: 1;
}

.hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--text-3);
  margin-bottom: 1.5rem;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.5s var(--ease-out), transform 0.5s var(--ease-out), color 0.2s ease;
}

.loaded .hero-eyebrow { opacity: 1; transform: translateY(0); }

.hero-title-row {
  display: inline-flex;
  align-items: center;
  gap: 0.9rem;
  margin: 0 0 1.25rem;
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.6s var(--ease-out) 0.05s, transform 0.6s var(--ease-out) 0.05s;
}

.loaded .hero-title-row { opacity: 1; transform: translateY(0); }

.hero-logo-inline {
  width: clamp(3.4rem, 8vw, 4.8rem);
  height: clamp(3.4rem, 8vw, 4.8rem);
  display: block;
  border-radius: 1rem;
}

.hero-title {
  font-family: var(--font-serif);
  font-size: clamp(3.5rem, 12vw, 6rem);
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.04em;
  line-height: 1;
  margin: 0;
  transition: color 0.2s ease;
}

.hero-lead {
  font-family: var(--font-serif);
  font-size: clamp(1.15rem, 2.5vw, 1.4rem);
  color: var(--text-1);
  margin: 0 0 0.9rem;
  font-weight: 500;
  line-height: 1.45;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.5s var(--ease-out) 0.1s, transform 0.5s var(--ease-out) 0.1s, color 0.2s ease;
}

.loaded .hero-lead { opacity: 1; transform: translateY(0); }

.hero-sub {
  font-size: 0.95rem;
  color: var(--text-2);
  line-height: 1.8;
  margin: 0 0 2.5rem;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.5s var(--ease-out) 0.15s, transform 0.5s var(--ease-out) 0.15s, color 0.2s ease;
}

.loaded .hero-sub { opacity: 1; transform: translateY(0); }

.hero-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.5s var(--ease-out) 0.2s, transform 0.5s var(--ease-out) 0.2s;
}

.loaded .hero-actions { opacity: 1; transform: translateY(0); }

/* =========================================
   BUTTONS
   ========================================= */
.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.7rem 1.4rem;
  border-radius: var(--radius);
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.18s ease;
  cursor: pointer;
  border: 1px solid transparent;
  font-family: var(--font-sans);
}

.btn-primary {
  background: var(--text-1);
  color: var(--bg);
  border-color: var(--text-1);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  filter: brightness(1.1);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--surface);
  color: var(--text-1);
  border-color: var(--border);
  box-shadow: var(--shadow-sm);
}

.btn-secondary:hover {
  border-color: var(--text-3);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn-ghost {
  background: transparent;
  color: var(--text-2);
  border-color: var(--border);
}

.btn-ghost:hover {
  color: var(--text-1);
  border-color: var(--text-3);
  background: var(--surface);
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-2);
  font-family: var(--font-sans);
}

.btn-outline:hover {
  border-color: var(--text-3);
  color: var(--text-1);
}

/* =========================================
   QUAD GRID (Diátaxis)
   ========================================= */
.quad-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.quad-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.75rem;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease,
              background 0.2s ease;
  opacity: 0;
  transform: translateY(16px);
}

.loaded .quad-card {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.5s var(--ease-out) calc(var(--delay) * 0.08s + 0.3s),
              transform 0.5s var(--ease-out) calc(var(--delay) * 0.08s + 0.3s),
              box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.quad-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
  border-color: var(--text-3);
}

/* Left accent bars */
.quad-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 3px 0 0 3px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.bar-blue   { background: var(--tag-blue-text); }
.bar-orange { background: var(--tag-orange-text); }
.bar-green  { background: var(--tag-green-text); }
.bar-purple { background: var(--tag-purple-text); }

.quad-card:hover .quad-bar { opacity: 1; }

/* Grid layout */
.quad-large { grid-column: span 2; }
.quad-tall  { grid-row: span 2; }

.quad-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.1rem;
}

.quad-num {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-3);
  font-weight: 500;
  transition: color 0.2s ease;
}

.quad-tag {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 5px;
  letter-spacing: 0.04em;
  transition: background 0.2s ease, color 0.2s ease;
}

.quad-tag.tag-blue   { background: var(--tag-blue-bg);   color: var(--tag-blue-text); }
.quad-tag.tag-orange { background: var(--tag-orange-bg); color: var(--tag-orange-text); }
.quad-tag.tag-green  { background: var(--tag-green-bg);   color: var(--tag-green-text); }
.quad-tag.tag-purple { background: var(--tag-purple-bg);  color: var(--tag-purple-text); }

.quad-card h3 {
  font-family: var(--font-serif);
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-1);
  margin: 0 0 0.75rem;
  transition: color 0.2s ease;
}

.quad-card p {
  font-size: 0.88rem;
  color: var(--text-2);
  line-height: 1.78;
  margin: 0;
  transition: color 0.2s ease;
}

/* =========================================
   MODULE CARDS
   ========================================= */
.mod-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.mod-card {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.75rem;
  text-decoration: none;
  color: inherit;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s ease, transform 0.2s ease,
              border-color 0.2s ease, background 0.2s ease;
  opacity: 0;
  transform: translateY(16px);
}

.loaded .mod-card {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.5s var(--ease-out) calc(var(--delay) * 0.08s + 0.3s),
              transform 0.5s var(--ease-out) calc(var(--delay) * 0.08s + 0.3s),
              box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.mod-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
  border-color: var(--text-3);
}

.highlight-card {
  cursor: default;
}

.highlight-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
  border-color: var(--text-3);
}

.mod-icon {
  font-size: 1.6rem;
  flex-shrink: 0;
  line-height: 1.2;
}

.mod-body { flex: 1; min-width: 0; }

.mod-body h3 {
  font-family: var(--font-serif);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-1);
  margin: 0 0 0.5rem;
  transition: color 0.2s ease;
}

.mod-body p {
  font-size: 0.88rem;
  color: var(--text-2);
  line-height: 1.75;
  margin: 0;
  transition: color 0.2s ease;
}

.mod-preview {
  margin-top: 0.9rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
  overflow: hidden;
}

.qa-preview {
  padding: 0.75rem;
}

.qa-head {
  font-size: 0.74rem;
  font-weight: 700;
  color: #e8a832;
  margin-bottom: 0.45rem;
}

.qa-line {
  font-size: 0.8rem;
  color: var(--text-1);
  margin-bottom: 0.5rem;
}

.qa-chip-row {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.qa-chip {
  font-size: 0.68rem;
  color: var(--text-2);
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: 999px;
  padding: 0.18rem 0.48rem;
}

.frame-topbar {
  height: 24px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.frame-topbar i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--text-3);
  opacity: 0.6;
}

.frame-topbar span {
  margin-left: auto;
  font-size: 0.68rem;
  color: var(--text-3);
  font-family: var(--font-mono);
}

.frame-body {
  padding: 8px;
}

.frame-chart {
  height: 52px;
  border-radius: 6px;
  background: linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.06));
  border: 1px solid var(--border-light);
}

.frame-controls {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-top: 7px;
}

.frame-controls span {
  height: 8px;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--border-light);
}

.mod-arrow {
  font-size: 1.25rem;
  color: var(--text-3);
  flex-shrink: 0;
  margin-top: 0.25rem;
  transition: transform 0.2s ease, color 0.2s ease;
}

.mod-card:hover .mod-arrow {
  transform: translateX(4px);
  color: var(--text-2);
}

/* =========================================
   BUFF ROW
   ========================================= */
.buff-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.buff-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.4s var(--ease-out) calc(var(--delay) * 0.06s + 0.3s),
              transform 0.4s var(--ease-out) calc(var(--delay) * 0.06s + 0.3s);
}

.loaded .buff-item {
  opacity: 1;
  transform: translateY(0);
}

.buff-emoji {
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.buff-text h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-1);
  margin: 0 0 0.35rem;
  transition: color 0.2s ease;
}

.buff-text p {
  font-size: 0.82rem;
  color: var(--text-2);
  line-height: 1.65;
  margin: 0;
  transition: color 0.2s ease;
}

/* =========================================
   TERMINAL (always dark — no theme transition)
   ========================================= */
.terminal-section { padding-top: 3rem; }

.console {
  background: #1c1c1e;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.3);
}

.console-titlebar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  background: #28282a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.console-dots { display: flex; gap: 7px; }

.console-dots i {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff5f57;
  display: block;
}
.console-dots i:nth-child(2) { background: #ffbd2e; }
.console-dots i:nth-child(3) { background: #28c840; }

.console-titlebar > span {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.38);
}

.console-status {
  margin-left: auto;
  font-size: 0.72rem !important;
  color: #28c840 !important;
  opacity: 0.85;
}

.console-body {
  padding: 1.25rem 1.5rem;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.75;
  color: #d4d4d4;
  min-height: 220px;
  max-height: 340px;
  overflow-y: auto;
  cursor: text;
  background: #1c1c1e;
}

.console-body::-webkit-scrollbar { width: 5px; }
.console-body::-webkit-scrollbar-track { background: transparent; }
.console-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }

.log-line { margin-bottom: 0.4rem; }

.log-prompt { color: #6fba8a; margin-right: 0.65rem; font-weight: 600; white-space: nowrap; }
.log-cmd   { color: #e8e8e8; }
.log-info  { color: rgba(255,255,255,0.42); }
.log-warn  { color: #e8a832; font-weight: 600; }
.log-ok    { color: #4ec9b8; }

.input-row {
  display: flex;
  align-items: center;
  margin-top: 0.4rem;
}

.input-row input {
  background: transparent;
  border: none;
  outline: none;
  color: #e8e8e8;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  flex: 1;
  caret-color: #6fba8a;
}

.mobile-links {
  display: none;
  gap: 0.75rem;
  margin-top: 1.5rem;
  justify-content: center;
}

.inline-code {
  font-family: var(--font-mono);
  font-size: 0.85em;
  background: var(--vp-c-bg-mute);
  padding: 0.15em 0.45em;
  border-radius: 4px;
  color: var(--accent);
  transition: background 0.2s ease, color 0.2s ease;
}

.terminal-desc {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.terminal-chip {
  appearance: none;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-1);
  font-family: var(--font-mono);
  font-size: 0.82rem;
  line-height: 1;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.terminal-chip:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
  border-color: var(--text-3);
}

.terminal-chip:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.terminal-chip-join {
  color: var(--accent);
}

/* =========================================
   RESPONSIVE
   ========================================= */
@media (max-width: 800px) {
  .quad-grid { grid-template-columns: repeat(2, 1fr); }
  .quad-large { grid-column: span 2; }
  .quad-tall  { grid-row: span 1; }
  .buff-row   { grid-template-columns: repeat(2, 1fr); }
  .mod-grid   { grid-template-columns: 1fr; }
  .hero       { padding: 6rem 1.5rem 4rem; }
  .section    { padding: 4rem 1.5rem; }
}

@media (max-width: 560px) {
  .hero { padding-bottom: 3rem; }
  .section { padding-top: 3rem; padding-bottom: 3rem; }
  .section-header { margin-bottom: 2rem; }
  .quad-grid { grid-template-columns: 1fr; }
  .quad-large, .quad-tall { grid-column: span 1; grid-row: auto; }
  .buff-row  { grid-template-columns: 1fr; }
  .console  { display: none; }
  .mobile-links { display: flex; }
  .circuit-deco { opacity: 0.2; width: 260px; right: -20px; }
  .hero-title-row { gap: 0.55rem; }
}
</style>
