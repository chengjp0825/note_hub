import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const distDir = path.join(repoRoot, 'docs/.vitepress/dist')
const questionPage = path.join(distDir, 'question-bank/index.html')
const detailsDir = path.join(distDir, 'generated/question-bank')

if (!fs.existsSync(questionPage)) throw new Error('[build-check] Missing question-bank/index.html')
if (!fs.existsSync(detailsDir)) throw new Error('[build-check] Missing generated question-bank details')

const html = fs.readFileSync(questionPage, 'utf8')
if (/rel="modulepreload"[^>]+(?:details-|mathjax)/.test(html)) {
  throw new Error('[build-check] Question page eagerly preloads answer details or MathJax')
}

const detailFiles = fs.readdirSync(detailsDir).filter((name) => /^details-\d+\.json$/.test(name)).sort()
if (detailFiles.length === 0) throw new Error('[build-check] No question detail shards were generated')

for (const name of detailFiles) {
  const payload = JSON.parse(fs.readFileSync(path.join(detailsDir, name), 'utf8'))
  if (payload.version !== 1 || !payload.questions || typeof payload.questions !== 'object') {
    throw new Error(`[build-check] Invalid question detail shard: ${name}`)
  }
  if (Object.keys(payload.questions).length === 0) {
    throw new Error(`[build-check] Empty question detail shard: ${name}`)
  }
}

const forbiddenPublicDir = path.join(distDir, 'question-bank')
const forbiddenPublicFiles = fs.existsSync(forbiddenPublicDir)
  ? fs.readdirSync(forbiddenPublicDir).filter((name) => /^details-\d+\.json$|^index\.json$/.test(name))
  : []
if (forbiddenPublicFiles.length > 0) {
  throw new Error(`[build-check] Stale question-bank JSON remains in the public route: ${forbiddenPublicFiles.join(', ')}`)
}

console.log(`[build-check] Verified ${detailFiles.length} lazy question detail shards.`)
