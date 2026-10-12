import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'

const repoRoot = process.cwd()
const sourceDir = path.join(repoRoot, 'content/question-bank')
const rawSourceDir = path.join(repoRoot, 'content/question-bank-raw')
const taxonomyFile = path.join(repoRoot, 'content/question-bank-taxonomy.yaml')
const indexOutputDir = path.join(repoRoot, 'docs/.vitepress/generated/question-bank')
const detailsOutputDir = path.join(repoRoot, 'docs/public/generated/question-bank')
const validRoles = new Set(['hardware', 'embedded-linux', 'embedded-mcu', 'fpga'])
const questionsPerShard = 16
const fail = (file, message) => { throw new Error(`[question-bank] ${path.relative(repoRoot, file)}: ${message}`) }

function stringArray(value, field, file) {
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== 'string' || !item.trim())) fail(file, `${field} must be a non-empty string array`)
  const normalized = value.map((item) => item.trim())
  if (new Set(normalized).size !== normalized.length) fail(file, `${field} must not contain duplicates`)
  return [...normalized].sort((a, b) => a.localeCompare(b, 'zh-CN'))
}

function writeJson(file, value) { fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8') }

function requiredString(value, field, file) {
  if (typeof value !== 'string' || !value.trim()) fail(file, `${field} must be a non-empty string`)
  return value.trim()
}

function optionalString(value, field, file) {
  if (value === null || value === undefined) return null
  return requiredString(value, field, file)
}

function sourceUrl(value, file) {
  if (value === null || value === undefined) return null
  const url = new URL(requiredString(value, 'url', file))
  if (url.protocol !== 'https:') fail(file, 'url must use HTTPS')
  return url.href
}

function normalizeAnswer(value, field, file) {
  const answer = value.trim()
  if (/\$\$|\\\(|\\\[/.test(answer)) fail(file, `${field} contains unsupported mathematical markup`)
  let body
  if (answer.startsWith('## 作答要点')) {
    body = answer.slice('## 作答要点'.length).trim()
  } else if (answer.startsWith('参考回答：')) {
    const paragraph = answer.slice('参考回答：'.length).trim()
    if (!paragraph) fail(file, `${field} must contain answer content`)
    const sentences = [...new Intl.Segmenter('zh-CN', { granularity: 'sentence' }).segment(paragraph)].map(({ segment }) => segment.trim()).filter(Boolean)
    body = sentences.map((sentence) => `- ${sentence}`).join('\n')
  } else {
    fail(file, `${field} must start with "## 作答要点" or "参考回答："`)
  }
  const lines = body.split('\n').map((line) => line.trim()).filter(Boolean)
  if (lines.length < 1 || lines.length > 6 || lines.some((line) => !line.startsWith('- '))) {
    fail(file, `${field} must contain one to six flat bullet points`)
  }
  return lines.join('\n')
}

function sourceRounds(round, questionBankId, file) {
  const rounds = Array.isArray(round) ? round : [round]
  if (rounds.some((item) => typeof item !== 'string' || !item.trim())) fail(file, 'round must be a non-empty string or string array')
  if (rounds.length === 1) return rounds
  const match = questionBankId.match(/-round(\d+)-/)
  if (!match) return rounds
  const selected = rounds[Number(match[1]) - 1]
  return selected ? [selected] : rounds
}

function loadSources() {
  if (!fs.existsSync(rawSourceDir)) throw new Error(`[question-bank] Source directory does not exist: ${path.relative(repoRoot, rawSourceDir)}`)
  const sources = new Map()
  const files = fs.readdirSync(rawSourceDir).filter((name) => /\.ya?ml$/i.test(name)).sort().map((name) => path.join(rawSourceDir, name))
  for (const file of files) {
    const raw = parse(fs.readFileSync(file, 'utf8'))
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) fail(file, 'must contain a YAML object')
    if (!Array.isArray(raw.questions)) fail(file, 'questions must be an array')
    for (const item of raw.questions) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) fail(file, 'each question must be an object')
      const { raw_question: rawQuestion, classification, question_bank_id: questionBankId } = item
      if (questionBankId === null) continue
      if (typeof questionBankId !== 'string' || !questionBankId) fail(file, 'question_bank_id must be a non-empty string or null')
      if (typeof rawQuestion !== 'string' || !rawQuestion.trim()) fail(file, 'raw_question must be a non-empty string')
      if (!['GENERAL', 'GENERALIZABLE', 'PROJECT', 'BEHAVIORAL'].includes(classification)) fail(file, 'classification is invalid')
      if (raw.year !== null && raw.year !== undefined && (!Number.isInteger(raw.year) || raw.year < 2000 || raw.year > 2100)) fail(file, 'year must be an integer between 2000 and 2100 or null')
      const source = {
        rawQuestion: rawQuestion.trim(),
        classification,
        company: requiredString(raw.company, 'company', file),
        role: requiredString(raw.role, 'role', file),
        rounds: sourceRounds(raw.round, questionBankId, file),
        year: raw.year ?? null,
        location: optionalString(raw.location, 'location', file),
        platform: requiredString(raw.platform, 'platform', file),
        url: sourceUrl(raw.url, file),
        author: requiredString(raw.author, 'author', file),
        sourceType: requiredString(raw.source_type, 'source_type', file),
        transcription: requiredString(raw.transcription, 'transcription', file)
      }
      const entries = sources.get(questionBankId) || []
      entries.push(source)
      sources.set(questionBankId, entries)
    }
  }
  return sources
}

