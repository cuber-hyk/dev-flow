import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')

const skill = read('skills/dev-branch/SKILL.md')
const output = read('skills/dev-branch/templates/output.md')
const command = read('commands/dev-branch.md')

const scenarios = [
  {
    name: 'plan source',
    checks: [
      [skill, 'active plan or audit source when applicable'],
      [output, 'Plan compliance: pass/fail/not applicable'],
    ],
  },
  {
    name: 'audit source',
    checks: [
      [skill, 'active plan or audit source when applicable'],
      [output, 'Audit coverage: pass/fail/not applicable'],
    ],
  },
  {
    name: 'unrelated dirty files',
    checks: [
      [skill, 'Stop for unrelated or ambiguous existing changes'],
      [output, 'Related changes only: pass/fail'],
    ],
  },
  {
    name: 'docs-changing branch',
    checks: [
      [skill, 'Run the check gate before review when changelog, distill, documentation routing'],
      [output, 'Check gate: needed/not needed - <reason>'],
    ],
  },
  {
    name: 'subagent or manual review ownership',
    checks: [
      [skill, 'This gate is mandatory. Choose exactly one mode:'],
      [skill, 'independently verify subagent findings and inspect the final diff'],
      [command, 'Run the mandatory independent review gate in subagent mode'],
      [output, 'Mode: subagent/manual'],
    ],
  },
]

for (const scenario of scenarios) {
  for (const [text, expected] of scenario.checks) {
    assert.ok(text.includes(expected), `${scenario.name}: missing contract text "${expected}"`)
  }
}

console.log(`dev-branch review gate scenarios passed: ${scenarios.length}`)
