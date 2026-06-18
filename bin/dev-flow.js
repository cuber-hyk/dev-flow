#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const pluginRoot = path.resolve(__dirname, '..')
const templatesRoot = path.join(pluginRoot, 'templates')
const pluginName = 'cuberhyk-dev-flow'
const legacyPluginNames = ['dev-flow']
const skillNames = [
  'dev-init',
  'dev-check',
  'dev-orient',
  'dev-brainstorm',
  'dev-design-system',
  'dev-plan',
  'dev-audit',
  'dev-exploratory-review',
  'dev-branch',
  'dev-changelog',
  'dev-distill',
]
const allowedFindingStatuses = [
  'open',
  'planned',
  'resolved',
  'verified',
]
const allowedPlanStepStatuses = ['todo', 'done', 'blocked']
const resolvedNoVerificationCloseouts = ['accepted_risk', 'wont_fix', 'not_reproducible']
const unresolvedFindingStatuses = ['open', 'planned', 'not_verified']
const agentSectionStart = '<!-- cuberhyk-dev-flow:start -->'
const agentSectionEnd = '<!-- cuberhyk-dev-flow:end -->'

function usage() {
  console.log(`cuberhyk-dev-flow installer

Usage:
  node ./bin/dev-flow.js install
  node ./bin/dev-flow.js validate
  node ./bin/dev-flow.js init-project [project-dir]
  node ./bin/dev-flow.js init-design-system [project-dir]
  node ./bin/dev-flow.js validate-docs [project-dir]
  node ./bin/dev-flow.js paths

Options:
  DEV_FLOW_PLUGIN_DIR       Override plugin install directory
  DEV_FLOW_CODEX_MARKETPLACE Override Codex marketplace path

Claude Code local test:
  claude --plugin-dir <plugin-dir>
`)
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function ensureDir(target, created) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true })
    created.push(target)
  }
}

function writeIfMissing(file, content, created) {
  if (fs.existsSync(file)) return
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
  created.push(file)
}

function renderTemplate(content, vars) {
  return content.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, key) => vars[key] || '')
}

function writeTemplateIfMissing(source, target, vars, created) {
  const template = readText(path.join(templatesRoot, source))
  writeIfMissing(target, renderTemplate(template, vars), created)
}

function readText(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '') : ''
}

function readJson(file) {
  return JSON.parse(readText(file).replace(/^\uFEFF/, ''))
}

function walkMarkdown(dir) {
  if (!fs.existsSync(dir)) return []
  const result = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) result.push(...walkMarkdown(full))
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) result.push(full)
  }
  return result
}

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return null
  const values = {}
  for (const line of match[1].split(/\r?\n/)) {
    const item = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (item) values[item[1]] = item[2].replace(/^["']|["']$/g, '').trim()
  }
  return values
}

function isGitRepository(root) {
  try {
    execFileSync('git', ['-C', root, 'rev-parse', '--is-inside-work-tree'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    return true
  } catch {
    return false
  }
}

function gitIgnoredPaths(root, pathsToCheck) {
  const ignored = []
  for (const item of pathsToCheck) {
    try {
      const output = execFileSync('git', ['-C', root, 'check-ignore', item], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim()
      if (output) ignored.push(output)
    } catch {
      // git check-ignore exits non-zero when a path is not ignored.
    }
  }
  return [...new Set(ignored)]
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true })
    for (const entry of fs.readdirSync(src)) {
      if (entry === '.git' || entry === 'node_modules') continue
      copyRecursive(path.join(src, entry), path.join(dest, entry))
    }
    return
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
}

function removeDir(target) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true })
  }
}

function defaultPluginDir() {
  return (
    process.env.DEV_FLOW_PLUGIN_DIR ||
    path.join(os.homedir(), 'plugins', 'cuberhyk-plugins', 'plugins', pluginName)
  )
}

function defaultCodexMarketplacePath() {
  return (
    process.env.DEV_FLOW_CODEX_MARKETPLACE ||
    path.join(os.homedir(), 'plugins', 'cuberhyk-plugins', '.agents', 'plugins', 'marketplace.json')
  )
}

