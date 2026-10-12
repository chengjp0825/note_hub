<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import { computed } from 'vue'

const props = defineProps<{ content: string }>()
const renderer = new MarkdownIt({ html: false, linkify: true, breaks: true })
const html = computed(() => renderer.render(props.content))
</script>

<template>
  <article class="vp-doc" v-html="html" />
</template>
