import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const templates = {
  'templates/DESIGN.md': ['artifact_type', 'status', 'updated', 'token_source'],
  'templates/docs/capabilities/_template.md': ['artifact_type', 'status', 'updated', 'source_of_truth'],
  'templates/docs/plans/_template.md': ['artifact_type', 'status', 'created', 'updated', 'owner'],
  'templates/docs/audits/_template.md': ['artifact_type', 'status', 'created', 'updated', 'scope', 'source_of_truth'],
  'templates/docs/adr/_template.md': ['artifact_type', 'status', 'created', 'updated', 'source_of_truth'],
}

for (const [relativePath, requiredFields] of Object.entries(templates)) {
  const text = fs.readFileSync(path.join(root, relativePath), 'utf8')
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n\r?\n# /)
  assert.ok(match, `${relativePath}: YAML frontmatter must end before the Markdown title`)
  for (const field of requiredFields) {
    assert.match(match[1], new RegExp(`^${field}:`, 'm'), `${relativePath}: missing ${field}`)
  }
}

const skillContract = /Never\s+(?:render metadata\s+fields as Markdown headings or\s+body text|move\s+metadata fields into headings or body text)\./
for (const skill of ['dev-plan', 'dev-audit', 'dev-exploratory-review', 'dev-design-system', 'dev-distill']) {
  const text = fs.readFileSync(path.join(root, 'skills', skill, 'SKILL.md'), 'utf8')
  assert.match(text, skillContract, `${skill}: missing frontmatter rendering contract`)
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cuberhyk-dev-flow-frontmatter-'))
try {
  const badPlanPath = path.join(tempRoot, 'docs', 'plans', 'bad-plan.md')
  fs.mkdirSync(path.dirname(badPlanPath), { recursive: true })
  fs.writeFileSync(
    badPlanPath,
    'artifact_type: plan\nstatus: active\ncreated: 2026-08-22\nupdated: 2026-08-22\nowner: agent\n\n# Plan Title\n'
  )

  const result = spawnSync(process.execPath, [path.join(root, 'bin', 'dev-flow.js'), 'validate-docs', tempRoot], {
    encoding: 'utf8',
  })
  assert.equal(result.status, 1, result.stdout || result.stderr)
  assert.match(
    result.stdout,
    /docs\/plans\/bad-plan\.md must start with YAML frontmatter delimited by ---/,
    result.stdout
  )
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true })
}

console.log(`Frontmatter contract passed: ${Object.keys(templates).length} templates and invalid artifact rejection`)
