<template>
  <div class="kg-wrap" :style="wrapStyle" ref="stageRef">
    <canvas ref="canvasRef" class="kg-canvas" aria-hidden="true"></canvas>
    <nav class="kg-accessible" aria-label="知识图谱文章链接">
      <ul>
        <li v-for="node in accessibleNodes" :key="node.key">
          <a :href="withBase(node.route)">{{ node.label }}</a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData, withBase } from 'vitepress'
import { data as generatedGraph } from '../../knowledge-graph.data'

const props = withDefaults(defineProps<{ height?: number }>(), {
  height: 620
})

const wrapStyle = computed(() => ({
  height: `${props.height}px`
}))

type NodeKind = 'core' | 'project' | 'normal'
interface GraphNode {
  id: number; label: string; kind: NodeKind;
  x: number; y: number; vx: number; vy: number;
  r: number; fixed: boolean; degree: number;
  route?: string;
}

interface SeedNode {
  key: string
  label: string
  kind: NodeKind
  route?: string
}

const { isDark } = useData()

// 工具函数：Hex 转 RGBA 以支持透明度
function hexToRgba(hex: string, alpha: number) {
  // 处理可能传入的异常 Hex
  if (!hex || hex.length !== 7) return `rgba(128,128,128,${alpha})`
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const fallbackNodes: SeedNode[] = [
  { key: 'page:/should-know/cloud/personal-cloud-sync', label: '个人云端极速同步方案', kind: 'core', route: '/should-know/cloud/personal-cloud-sync.html' },
  { key: 'page:/should-know/git/github-action', label: 'GitHub CI/CD', kind: 'project', route: '/should-know/git/github-action.html' },
  { key: 'page:/should-know/si-pi/ac-coupling', label: 'AC 耦合', kind: 'project', route: '/should-know/si-pi/ac-coupling.html' },
  { key: 'page:/should-know/si-pi/differential-signaling-lvds', label: '差分信号与 LVDS', kind: 'normal', route: '/should-know/si-pi/differential-signaling-lvds.html' }
]

const fallbackEdges: Array<[string, string]> = [
  ['page:/should-know/cloud/personal-cloud-sync', 'page:/should-know/git/github-action'],
  ['page:/should-know/si-pi/ac-coupling', 'page:/should-know/si-pi/differential-signaling-lvds'],
  ['page:/should-know/cloud/personal-cloud-sync', 'page:/should-know/si-pi/ac-coupling']
]

const graphData = generatedGraph.nodes.length && generatedGraph.edges.length
  ? generatedGraph
  : { nodes: fallbackNodes, edges: fallbackEdges }
const accessibleNodes = computed(() => graphData.nodes.filter((node): node is SeedNode & { route: string } => Boolean(node.route)))

const stageRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

let frameId = 0
let cleanupFns: Array<() => void> = []
let isVisible = false 
let needsRender = true

const wakeUp = () => { needsRender = true }

onMounted(() => {
  const stage = stageRef.value
  const canvas = canvasRef.value
  if (!stage || !canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const map = new Map<string, GraphNode>()
  graphData.nodes.forEach((seed, i) => {
    const route = seed.route || (seed.key.startsWith('page:') ? seed.key.slice(5) : undefined)
    map.set(seed.key, {
      id: i, label: seed.label, kind: seed.kind,
      x: (Math.random() - 0.5) * 800, y: (Math.random() - 0.5) * 600,
      vx: 0, vy: 0, r: 0, fixed: false, degree: 0,
      route
    })
  })

  const nodes = Array.from(map.values())
  const edges = graphData.edges
    .map(([a, b]) => {
      const na = map.get(a); const nb = map.get(b)
      if (!na || !nb) return null
      na.degree += 1; nb.degree += 1
      return { a: na.id, b: nb.id }
    })
    .filter((edge): edge is { a: number; b: number } => Boolean(edge))

  if (!nodes.length || !edges.length) return

  nodes.forEach(n => {
    n.r = n.kind === 'core' ? 16 : (n.degree > 3 ? 11 : (n.degree > 1 ? 7 : 5))
  })

  const state = {
    scale: 1, targetScale: 1,
    tx: 0, targetTx: 0, ty: 0, targetTy: 0,
    panning: false, draggingNode: null as GraphNode | null,
    pointerX: 0, pointerY: 0, pointerDownX: 0, pointerDownY: 0, hoverAnimTime: 0,
    hoverNode: null as GraphNode | null,
    focusNode: null as number | null
  }

  watch(isDark, () => { wakeUp() })

  const toWorld = (sx: number, sy: number) => {
    const w = stage.clientWidth; const h = stage.clientHeight
    return { x: (sx - w / 2 - state.tx) / state.scale, y: (sy - h / 2 - state.ty) / state.scale }
  }

  const toScreen = (wx: number, wy: number) => {
    const w = stage.clientWidth; const h = stage.clientHeight
    return { x: wx * state.scale + w / 2 + state.tx, y: wy * state.scale + h / 2 + state.ty }
  }

  const neighborsOf = (id: number) => {
    const set = new Set<number>([id])
    edges.forEach((e) => {
      if (e.a === id) set.add(e.b); if (e.b === id) set.add(e.a)
    })
    return set
  }

  const findNodeAt = (wx: number, wy: number) => {
    for (let i = nodes.length - 1; i >= 0; i -= 1) {
      const n = nodes[i]; const dx = wx - n.x; const dy = wy - n.y
      const rr = Math.max(14, n.r + 6)
      if (dx * dx + dy * dy <= rr * rr) return n
    }
    return null
  }

  const resize = () => {
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.floor(stage.clientWidth * dpr)
    canvas.height = Math.floor(stage.clientHeight * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    wakeUp()
  }

  const updatePhysics = (): boolean => {
    const damp = 0.88
    const adaptiveRepulsion = (n: GraphNode) => n.degree > 3 ? 2500 : (n.degree > 1 ? 1500 : 800)
    const centerGravity = 0.005 
    let totalKineticEnergy = 0

    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i]
      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j]
        let dx = b.x - a.x; let dy = b.y - a.y
        let d2 = dx * dx + dy * dy
        if (d2 < 0.01) d2 = 0.01
        const d = Math.sqrt(d2)
        const f = (adaptiveRepulsion(a) + adaptiveRepulsion(b)) / d2
        dx /= d; dy /= d
        if (!a.fixed) { a.vx -= dx * f; a.vy -= dy * f }
        if (!b.fixed) { b.vx += dx * f; b.vy += dy * f }
      }
    }

    edges.forEach(e => {
      const a = nodes[e.a]; const b = nodes[e.b]
      let dx = b.x - a.x; let dy = b.y - a.y
      const d = Math.sqrt(dx * dx + dy * dy) || 0.0001
      const targetLen = (a.degree > 3 || b.degree > 3) ? 140 : 90
      const stretch = d - targetLen
      const f = 0.003 * stretch
      dx /= d; dy /= d
      if (!a.fixed) { a.vx += dx * f; a.vy += dy * f }
      if (!b.fixed) { b.vx -= dx * f; b.vy -= dy * f }
    })

    nodes.forEach(n => {
      if (!n.fixed) { 
        n.vx += (0 - n.x) * centerGravity
        n.vy += (0 - n.y) * centerGravity
        n.vx *= damp; n.vy *= damp; n.x += n.vx; n.y += n.vy 
        totalKineticEnergy += Math.abs(n.vx) + Math.abs(n.vy)
      }
    })

    state.scale += (state.targetScale - state.scale) * 0.15
    state.tx += (state.targetTx - state.tx) * 0.15
    state.ty += (state.targetTy - state.ty) * 0.15

    const isCameraMoving = Math.abs(state.targetScale - state.scale) > 0.01 || Math.abs(state.targetTx - state.tx) > 0.5
    return totalKineticEnergy > 0.5 || state.draggingNode !== null || isCameraMoving
  }

  const draw = () => {
    const w = stage.clientWidth; const h = stage.clientHeight
    ctx.clearRect(0, 0, w, h)
    state.hoverAnimTime += 0.05

    const dark = isDark.value
    const activeNodeId = state.focusNode !== null ? state.focusNode : state.hoverNode?.id
    const activeNeighbors = activeNodeId != null ? neighborsOf(activeNodeId) : new Set<number>()

    // ==========================================
    // 🎨 用户定制纯色扁平配色方案
    // ==========================================
    const BASE_UNSELECTED = dark ? '#AAAAB3' : '#5C5C5C'
    const BASE_SELECTED   = dark ? '#8A5CEC' : '#8F6AEE'

    // 绘制连线
    edges.forEach(e => {
      const a = nodes[e.a]; const b = nodes[e.b]
      const pa = toScreen(a.x, a.y); const pb = toScreen(b.x, b.y)

      // 默认线透明度
      let alpha = dark ? 0.4 : 0.5
      let colorHex = BASE_UNSELECTED
      let width = 1

      // 连线激活状态判定
      if (activeNodeId != null) {
        const inFocus = activeNeighbors.has(a.id) && activeNeighbors.has(b.id)
        if (inFocus) { 
          colorHex = BASE_SELECTED
          alpha = dark ? 0.9 : 0.8
          width = 2
        } else { 
          // 暗化未选中的线
          alpha = dark ? 0.05 : 0.1
          colorHex = BASE_UNSELECTED 
        }
      }

      ctx.strokeStyle = hexToRgba(colorHex, alpha)
      ctx.lineWidth = width * (1 + state.scale * 0.2)
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke()
    })

    // 绘制节点 (彻底移除渐变和阴影)
    nodes.forEach(n => {
      const p = toScreen(n.x, n.y)
      let r = n.r * state.scale
      let alpha = 1 // 纯色设计下，默认保持完全不透明
      let colorHex = BASE_UNSELECTED

      // 节点激活状态判定
      if (activeNodeId != null) {
        if (!activeNeighbors.has(n.id)) { 
            // 边缘化节点降低透明度
            alpha = dark ? 0.15 : 0.2 
        } else if (n.id === activeNodeId) { 
            // 中心高亮节点
            colorHex = BASE_SELECTED
            r = Math.max(r, 22 * state.scale) 
        } else {
            // 被点亮的朋友圈节点
            colorHex = BASE_SELECTED
        }
      }

      // 悬停呼吸效果
      if (state.hoverNode?.id === n.id) {
        r += (2 + Math.sin(state.hoverAnimTime) * 1.5) * state.scale
      }

      // 1. 绘制扁平纯色圆
      ctx.globalAlpha = alpha
      ctx.fillStyle = colorHex
      ctx.beginPath()
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
      ctx.fill()
      
      // 2. 文本渲染
      // 为了在极简纯色下保持文字清晰度，未选中时字体跟随节点基色，选中时高亮
      let textColor = colorHex
      if (activeNodeId != null && activeNeighbors.has(n.id)) {
          textColor = dark ? '#FFFFFF' : '#000000' // 激活时用极致的黑白以区分
      }

      ctx.globalAlpha = alpha > 0.5 ? 1 : alpha
      ctx.fillStyle = textColor
      ctx.font = `${n.kind === 'core' ? 'bold' : 'normal'} 13px -apple-system,Segoe UI,sans-serif`
      
      if (state.scale > 0.5 || n.kind === 'core' || (activeNodeId != null && activeNeighbors.has(n.id))) {
        ctx.fillText(n.label, p.x + r + 6, p.y + 4)
      }
    })
    ctx.globalAlpha = 1
  }

  const tick = () => {
    if (isVisible) {
      if (needsRender) {
        const physicsActive = updatePhysics()
        draw()
        needsRender = physicsActive || state.hoverNode !== null || state.focusNode !== null
      }
    }
    frameId = requestAnimationFrame(tick)
  }

  const smoothFocus = (node: GraphNode | null) => {
    if (!node) {
      state.targetTx = 0; state.targetTy = 0; state.targetScale = 1
      state.focusNode = null
      wakeUp()
      return
    }
    state.targetTx = -node.x * state.targetScale
    state.targetTy = -node.y * state.targetScale
    state.targetScale = Math.max(1.8, state.scale)
    state.focusNode = node.id
    wakeUp()
  }

  const onPointerDown = (e: PointerEvent) => {
    wakeUp()
    const rect = stage.getBoundingClientRect()
    const wpos = toWorld(e.clientX - rect.left, e.clientY - rect.top)
    const hit = findNodeAt(wpos.x, wpos.y)
    
    state.pointerX = e.clientX; state.pointerY = e.clientY
    state.pointerDownX = e.clientX; state.pointerDownY = e.clientY
    if (hit) { state.draggingNode = hit; hit.fixed = true } 
    else { state.panning = true }
    stage.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: PointerEvent) => {
    const dx = e.clientX - state.pointerX; const dy = e.clientY - state.pointerY
    state.pointerX = e.clientX; state.pointerY = e.clientY

    const rect = stage.getBoundingClientRect()
    const wpos = toWorld(e.clientX - rect.left, e.clientY - rect.top)
    
    if (!state.draggingNode && !state.panning) {
      const newHover = findNodeAt(wpos.x, wpos.y)
      if (state.hoverNode?.id !== newHover?.id) {
        state.hoverNode = newHover
        wakeUp() 
      }
      stage.style.cursor = state.hoverNode ? 'pointer' : 'grab'
    }

    if (state.draggingNode) {
      state.draggingNode.x = wpos.x; state.draggingNode.y = wpos.y
      state.draggingNode.vx = 0; state.draggingNode.vy = 0
      stage.style.cursor = 'grabbing'
      wakeUp()
    } else if (state.panning) {
      state.targetTx += dx; state.targetTy += dy
      state.tx = state.targetTx; state.ty = state.targetTy
      stage.style.cursor = 'grabbing'
      wakeUp()
    }
  }

  const onPointerUp = (e: PointerEvent) => {
    if (state.draggingNode) state.draggingNode.fixed = false
    
    const rect = stage.getBoundingClientRect()
    const wpos = toWorld(e.clientX - rect.left, e.clientY - rect.top)
    const hit = findNodeAt(wpos.x, wpos.y)
    
    const pointerDistance = Math.hypot(e.clientX - state.pointerDownX, e.clientY - state.pointerDownY)
    const isClick = pointerDistance <= 5

    state.draggingNode = null; state.panning = false
    stage.style.cursor = state.hoverNode ? 'pointer' : 'grab'

    if (isClick && hit?.route) {
      window.location.href = withBase(hit.route)
    } else if (isClick) {
      smoothFocus(hit)
    }
    stage.releasePointerCapture(e.pointerId)
    wakeUp()
  }

  const onWheel = (e: WheelEvent) => {
    e.preventDefault()
    const rect = stage.getBoundingClientRect()
    const sx = e.clientX - rect.left; const sy = e.clientY - rect.top
    const before = toWorld(sx, sy)
    
    const factor = e.deltaY < 0 ? 1.2 : 0.8
    state.targetScale = Math.min(3.5, Math.max(0.2, state.targetScale * factor))
    state.targetTx -= before.x * (state.targetScale - state.scale)
    state.targetTy -= before.y * (state.targetScale - state.scale)
    wakeUp()
  }

  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting
    if (isVisible) wakeUp()
  }, { threshold: 0 })
  observer.observe(stage)

  resize(); stage.style.cursor = 'grab'; tick()

  window.addEventListener('resize', resize)
  stage.addEventListener('pointerdown', onPointerDown)
  stage.addEventListener('pointermove', onPointerMove)
  stage.addEventListener('pointerup', onPointerUp)
  stage.addEventListener('wheel', onWheel, { passive: false })
  stage.addEventListener('dblclick', () => smoothFocus(null))

  cleanupFns = [
    () => window.removeEventListener('resize', resize),
    () => stage.removeEventListener('pointerdown', onPointerDown),
    () => stage.removeEventListener('pointermove', onPointerMove),
    () => stage.removeEventListener('pointerup', onPointerUp),
    () => stage.removeEventListener('wheel', onWheel),
    () => observer.disconnect()
  ]
})

onUnmounted(() => {
  if (frameId) cancelAnimationFrame(frameId)
  cleanupFns.forEach((fn) => fn())
})
</script>

<style scoped>
.kg-wrap {
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  background-color: var(--vp-c-bg);
  transition: background-color 0.4s ease;
}

.kg-canvas { 
  width: 100%; 
  height: 100%; 
  display: block; 
  touch-action: none; 
}

.kg-accessible {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.kg-accessible:focus-within {
  position: absolute;
  z-index: 2;
  inset: 12px auto auto 12px;
  width: min(420px, calc(100% - 24px));
  height: auto;
  max-height: calc(100% - 24px);
  padding: 16px;
  margin: 0;
  overflow: auto;
  clip: auto;
  white-space: normal;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
}
</style>
