import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const skillRoot = path.join(root, 'skills')
const policy = [
  'Default to Chinese for user-facing replies and documents created by this workflow.',
  'Follow an explicit user language request or a documented existing repository language convention instead.',
  'Keep code, commands, APIs, identifiers, paths, configuration keys, and required schema/status values in English.',
]
const skills = fs
  .readdirSync(skillRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)

assert.equal(skills.length, 12, 'Expected the complete Dev Flow skill set')

for (const skill of skills) {
  const text = fs.readFileSync(path.join(skillRoot, skill, 'SKILL.md'), 'utf8')
  for (const rule of policy) {
    assert.ok(text.includes(rule), `${skill}: missing language policy rule "${rule}"`)
  }
}

const agentTemplate = fs.readFileSync(path.join(root, 'templates', 'AGENTS.dev-flow.md'), 'utf8')
for (const rule of policy) {
  assert.ok(agentTemplate.includes(rule), `AGENTS template: missing language policy rule "${rule}"`)
}

console.log(`Language policy coverage passed: ${skills.length} skills and AGENTS template`)