function main() {
  const taxonomy = parse(fs.readFileSync(taxonomyFile, 'utf8'))
  const topics = taxonomy.topics
  if (!topics || typeof topics !== 'object' || Array.isArray(topics)) throw new Error('[question-bank] taxonomy must define a topics object')
  const topicNames = new Set(Object.keys(topics))
  if (!fs.existsSync(sourceDir)) throw new Error(`[question-bank] Source directory does not exist: ${path.relative(repoRoot, sourceDir)}`)
  const files = fs.readdirSync(sourceDir).filter((name) => /\.ya?ml$/i.test(name)).sort().map((name) => path.join(sourceDir, name))
  if (files.length === 0) throw new Error('[question-bank] No YAML question files found')
  const shardCount = Math.ceil(files.length / questionsPerShard)
  const ids = new Set()
  const sources = loadSources()
  const index = []
  const shards = Array.from({ length: shardCount }, () => ({ version: 1, questions: {} }))

  for (const [questionIndex, file] of files.entries()) {
    const raw = parse(fs.readFileSync(file, 'utf8'))
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) fail(file, 'must contain a YAML object')
    const { id, question, roles, companies, topic, tags, answers } = raw
    if (typeof id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) fail(file, 'id must be lowercase kebab-case')
    if (ids.has(id)) fail(file, `duplicate id "${id}"`)
    ids.add(id)
    if (typeof question !== 'string' || !question.trim()) fail(file, 'question must be a non-empty Markdown string')
    const normalizedRoles = stringArray(roles, 'roles', file)
    if (normalizedRoles.some((role) => !validRoles.has(role))) fail(file, `roles must be one of: ${[...validRoles].join(', ')}`)
    const normalizedCompanies = stringArray(companies, 'companies', file)
    if (typeof topic !== 'string' || !topicNames.has(topic)) fail(file, 'topic must exist in the controlled taxonomy')
    const normalizedTags = stringArray(tags, 'tags', file)
    if (normalizedTags.length > 3) fail(file, 'tags must contain at most three values')
    const allowedTags = new Set(topics[topic])
    if (normalizedTags.some((tag) => !allowedTags.has(tag))) fail(file, `tags must belong to topic "${topic}"`)
    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) fail(file, 'answers must be an object')
    const answerViews = Object.keys(answers).sort()
    if (answerViews.length === 0) fail(file, 'answers must contain at least one view')
    const normalizedAnswers = {}
    for (const view of answerViews) {
      if (!validRoles.has(view)) fail(file, `answers.${view} is not a supported role`)
      if (typeof answers[view] !== 'string' || !answers[view].trim()) fail(file, `answers.${view} must be a non-empty Markdown string`)
      normalizedAnswers[view] = normalizeAnswer(answers[view], `answers.${view}`, file)
    }
    const shard = Math.floor(questionIndex / questionsPerShard)
    const questionSources = sources.get(id) || []
    if (questionSources.length === 0) fail(file, 'must have at least one matching raw question source')
    index.push({ id, question: question.trim(), roles: normalizedRoles, companies: normalizedCompanies, topic, tags: normalizedTags, answerViews, sources: questionSources, shard })
    shards[shard].questions[id] = { answers: normalizedAnswers }
  }
  for (const id of sources.keys()) if (!ids.has(id)) throw new Error(`[question-bank] raw source references missing formal question "${id}"`)
  fs.rmSync(indexOutputDir, { recursive: true, force: true })
  fs.rmSync(detailsOutputDir, { recursive: true, force: true })
  fs.mkdirSync(indexOutputDir, { recursive: true })
  fs.mkdirSync(detailsOutputDir, { recursive: true })
  writeJson(path.join(indexOutputDir, 'index.json'), { version: 1, questions: index.sort((a, b) => a.id.localeCompare(b.id)) })
  shards.forEach((shard, index) => writeJson(path.join(detailsOutputDir, `details-${String(index).padStart(2, '0')}.json`), shard))
  console.log(`[question-bank] Built ${files.length} questions into 1 index and ${shardCount} detail shards.`)
}

main()