function toPosixRelative(from, to) {
  return `./${path.relative(from, to).split(path.sep).join('/')}`
}

function installCodexMarketplace(pluginDir) {
  const marketplacePath = defaultCodexMarketplacePath()
  const marketplaceRoot = path.dirname(marketplacePath)
  fs.mkdirSync(marketplaceRoot, { recursive: true })

  let marketplace = {
    name: 'personal',
    interface: {
      displayName: 'Personal',
    },
    plugins: [],
  }

  if (fs.existsSync(marketplacePath)) {
    marketplace = readJson(marketplacePath)
    marketplace.plugins ||= []
    marketplace.interface ||= { displayName: marketplace.name || 'Personal' }
  }

  const entry = {
    name: pluginName,
    source: {
      source: 'local',
      path: './plugins/cuberhyk-dev-flow',
    },
    policy: {
      installation: 'AVAILABLE',
      authentication: 'ON_INSTALL',
    },
    category: 'Productivity',
  }

  marketplace.plugins = marketplace.plugins.filter(
    (plugin) => !legacyPluginNames.includes(plugin.name) || plugin.name === pluginName
  )

  const index = marketplace.plugins.findIndex((plugin) => plugin.name === pluginName)
  if (index >= 0) {
    marketplace.plugins[index] = entry
  } else {
    marketplace.plugins.push(entry)
  }

  fs.writeFileSync(marketplacePath, `${JSON.stringify(marketplace, null, 2)}\n`)
  return marketplacePath
}

function installClaudeMarketplace(pluginDir) {
  const marketplaceRoot = path.resolve(pluginDir, '..', '..')
  const marketplacePath = path.join(marketplaceRoot, '.claude-plugin', 'marketplace.json')
  fs.mkdirSync(path.dirname(marketplacePath), { recursive: true })

  const marketplace = {
    name: 'cuberhyk-plugins',
    description: 'Local marketplace for cuber-hyk coding-agent plugins',
    owner: {
      name: 'cuber-hyk',
    },
    plugins: [
      {
        name: pluginName,
        description:
          'Init, check, orient, brainstorm, design-system, plan, audit, exploratory review, branch, changelog, and distill coding work across agent harnesses',
        version: readJson(path.join(pluginDir, 'package.json')).version,
        source: './plugins/cuberhyk-dev-flow',
        author: {
          name: 'cuber-hyk',
        },
      },
    ],
  }

  fs.writeFileSync(marketplacePath, `${JSON.stringify(marketplace, null, 2)}\n`)
  return marketplacePath
}

function validatePluginRoot(root = pluginRoot) {
  const required = [
    '.claude-plugin/plugin.json',
    '.codex-plugin/plugin.json',
    '.cursor-plugin/plugin.json',
    '.opencode/INSTALL.md',
    ...skillNames.map((name) => `commands/${name}.md`),
    ...skillNames.map((name) => `skills/${name}/SKILL.md`),
    ...skillNames.map((name) => `skills/${name}/agents/openai.yaml`),
    ...skillNames.map((name) => `skills/${name}/templates/output.md`),
    'templates/AGENTS.dev-flow.md',
    'templates/CHANGELOG.md',
    'templates/CONTEXT.md',
    'templates/DESIGN.md',
    'templates/design-tokens.json',
    'templates/docs/ai/context-map.md',
    'templates/docs/capabilities/_template.md',
    'templates/docs/plans/_template.md',
    'templates/docs/audits/_template.md',
    'templates/docs/adr/_template.md',
    'AGENTS.md',
    'CLAUDE.md',
    'GEMINI.md',
    'gemini-extension.json',
    'README.md',
    'docs/usage.html',
  ]

  const missing = required.filter((item) => !fs.existsSync(path.join(root, item)))
  if (missing.length > 0) {
    throw new Error(`Missing required files:\n${missing.map((item) => `- ${item}`).join('\n')}`)
  }

  const invalidOpenAiAgents = skillNames.filter((name) => {
    const text = readText(path.join(root, 'skills', name, 'agents', 'openai.yaml'))
    return !/^interface:\r?\n/.test(text)
  })

  if (invalidOpenAiAgents.length > 0) {
    throw new Error(
      `Invalid OpenAI agent metadata schema:\n${invalidOpenAiAgents
        .map((name) => `- skills/${name}/agents/openai.yaml must start with interface:`)
        .join('\n')}`
    )
  }

  const unprefixedOpenAiAgents = skillNames.filter((name) => {
    const text = readText(path.join(root, 'skills', name, 'agents', 'openai.yaml'))
    return !/^\s+display_name:\s+"Cuberhyk Dev Flow: /m.test(text)
  })

  if (unprefixedOpenAiAgents.length > 0) {
    throw new Error(
      `OpenAI agent display names must include the plugin prefix:\n${unprefixedOpenAiAgents
        .map((name) => `- skills/${name}/agents/openai.yaml`)
        .join('\n')}`
    )
  }

  const devBranchOutput = readText(path.join(root, 'skills', 'dev-branch', 'templates', 'output.md'))
  const requiredReviewFields = [
    'Subagent review gate:',
    'Mode: subagent/manual',
    'Plan compliance:',
    'Audit coverage:',
    'Related changes only:',
    'Verification evidence:',
    'Changelog gate:',
    'Distill gate:',
    'Check gate:',
    'Blocking issues:',
  ]
  const missingReviewFields = requiredReviewFields.filter((field) => !devBranchOutput.includes(field))
  if (missingReviewFields.length > 0) {
    throw new Error(
      `Dev Branch output template is missing independent review fields:\n${missingReviewFields
        .map((field) => `- ${field}`)
        .join('\n')}`
    )
  }
}

