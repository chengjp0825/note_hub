<script setup lang="ts">
import { onMounted, onUnmounted, ref, toRaw } from 'vue'
import { useData } from 'vitepress'

const props = withDefaults(defineProps<{
  graph: string
  id: string
  class?: string
}>(), {
  class: 'mermaid'
})

const { page } = useData()
const { frontmatter } = toRaw(page.value)
const pageTheme = frontmatter.mermaidTheme || ''
const svg = ref('')

let observer: MutationObserver | undefined
let renderSequence = 0

async function renderChart() {
  const { default: mermaid } = await import('mermaid')
  const dark = document.documentElement.classList.contains('dark')

  mermaid.initialize({
    securityLevel: 'loose',
    startOnLoad: false,
    theme: dark ? 'dark' : pageTheme || 'default'
  })

  const renderId = `${props.id}-${++renderSequence}`
  const result = await mermaid.render(renderId, decodeURIComponent(props.graph))
  svg.value = result.svg
}

onMounted(async () => {
  observer = new MutationObserver(() => {
    void renderChart()
  })
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })

  await renderChart()
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div :class="props.class" v-html="svg"></div>
</template>
