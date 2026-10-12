import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import MarkdownIt from 'markdown-it';

const repoRoot = process.cwd();
const docsRoot = path.join(repoRoot, 'docs');
const markdownParser = new MarkdownIt({ html: false });

function getMarkdownFiles() {
  const args = process.argv.slice(2);
  const diffIndex = args.indexOf('--diff');
  const diffRange = diffIndex === -1 ? null : args[diffIndex + 1];

  if (diffIndex !== -1 && !diffRange) {
    throw new Error('--diff requires a Git revision range, for example origin/main..HEAD');
  }

  const gitArgs = diffRange
    ? ['diff', diffRange, '--name-only', '--diff-filter=ACMR', '--', 'docs']
    : ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '--', 'docs'];
  const deletedArgs = diffRange
    ? ['diff', diffRange, '--name-only', '--diff-filter=D', '--', 'docs']
    : ['diff', '--cached', '--name-only', '--diff-filter=D', '--', 'docs'];
  const deleted = execFileSync('git', deletedArgs, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
  if (deleted) {
    return fs.readdirSync(docsRoot, { recursive: true })
      .map((file) => path.join('docs', String(file)))
      .filter((file) => /\.(md|mdx)$/i.test(file) && fs.statSync(path.join(repoRoot, file)).isFile());
  }

  const output = execFileSync('git', gitArgs, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((file) => /\.(md|mdx)$/i.test(file));
}

function extractLinks(markdown) {
  const links = [];
  const tokens = markdownParser.parse(markdown, {});
  for (const token of tokens) {
    if (token.type !== 'inline' || !token.children) continue;
    for (const child of token.children) {
      if (child.type === 'link_open') {
        const target = child.attrGet('href');
        if (target) links.push(target);
      }
      if (child.type === 'image') {
        const target = child.attrGet('src');
        if (target) links.push(target);
      }
    }
  }
  return links;
}

function toFsPath(fromFileAbs, linkPath) {
  if (linkPath.startsWith('/')) {
    return path.join(docsRoot, linkPath.slice(1));
  }
  return path.resolve(path.dirname(fromFileAbs), linkPath);
}

function candidatePaths(basePath) {
  const ext = path.extname(basePath);

  if (ext) {
    return [basePath];
  }

  const withSlashTrimmed = basePath.replace(/[\\/]+$/, '');
  return [
    `${withSlashTrimmed}.md`,
    `${withSlashTrimmed}.mdx`,
    path.join(withSlashTrimmed, 'index.md'),
    path.join(withSlashTrimmed, 'index.mdx'),
  ];
}

function isExternal(target) {
  return /^(https?:|mailto:|tel:|javascript:)/i.test(target);
}

function validateFile(relPath) {
  const absPath = path.join(repoRoot, relPath);
  if (!fs.existsSync(absPath)) {
    return [];
  }

  const content = fs.readFileSync(absPath, 'utf8');
  const links = extractLinks(content);
  const errors = [];

  for (const target of links) {
    if (isExternal(target) || target.startsWith('#')) {
      continue;
    }

    const [linkPath] = target.split('#');
    if (!linkPath) {
      continue;
    }

    const decoded = decodeURIComponent(linkPath);
    const base = toFsPath(absPath, decoded);
    const candidates = candidatePaths(base);
    const exists = candidates.some((candidate) => fs.existsSync(candidate));

    if (!exists) {
      errors.push({
        file: relPath,
        target,
      });
    }
  }

  return errors;
}

function main() {
  let stagedFiles;

  try {
    stagedFiles = getMarkdownFiles();
  } catch (error) {
    console.error('[check:staged-doc-links] Failed to read changed files.');
    console.error(String(error));
    process.exit(1);
  }

  if (stagedFiles.length === 0) {
    console.log('[check:staged-doc-links] No matching docs markdown files.');
    process.exit(0);
  }

  const allErrors = stagedFiles.flatMap((file) => validateFile(file));

  if (allErrors.length > 0) {
    console.error('[check:staged-doc-links] Broken local links detected:');
    for (const err of allErrors) {
      console.error(`- ${err.file} -> ${err.target}`);
    }
    process.exit(1);
  }

  console.log(`[check:staged-doc-links] OK (${stagedFiles.length} file(s) checked).`);
}

main();