function ensureAgents(targetRoot, vars, created) {
  const file = path.join(targetRoot, 'AGENTS.md')
  const section = renderTemplate(readText(path.join(templatesRoot, 'AGENTS.dev-flow.md')), vars)

  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, section)
    created.push(file)
    return
  }

  const text = readText(file)
  if (text.includes(agentSectionStart)) return

  const separator = text.endsWith('\n') ? '\n' : '\n\n'
  fs.writeFileSync(file, `${text}${separator}${section}`)
  created.push(`${file}#dev-flow-section`)
}

function initProject() {
  const targetRoot = path.resolve(process.argv[3] || process.cwd())
  const created = []
  const day = today()
  const vars = {
    DATE: day,
    PROJECT_NAME: path.basename(targetRoot),
    AGENT_SECTION_START: agentSectionStart,
    AGENT_SECTION_END: agentSectionEnd,
  }

  const dirs = [
    'docs/ai',
    'docs/capabilities',
    'docs/plans',
    'docs/plans/archived',
    'docs/audits',
    'docs/audits/archived',
    'docs/adr',
    'docs/adr/archived',
  ]

  for (const dir of dirs) ensureDir(path.join(targetRoot, dir), created)

  ensureAgents(targetRoot, vars, created)
  writeTemplateIfMissing('CONTEXT.md', path.join(targetRoot, 'CONTEXT.md'), vars, created)
  writeTemplateIfMissing('CHANGELOG.md', path.join(targetRoot, 'CHANGELOG.md'), vars, created)
  writeTemplateIfMissing(
    'docs/ai/context-map.md',
    path.join(targetRoot, 'docs/ai/context-map.md'),
    vars,
    created
  )
  writeTemplateIfMissing(
    'docs/capabilities/_template.md',
    path.join(targetRoot, 'docs/capabilities/_template.md'),
    vars,
    created
  )
  writeTemplateIfMissing(
    'docs/plans/_template.md',
    path.join(targetRoot, 'docs/plans/_template.md'),
    vars,
    created
  )
  writeTemplateIfMissing(
    'docs/audits/_template.md',
    path.join(targetRoot, 'docs/audits/_template.md'),
    vars,
    created
  )
  writeTemplateIfMissing(
    'docs/adr/_template.md',
    path.join(targetRoot, 'docs/adr/_template.md'),
    vars,
    created
  )

  const gitkeepDirs = [
    'docs/capabilities',
    'docs/plans',
    'docs/plans/archived',
    'docs/audits',
    'docs/audits/archived',
    'docs/adr',
    'docs/adr/archived',
  ]

  for (const dir of gitkeepDirs) {
    writeIfMissing(path.join(targetRoot, dir, '.gitkeep'), '', created)
  }

  console.log(`cuberhyk-dev-flow project memory initialized: ${targetRoot}`)
  if (created.length === 0) {
    console.log('No files or directories were created; everything already exists.')
    return
  }
  console.log('Created:')
  for (const item of created) {
    if (typeof item === 'string' && item.endsWith('#dev-flow-section')) {
      console.log(`- ${path.relative(targetRoot, item.replace('#dev-flow-section', ''))} (appended Dev Flow section)`)
    } else {
      console.log(`- ${path.relative(targetRoot, item)}`)
    }
  }
}

