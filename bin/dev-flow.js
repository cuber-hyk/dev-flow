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
const agentSectionStart = '<!-- cuberhyk-dev-flow:start -->'
const agentSectionEnd = '<!-- cuberhyk-dev-flow:end -->'

function usage() {
  console.log(`cuberhyk-dev-flow installer

Usage:
  npx cuberhyk-dev-flow install
  npx cuberhyk-dev-flow validate
  npx cuberhyk-dev-flow init-project [project-dir]
  npx cuberhyk-dev-flow validate-docs [project-dir]
  npx cuberhyk-dev-flow paths

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
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''
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
          'Init, check, orient, plan, audit, exploratory review, branch, changelog, and distill coding work across agent harnesses',
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
    'commands/dev-init.md',
    'commands/dev-check.md',
    'commands/dev-orient.md',
    'commands/dev-plan.md',
    'commands/dev-audit.md',
    'commands/dev-branch.md',
    'commands/dev-exploratory-review.md',
    'commands/dev-changelog.md',
    'commands/dev-distill.md',
    'skills/dev-orient/SKILL.md',
    'skills/dev-plan/SKILL.md',
    'skills/dev-audit/SKILL.md',
    'skills/dev-branch/SKILL.md',
    'skills/dev-exploratory-review/SKILL.md',
    'skills/dev-changelog/SKILL.md',
    'skills/dev-distill/SKILL.md',
    'skills/dev-init/SKILL.md',
    'skills/dev-check/SKILL.md',
    'templates/AGENTS.dev-flow.md',
    'templates/CHANGELOG.md',
    'templates/CONTEXT.md',
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

function validateDocs() {
  const targetRoot = path.resolve(process.argv[3] || process.cwd())
  const warnings = []
  const errors = []

  const recommended = [
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

  if (isGitRepository(targetRoot)) {
    const ignored = gitIgnoredPaths(targetRoot, [
      'AGENTS.md',
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
    if (/(audit|audits|plan|plans|审查|审核|计划)/i.test(path.basename(file))) {
      errors.push(`Process artifact appears to be stored in capabilities: ${rel}`)
    }
    if (/artifact_type:\s*(audit|plan)/i.test(text)) {
      errors.push(`Capability file declares audit/plan artifact_type: ${rel}`)
    }
    if (/##\s*(Findings|审查|问题清单|Audit)/i.test(text)) {
      warnings.push(`Capability file may contain audit findings; keep only current facts: ${rel}`)
    }
  }

  for (const dir of ['docs/plans', 'docs/audits']) {
    const files = walkMarkdown(path.join(targetRoot, dir))
    for (const file of files) {
      const rel = path.relative(targetRoot, file).split(path.sep).join('/')
      const text = readText(file)
      if (!/^---[\s\S]*?status:/m.test(text)) {
        warnings.push(`Process artifact should include frontmatter status: ${rel}`)
      }
    }
  }

  const contextMap = readText(path.join(targetRoot, 'docs/ai/context-map.md'))
  if (contextMap) {
    const mentionsProcessDirs = /docs\/(plans|audits)|archived\//i.test(contextMap)
    const marksNonDefault = /do not read|不默认读取|not read by default/i.test(contextMap)
    if (mentionsProcessDirs && !marksNonDefault) {
      warnings.push('context-map references plans/audits/archived without a non-default-read rule.')
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

function validateDocsV2() {
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
      const fm = parseFrontmatter(readText(file))
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
        warnings.push(`Archived artifact should not remain active: ${rel}`)
      }
      if (fm?.status === 'archived' && !rel.includes('/archived/')) {
        warnings.push(`Archived ${fm.artifact_type || 'artifact'} should be moved under an archived/ directory: ${rel}`)
      }

      if (fm?.artifact_type === 'plan') {
        const text = readText(file)
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
  else if (command === 'validate-docs') validateDocsV2()
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
