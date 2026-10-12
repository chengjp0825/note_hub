import MarkdownIt from 'markdown-it'
import { createContentLoader, type ContentData } from 'vitepress'

type NodeKind = 'core' | 'project' | 'normal'

interface GraphNodeData {
  key: string
  label: string
  kind: NodeKind
  route?: string
}

interface GraphData {
  nodes: GraphNodeData[]
  edges: Array<[string, string]>
}

const includePrefixes = [
  '/should-know',
  '/protocols',
  '/microcontrollers',
  '/fpga',
  '/datasheets',
  '/interview-questions'
]

const markdown = new MarkdownIt({ html: false })

function normalizePath(value: string): string {
  const segments: string[] = []
  value.split('/').forEach((segment) => {
    if (!segment || segment === '.') return
    if (segment === '..') {
      segments.pop()
      return
    }
    segments.push(segment)
  })
  return `/${segments.join('/')}`
}

function normalizeRoute(value: string): string {
  let route = value.trim().split('#')[0].split('?')[0]
  if (!route) return ''
  route = normalizePath(route.replace(/\\/g, '/'))
  route = route.replace(/\.(md|html)$/i, '').replace(/\/index$/i, '')
  return route !== '/' && route.endsWith('/') ? route.slice(0, -1) : route
}

function isArticleRoute(route: string): boolean {
  return includePrefixes.some((prefix) => route === prefix || route.startsWith(`${prefix}/`))
}

function resolveLink(link: string, fromRoute: string, fromUrl: string): string {
  const target = link.trim()
  if (!target || /^(https?:|mailto:|tel:|#)/i.test(target)) return ''
  if (target.startsWith('/')) return normalizeRoute(target)
  const baseDirectory = fromUrl.endsWith('/') || /\/index\.html$/i.test(fromUrl)
    ? fromRoute
    : fromRoute.replace(/\/[^/]*$/, '') || '/'
  return normalizeRoute(`${baseDirectory}/${target}`)
}

function extractLinks(source: string, fromRoute: string, fromUrl: string): Set<string> {
  const links = new Set<string>()
  const tokens = markdown.parse(source, {})
  tokens.forEach((token) => {
    if (token.type !== 'inline' || !token.children) return
    token.children.forEach((child) => {
      if (child.type !== 'link_open') return
      const href = child.attrGet('href')
      if (!href) return
      const resolved = resolveLink(href, fromRoute, fromUrl)
      if (isArticleRoute(resolved)) links.add(resolved)
    })
  })
  return links
}

function extractTitle(entry: ContentData): string {
  if (typeof entry.frontmatter.title === 'string' && entry.frontmatter.title.trim()) {
    return entry.frontmatter.title.trim()
  }
  const tokens = markdown.parse(entry.src || '', {})
  const headingIndex = tokens.findIndex((token) => token.type === 'heading_open' && token.tag === 'h1')
  const heading = headingIndex >= 0 ? tokens[headingIndex + 1] : undefined
  if (heading?.type === 'inline' && heading.content.trim()) return heading.content.trim()
  const route = normalizeRoute(entry.url)
  return route.split('/').pop() || route
}

function nodeKind(degree: number): NodeKind {
  if (degree >= 4) return 'core'
  if (degree >= 2) return 'project'
  return 'normal'
}

function buildGraph(entries: ContentData[]): GraphData {
  const entriesByRoute = new Map<string, ContentData>()
  const labels = new Map<string, string>()
  const outgoing = new Map<string, Set<string>>()

  entries.forEach((entry) => {
    const route = normalizeRoute(entry.url)
    if (!isArticleRoute(route)) return
    entriesByRoute.set(route, entry)
    labels.set(route, extractTitle(entry))
    outgoing.set(route, extractLinks(entry.src || '', route, entry.url))
  })

  const routeDegrees = new Map<string, number>()
  const routeEdges = new Set<string>()
  outgoing.forEach((targets, source) => {
    targets.forEach((target) => {
      if (target === source || !outgoing.get(target)?.has(source)) return
      const edge = [source, target].sort().join('::')
      if (routeEdges.has(edge)) return
      routeEdges.add(edge)
      routeDegrees.set(source, (routeDegrees.get(source) || 0) + 1)
      routeDegrees.set(target, (routeDegrees.get(target) || 0) + 1)
    })
  })

  const conceptByRoute = new Map<string, string>()
  const conceptLabels = new Map<string, string>()
  const conceptRoutes = new Map<string, string[]>()
  labels.forEach((label, route) => {
    const concept = label.replace(/\s+/g, ' ').trim()
    conceptByRoute.set(route, concept)
    conceptLabels.set(concept, conceptLabels.get(concept) || label)
    conceptRoutes.set(concept, [...(conceptRoutes.get(concept) || []), route])
  })

  const conceptDegrees = new Map<string, number>()
  const conceptEdges = new Set<string>()
  routeEdges.forEach((edge) => {
    const [leftRoute, rightRoute] = edge.split('::')
    const left = conceptByRoute.get(leftRoute)
    const right = conceptByRoute.get(rightRoute)
    if (!left || !right || left === right) return
    const conceptEdge = [left, right].sort().join('::')
    if (conceptEdges.has(conceptEdge)) return
    conceptEdges.add(conceptEdge)
    conceptDegrees.set(left, (conceptDegrees.get(left) || 0) + 1)
    conceptDegrees.set(right, (conceptDegrees.get(right) || 0) + 1)
  })

  const primaryRoute = (routes: string[]): string | undefined => [...routes].sort((left, right) => {
    const degreeDifference = (routeDegrees.get(right) || 0) - (routeDegrees.get(left) || 0)
    return degreeDifference || left.localeCompare(right)
  })[0]

  const nodes = [...conceptDegrees.keys()].map((concept) => {
    const route = primaryRoute(conceptRoutes.get(concept) || [])
    return {
      key: `concept:${concept}`,
      label: conceptLabels.get(concept) || concept,
      kind: nodeKind(conceptDegrees.get(concept) || 0),
      route: route ? entriesByRoute.get(route)?.url : undefined
    }
  })
  const edges = [...conceptEdges].map((edge) => {
    const [left, right] = edge.split('::')
    return [`concept:${left}`, `concept:${right}`] as [string, string]
  })

  return { nodes, edges }
}

export default createContentLoader('**/*.md', {
  includeSrc: true,
  transform: buildGraph
})