function initDesignSystem() {
  const targetRoot = path.resolve(process.argv[3] || process.cwd())
  const created = []
  const vars = {
    DATE: today(),
    PROJECT_NAME: path.basename(targetRoot),
  }

  writeTemplateIfMissing('DESIGN.md', path.join(targetRoot, 'DESIGN.md'), vars, created)
  writeTemplateIfMissing('design-tokens.json', path.join(targetRoot, 'design-tokens.json'), vars, created)

  console.log(`cuberhyk-dev-flow design system initialized: ${targetRoot}`)
  if (created.length === 0) {
    console.log('No files were created; DESIGN.md and design-tokens.json already exist.')
    return
  }
  console.log('Created:')
  for (const item of created) console.log(`- ${path.relative(targetRoot, item)}`)
  console.log('Populate and review confirmed rules and token values before treating the contract as authoritative.')
}

function hasHeading(text, heading) {
  return new RegExp(`^##\\s+${heading}\\s*$`, 'im').test(text)
}

function extractMarkdownTables(text) {
  const lines = text.split(/\r?\n/)
  const tables = []
  for (let index = 0; index < lines.length; index += 1) {
    const header = lines[index]
    const separator = lines[index + 1]
    if (!header?.trim().startsWith('|') || !separator?.trim().startsWith('|')) continue
    if (!/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(separator)) continue
    const rows = []
    let cursor = index + 2
    while (cursor < lines.length && lines[cursor].trim().startsWith('|')) {
      rows.push(lines[cursor])
      cursor += 1
    }
    const headers = header
      .split('|')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
    tables.push({ headers, rows })
    index = cursor - 1
  }
  return tables
}

function auditFindingTables(text) {
  return extractMarkdownTables(text).filter((table) =>
    table.headers.some((header) => ['finding', 'findings', '问题', '问题描述'].includes(header))
  )
}

function planStepTables(text) {
  return extractMarkdownTables(text).filter((table) =>
    table.headers.includes('status') && table.headers.some((header) => ['step', 'task', 'verification'].includes(header))
  )
}

function rowCell(table, row, header) {
  const index = table.headers.indexOf(header)
  if (index < 0) return ''
  const cells = row
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split('|')
    .map((item) => item.trim())
  return cells[index] || ''
}

function rowStatus(table, row) {
  return rowCell(table, row, 'status').toLowerCase()
}

function rowCloseout(table, row) {
  return rowCell(table, row, 'closeout').toLowerCase()
}

function auditHasUnresolvedSignals(text) {
  const tableHasUnresolvedStatus = auditFindingTables(text).some((table) =>
    table.rows.some((row) => {
      const status = rowStatus(table, row)
      if (unresolvedFindingStatuses.includes(status)) return true
      if (status !== 'resolved') return false
      const closeout = rowCloseout(table, row)
      return !resolvedNoVerificationCloseouts.some((reason) => closeout.includes(reason))
    })
  )
  const legacyUnresolvedSignals =
    /(^|\n)#{2,4}\s*(Critical|High)\b|待进一步调查|推荐下一步|Recommended next step|Next step|Not verified|Open questions/i.test(
      text
    )
  return tableHasUnresolvedStatus || legacyUnresolvedSignals
}

