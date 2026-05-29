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
  return process.env.DEV_FLOW_PLUGIN_DIR || path.join(os.homedir(), 'plugins', pluginName)
}

function defaultCodexMarketplacePath() {
  return (
    process.env.DEV_FLOW_CODEX_MARKETPLACE ||
    path.join(os.homedir(), '.agents', 'plugins', 'marketplace.json')
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
    marketplace = JSON.parse(fs.readFileSync(marketplacePath, 'utf8'))
    marketplace.plugins ||= []
    marketplace.interface ||= { displayName: marketplace.name || 'Personal' }
  }

  const entry = {
    name: pluginName,
    source: {
      source: 'local',
      path: toPosixRelative(marketplaceRoot, pluginDir),
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

function validatePluginRoot(root = pluginRoot) {
  const required = [
    '.claude-plugin/plugin.json',
    '.codex-plugin/plugin.json',
    '.cursor-plugin/plugin.json',
    '.opencode/INSTALL.md',
    'skills/dev-orient/SKILL.md',
    'skills/dev-plan/SKILL.md',
    'skills/dev-audit/SKILL.md',
    'skills/dev-distill/SKILL.md',
    'skills/dev-init/SKILL.md',
    'skills/dev-check/SKILL.md',
    'templates/AGENTS.dev-flow.md',
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
    'docs/audits',
    'docs/audits/archived',
    'docs/adr',
  ]

  for (const dir of dirs) ensureDir(path.join(targetRoot, dir), created)

  ensureAgents(targetRoot, vars, created)
  writeTemplateIfMissing('CONTEXT.md', path.join(targetRoot, 'CONTEXT.md'), vars, created)
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
    'docs/audits',
    'docs/audits/archived',
    'docs/adr',
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
    'docs/audits',
    'docs/audits/archived',
    'docs/adr',
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
      'docs/audits',
      'docs/audits/.gitkeep',
      'docs/audits/archived',
      'docs/audits/archived/.gitkeep',
      'docs/adr',
      'docs/adr/.gitkeep',
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
    'CONTEXT.md',
    'docs/ai/context-map.md',
    'docs/capabilities',
    'docs/plans',
    'docs/audits',
    'docs/audits/archived',
    'docs/adr',
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
      'docs/audits',
      'docs/audits/.gitkeep',
      'docs/audits/archived',
      'docs/audits/archived/.gitkeep',
      'docs/adr',
      'docs/adr/.gitkeep',
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
    'docs/plans': ['active', 'completed', 'superseded', 'archived'],
    'docs/audits': ['active', 'distilled', 'archived'],
  }

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
      if (!fm?.updated) warnings.push(`Process artifact should include frontmatter updated: ${rel}`)
      if (!fm?.artifact_type) warnings.push(`Process artifact should include frontmatter artifact_type: ${rel}`)
      if (rel.includes('/archived/') && fm?.status === 'active') {
        warnings.push(`Archived artifact should not remain active: ${rel}`)
      }
    }
  }

  const adrFiles = walkMarkdown(path.join(targetRoot, 'docs/adr'))
  const adrStatuses = ['proposed', 'accepted', 'superseded', 'deprecated']
  for (const file of adrFiles) {
    const rel = path.relative(targetRoot, file).split(path.sep).join('/')
    if (path.basename(file) === '_template.md') continue
    const fm = parseFrontmatter(readText(file))
    if (!fm?.status) warnings.push(`ADR should include frontmatter status: ${rel}`)
    else if (!adrStatuses.includes(fm.status)) {
      warnings.push(`ADR has invalid status "${fm.status}" in ${rel}; expected one of ${adrStatuses.join(', ')}`)
    }
    if (!fm?.updated) warnings.push(`ADR should include frontmatter updated: ${rel}`)
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
    printSuccess(pluginDir, marketplacePath)
    return
  }

  removeDir(pluginDir)
  copyRecursive(sourceRoot, pluginDir)
  const marketplacePath = installCodexMarketplace(pluginDir)
  printSuccess(pluginDir, marketplacePath)
}

function printSuccess(pluginDir, marketplacePath) {
  console.log('cuberhyk-dev-flow installed.')
  console.log(`Plugin directory: ${pluginDir}`)
  console.log(`Codex marketplace: ${marketplacePath}`)
  console.log('')
  console.log('Claude Code local test:')
  console.log(`  claude --plugin-dir "${pluginDir}"`)
  console.log('')
  console.log('Claude Code marketplace install:')
  console.log(`  /plugin marketplace add "${pluginDir}"`)
  console.log('  /plugin install cuberhyk-dev-flow@cuberhyk-plugins')
  console.log('')
  console.log('Codex:')
  console.log('  Open /plugins and install cuberhyk-dev-flow from your personal marketplace.')
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
