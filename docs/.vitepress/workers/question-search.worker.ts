import MiniSearch from 'minisearch'

interface QuestionIndex { id: string; question: string; roles: string[]; companies: string[]; topic: string; tags: string[] }
let questions: QuestionIndex[] = []
let search: MiniSearch<QuestionIndex>
const normalize = (value: string) => value.trim().toLocaleLowerCase()

self.onmessage = (event: MessageEvent) => {
  if (event.data.type === 'init') {
    questions = event.data.questions
    search = new MiniSearch({ fields: ['question', 'rolesText', 'companiesText', 'tagsText'], storeFields: ['id'], searchOptions: { prefix: true, fuzzy: 0.15 } })
    search.addAll(questions.map((item) => ({ ...item, rolesText: item.roles.join(' '), companiesText: item.companies.join(' '), tagsText: item.tags.join(' ') })))
    self.postMessage({ type: 'ready' })
    return
  }
  if (event.data.type === 'search') {
    const query = normalize(event.data.query || '')
    const roles: string[] = event.data.roles || []
    const company: string | null = event.data.company || null
    const tag: string | null = event.data.tag || null
    const topic: string | null = event.data.topic || null
    const ids = query ? new Set(search.search(query, { prefix: true, fuzzy: 0.15 }).map((result) => result.id)) : null
    const results = questions.filter((item) => (!ids || ids.has(item.id)) && (!roles.length || roles.some((role) => item.roles.includes(role))) && (!company || item.companies.includes(company)) && (!tag || item.tags.includes(tag)) && (!topic || item.topic === topic)).map((item) => item.id)
    self.postMessage({ type: 'results', requestId: event.data.requestId, ids: results })
  }
}