function validateDocs() {
  const targetRoot = path.resolve(process.argv[3] || process.cwd())
  const warnings = []
  const errors = []

  const recommended = [
    'AGENTS.md',
    'CHANGELOG.md',
    'CONTEXT.md',
    'docs/ai/context-map.md',
    'docs/capabilities',
    'docs/plans',
    'docs/plans/archived',
    'docs/audits',
    'docs/audits/archived',
    'docs/adr',
    'docs/adr/archived',
  ]

  for (const item of recommended) {
    if (!fs.existsSync(path.join(targetRoot, item))) warnings.push(`Missing recommended path: ${item}`)
  }

  const designPath = path.join(targetRoot, 'DESIGN.md')
  const tokenPath = path.join(targetRoot, 'design-tokens.json')
  if (fs.existsSync(designPath) || fs.existsSync(tokenPath)) {
    if (!fs.existsSync(designPath)) warnings.push('design-tokens.json exists but DESIGN.md is missing.')
    if (!fs.existsSync(tokenPath)) warnings.push('DESIGN.md exists but design-tokens.json is missing.')
  }

  if (fs.existsSync(designPath)) {
    const design = readText(designPath)
    for (const heading of ['Authority And Scope', 'Sources', 'Foundations', 'Component Rules', 'Known Gaps']) {
      if (!hasHeading(design, heading)) warnings.push(`DESIGN.md should contain ## ${heading}.`)
    }
    const references = [...design.matchAll(/`([^`]+\.(?:tsx?|jsx?|css|scss|json|stories\.[A-Za-z0-9]+))`/g)]
      .map((match) => match[1])
      .filter((ref) => !ref.includes('*') && !ref.includes('Add project-specific'))
    for (const ref of references) {
      if (!fs.existsSync(path.join(targetRoot, ref))) warnings.push(`DESIGN.md references missing source: ${ref}`)
    }
  }

  if (fs.existsSync(tokenPath)) {
    try {
      const tokens = readJson(tokenPath)
      if (!tokens || Array.isArray(tokens) || typeof tokens !== 'object') {
        warnings.push('design-tokens.json should contain a token object.')
      }
      const tokenText = readText(tokenPath)
      const hasType = /"\$type"\s*:/.test(tokenText)
      const hasValue = /"\$value"\s*:/.test(tokenText)
      if (hasType !== hasValue) {
        warnings.push('design-tokens.json should use $type and $value token fields.')
      }
    } catch (error) {
      errors.push(`design-tokens.json is invalid JSON: ${error.message}`)
    }
  }

  if (isGitRepository(targetRoot)) {
    const ignored = gitIgnoredPaths(targetRoot, [
      'AGENTS.md',
      'CHANGELOG.md',
      'CONTEXT.md',
      'docs/ai/context-map.md',
      'docs/capabilities',
      'docs/capabilities/.gitkeep',
      'docs/plans',
      'docs/plans/.gitkeep',
      'docs/plans/archived',
      'docs/plans/archived/.gitkeep',
      'docs/audits',
      'docs/audits/.gitkeep',
      'docs/audits/archived',
      'docs/audits/archived/.gitkeep',
      'docs/adr',
      'docs/adr/.gitkeep',
      'docs/adr/archived',
      'docs/adr/archived/.gitkeep',
    ])

    for (const item of ignored) {
      warnings.push(
        `Git ignore hides Dev Flow path: ${item}; add a minimal allow rule or report that artifacts there will not be tracked.`
      )
    }
  }

  const capabilityFiles = walkMarkdown(path.join(targetRoot, 'docs/capabilities'))
  for (const file of capabilityFiles) {
    const rel = path.relative(targetRoot, file).split(path.sep).join('/')
    const text = readText(file)
    const fm = parseFrontmatter(text)
    if (path.basename(file) === '_template.md') continue
    if (!/source_of_truth:/i.test(text)) warnings.push(`Capability should declare source_of_truth: ${rel}`)
    if (/(audit|audits|plan|plans|findings)/i.test(path.basename(file))) {
      errors.push(`Process artifact appears to be stored in capabilities: ${rel}`)
    }
    if (/artifact_type:\s*(audit|plan)/i.test(text)) {
      errors.push(`Capability file declares audit/plan artifact_type: ${rel}`)
    }
    if (/##\s*(Findings|Audit|Issues|Review)/i.test(text)) {
      warnings.push(`Capability file may contain audit findings; keep only current facts: ${rel}`)
    }
    if (fm?.artifact_type && fm.artifact_type !== 'capability') {
      warnings.push(`Capability artifact_type should be capability: ${rel}`)
    }
  }

  const statusRules = {
    'docs/plans': ['active', 'archived'],
    'docs/audits': ['active', 'archived'],
  }
  const disallowedLifecycleStatuses = ['completed', 'distilled', 'superseded', 'deprecated']

  for (const [dir, allowedStatuses] of Object.entries(statusRules)) {
    const files = walkMarkdown(path.join(targetRoot, dir))
    for (const file of files) {
      const rel = path.relative(targetRoot, file).split(path.sep).join('/')
      if (path.basename(file) === '_template.md') continue
      const text = readText(file)
      const fm = parseFrontmatter(text)
      if (!fm?.status) {
        warnings.push(`Process artifact should include frontmatter status: ${rel}`)
      } else if (!allowedStatuses.includes(fm.status)) {
        warnings.push(
          `Process artifact has invalid status "${fm.status}" in ${rel}; expected one of ${allowedStatuses.join(', ')}`
        )
      }
      if (fm?.status && disallowedLifecycleStatuses.includes(fm.status)) {
        warnings.push(
          `Process artifact uses disallowed lifecycle status "${fm.status}" in ${rel}; use active, archived, or delete the file.`
        )
      }
      if (!fm?.updated) warnings.push(`Process artifact should include frontmatter updated: ${rel}`)
      if (!fm?.artifact_type) warnings.push(`Process artifact should include frontmatter artifact_type: ${rel}`)
      if (rel.includes('/archived/') && fm?.status === 'active') {
        errors.push(`Archived artifact should not remain active: ${rel}`)
      }
      if (fm?.status === 'archived' && !rel.includes('/archived/')) {
        warnings.push(`Archived ${fm.artifact_type || 'artifact'} should be moved under an archived/ directory: ${rel}`)
      }

      if (fm?.artifact_type === 'plan') {
        const hasUnresolvedDecision =
          /(decision point|待确认|需要用户确认|needs user confirmation|blocked by decision|option\s+[ab]|方案\s*[AB]|if choose|if selected|TBD|TODO decision)/i.test(
            text
          )
        const readinessBlocked = /plan_readiness:\s*(blocked|not_ready|not-ready)/i.test(text)
        if (hasUnresolvedDecision || readinessBlocked) {
          warnings.push(
            `Plan may contain unresolved decision points; keep decision requests in conversation and write only confirmed execution routes: ${rel}`
          )
        }
        const stepTables = planStepTables(text)
        if (hasHeading(text, 'Steps And Verification') && stepTables.length === 0) {
          warnings.push(`Plan Steps And Verification section should contain a status table: ${rel}`)
        }
        for (const table of stepTables) {
          for (const row of table.rows) {
            const status = rowStatus(table, row)
            if (status && !allowedPlanStepStatuses.includes(status)) {
              warnings.push(
                `Plan step has invalid status "${status}" in ${rel}; expected one of ${allowedPlanStepStatuses.join(', ')}`
              )
            }
          }
        }
      }

      if (dir === 'docs/audits') {
        const auditFields = ['artifact_type', 'status', 'created', 'updated', 'scope', 'source_of_truth']
        for (const field of auditFields) {
          if (!fm?.[field]) warnings.push(`Audit should include frontmatter ${field}: ${rel}`)
        }
        if (fm?.artifact_type && fm.artifact_type !== 'audit') {
          warnings.push(`Audit artifact_type should be audit: ${rel}`)
        }

        const findingTables = auditFindingTables(text)
        if (hasHeading(text, 'Findings') && findingTables.length === 0) {
          warnings.push(`Audit Findings section should contain a markdown findings table: ${rel}`)
        }
        for (const table of findingTables) {
          for (const requiredHeader of ['id', 'severity', 'status', 'finding', 'evidence']) {
            if (!table.headers.includes(requiredHeader)) {
              warnings.push(`Audit findings table should include ${requiredHeader.toUpperCase()} column: ${rel}`)
            }
          }
          if (!table.headers.includes('owner plan')) {
            warnings.push(`Audit findings table should include Owner Plan column for multi-plan follow-up: ${rel}`)
          }
          if (!table.headers.includes('branch/commit')) {
            warnings.push(`Audit findings table should include Branch/Commit column for branch traceability: ${rel}`)
          }
          for (const row of table.rows) {
            const status = rowStatus(table, row)
            if (status && !allowedFindingStatuses.includes(status)) {
              warnings.push(
                `Audit finding has invalid status "${status}" in ${rel}; expected one of ${allowedFindingStatuses.join(', ')}`
              )
            }
            if (status === 'resolved' && !rowCloseout(table, row)) {
              warnings.push(`Audit finding with status "resolved" should include a Closeout reason: ${rel}`)
            }
          }
        }
        if (rel.includes('/archived/') && auditHasUnresolvedSignals(text)) {
          errors.push(
            `Archived audit appears to contain unresolved findings or follow-up work; keep it active under docs/audits/: ${rel}`
          )
        }
      }
    }
  }

  const adrFiles = walkMarkdown(path.join(targetRoot, 'docs/adr'))
  const adrStatuses = ['proposed', 'accepted', 'archived']
  for (const file of adrFiles) {
    const rel = path.relative(targetRoot, file).split(path.sep).join('/')
    if (path.basename(file) === '_template.md') continue
    const fm = parseFrontmatter(readText(file))
    if (!fm?.status) warnings.push(`ADR should include frontmatter status: ${rel}`)
    else if (!adrStatuses.includes(fm.status)) {
      warnings.push(`ADR has invalid status "${fm.status}" in ${rel}; expected one of ${adrStatuses.join(', ')}`)
    }
    if (fm?.status && disallowedLifecycleStatuses.includes(fm.status)) {
      warnings.push(
        `ADR uses disallowed lifecycle status "${fm.status}" in ${rel}; use proposed, accepted, archived, or delete the file.`
      )
    }
    if (!fm?.updated) warnings.push(`ADR should include frontmatter updated: ${rel}`)
    if (rel.includes('/archived/') && fm?.status !== 'archived') {
      warnings.push(`ADR under archived/ should use status: archived: ${rel}`)
    }
    if (fm?.status === 'archived' && !rel.includes('/archived/')) {
      warnings.push(`Archived ADR should be moved under docs/adr/archived/: ${rel}`)
    }
  }

  const changelogPath = path.join(targetRoot, 'CHANGELOG.md')
  if (fs.existsSync(changelogPath)) {
    const changelog = readText(changelogPath)
    const allowedCategories = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security']
    if (!/^## \[Unreleased\]/m.test(changelog)) {
      warnings.push('CHANGELOG.md should contain a top-level ## [Unreleased] section.')
    }
    const releasedHeadings = [...changelog.matchAll(/^## \[([^\]]+)\](?:\s*-\s*(.*))?$/gm)]
    for (const [, version, date] of releasedHeadings) {
      if (version === 'Unreleased') continue
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
        warnings.push(`CHANGELOG.md release heading should use ISO date: ## [${version}] - YYYY-MM-DD`)
      }
    }
    const categoryHeadings = [...changelog.matchAll(/^### (.+)$/gm)].map((match) => match[1].trim())
    for (const heading of categoryHeadings) {
      if (!allowedCategories.includes(heading)) {
        warnings.push(
          `CHANGELOG.md uses non-standard category "${heading}"; expected ${allowedCategories.join(', ')}.`
        )
      }
    }
    if (/git log|commit history|commit log/i.test(changelog)) {
      warnings.push('CHANGELOG.md appears to reference raw commit history; keep changelog entries human-readable.')
    }
  }

  const decisionPattern =
    /(decision|decided|choose|chosen|adopt|architecture|source of truth|fact source|migration|algorithm|policy|ADR|决策|决定|选择|采用|架构|事实源|算法|策略)/
  const adrReviewedPattern = /(ADR gate|ADR|docs\/adr|adr_required|adr_reviewed)/i
  for (const dir of ['docs/plans', 'docs/audits', 'docs/capabilities']) {
    const files = walkMarkdown(path.join(targetRoot, dir))
    for (const file of files) {
      const rel = path.relative(targetRoot, file).split(path.sep).join('/')
      if (path.basename(file) === '_template.md') continue
      const text = readText(file)
      if (decisionPattern.test(text) && !adrReviewedPattern.test(text)) {
        warnings.push(
          `Possible long-term decision without ADR gate review: ${rel}; run dev-distill if this is a hard-to-reverse tradeoff.`
        )
      }
    }
  }

  const contextMap = readText(path.join(targetRoot, 'docs/ai/context-map.md'))
  if (contextMap) {
    const mentionsProcessDirs = /docs\/(plans|audits)|archived\//i.test(contextMap)
    const marksNonDefault = /do not read|not read by default|do not default/i.test(contextMap)
    if (mentionsProcessDirs && !marksNonDefault) {
      warnings.push('context-map references plans/audits/archived without a non-default-read rule.')
    }

    const references = [...contextMap.matchAll(/`?(docs\/[A-Za-z0-9_./*-]+(?:\.md|\/)?)`?/g)]
      .map((match) => match[1])
      .filter((ref) => !ref.includes('*'))
    for (const ref of references) {
      if (!fs.existsSync(path.join(targetRoot, ref))) {
        warnings.push(`context-map references missing path: ${ref}`)
      }
    }
  }

  console.log(`cuberhyk-dev-flow docs validation: ${targetRoot}`)
  if (errors.length === 0 && warnings.length === 0) {
    console.log('No issues found.')
    return
  }
  if (errors.length > 0) {
    console.log('Errors:')
    for (const item of errors) console.log(`- ${item}`)
  }
  if (warnings.length > 0) {
    console.log('Warnings:')
    for (const item of warnings) console.log(`- ${item}`)
  }
  if (errors.length > 0) process.exitCode = 1
}

