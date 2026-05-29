#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const pluginRoot = path.resolve(__dirname, '..')
const pluginName = 'cuberhyk-dev-flow'
const legacyPluginNames = ['dev-flow']

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
    'skills/dev-distill/SKILL.md',
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

function initProject() {
  const targetRoot = path.resolve(process.argv[3] || process.cwd())
  const created = []
  const day = today()

  const dirs = [
    'docs/ai',
    'docs/capabilities',
    'docs/plans',
    'docs/audits',
    'docs/audits/archived',
    'docs/adr',
  ]

  for (const dir of dirs) ensureDir(path.join(targetRoot, dir), created)

  writeIfMissing(
    path.join(targetRoot, 'CONTEXT.md'),
    `# Project Context

This file stores stable domain vocabulary and business concepts only.

## Domain Vocabulary

| Term | Definition |
|---|---|

## Maintenance Rules

- Add terms here only when they are reused across modules.
- Put implementation details in the relevant capability document.
- Put audit reports in \`docs/audits/\`, not here.
`,
    created
  )

  writeIfMissing(
    path.join(targetRoot, 'docs/ai/context-map.md'),
    `# AI Context Map

This file routes AI agents to current context without reading process noise.

## Default Entry

1. Read \`AGENTS.md\` or \`CLAUDE.md\` when present.
2. Read \`CONTEXT.md\`.
3. Select only task-relevant \`docs/capabilities/*.md\`.
4. Read only code entry points named by the selected capability docs.

## Memory Rules

- Do not read \`docs/plans/\` by default.
- Do not read \`docs/audits/\` by default.
- Do not read any \`archived/\` directory by default.
- Treat code and tests as the final source of truth when docs disagree.

## Task Routes

| Task type | Read first | Code entry points |
|---|---|---|

## Updated

- ${day}: Initialized cuberhyk-dev-flow context map.
`,
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
  for (const item of created) console.log(`- ${path.relative(targetRoot, item)}`)
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