function install() {
  validatePluginRoot(pluginRoot)
  const pluginDir = defaultPluginDir()
  const sourceRoot = pluginRoot

  if (path.resolve(pluginDir) === path.resolve(sourceRoot)) {
    const marketplacePath = installCodexMarketplace(pluginDir)
    const claudeMarketplacePath = installClaudeMarketplace(pluginDir)
    printSuccess(pluginDir, marketplacePath, claudeMarketplacePath)
    return
  }

  removeDir(pluginDir)
  copyRecursive(sourceRoot, pluginDir)
  const marketplacePath = installCodexMarketplace(pluginDir)
  const claudeMarketplacePath = installClaudeMarketplace(pluginDir)
  printSuccess(pluginDir, marketplacePath, claudeMarketplacePath)
}

function printSuccess(pluginDir, marketplacePath, claudeMarketplacePath) {
  console.log('cuberhyk-dev-flow installed.')
  console.log(`Plugin directory: ${pluginDir}`)
  console.log(`Codex marketplace: ${marketplacePath}`)
  console.log(`Claude marketplace: ${claudeMarketplacePath}`)
  console.log('')
  console.log('Claude Code local test:')
  console.log(`  claude --plugin-dir "${pluginDir}"`)
  console.log('')
  console.log('Claude Code marketplace install:')
  console.log(`  /plugin marketplace add "${path.resolve(pluginDir, '..', '..')}"`)
  console.log('  /plugin install cuberhyk-dev-flow@cuberhyk-plugins')
  console.log('')
  console.log('Codex:')
  console.log('  Open /plugins and install cuberhyk-dev-flow from the cuberhyk-plugins marketplace.')
}

function paths() {
  console.log(`Source plugin root: ${pluginRoot}`)
  console.log(`Install plugin dir: ${defaultPluginDir()}`)
  console.log(`Codex marketplace: ${defaultCodexMarketplacePath()}`)
}

const command = process.argv[2] || 'install'

try {
  if (command === 'install') install()
  else if (command === 'init-project') initProject()
  else if (command === 'init-design-system') initDesignSystem()
  else if (command === 'validate-docs') validateDocs()
  else if (command === 'validate') {
    validatePluginRoot(pluginRoot)
    console.log('cuberhyk-dev-flow package structure is valid.')
  } else if (command === 'paths') paths()
  else if (command === 'help' || command === '--help' || command === '-h') usage()
  else {
    usage()
    process.exitCode = 1
  }
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
