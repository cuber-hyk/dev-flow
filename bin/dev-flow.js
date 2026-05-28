#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const pluginRoot = path.resolve(__dirname, '..')
const pluginName = 'dev-flow'

function usage() {
  console.log(`Dev Flow installer

Usage:
  npx dev-flow-agent install
  npx dev-flow-agent validate
  npx dev-flow-agent paths

Options:
  DEV_FLOW_PLUGIN_DIR       Override plugin install directory
  DEV_FLOW_CODEX_MARKETPLACE Override Codex marketplace path

Claude Code local test:
  claude --plugin-dir <plugin-dir>
`)
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
  ]

  const missing = required.filter((item) => !fs.existsSync(path.join(root, item)))
  if (missing.length > 0) {
    throw new Error(`Missing required files:\n${missing.map((item) => `- ${item}`).join('\n')}`)
  }
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
  console.log('Dev Flow installed.')
  console.log(`Plugin directory: ${pluginDir}`)
  console.log(`Codex marketplace: ${marketplacePath}`)
  console.log('')
  console.log('Claude Code local test:')
  console.log(`  claude --plugin-dir "${pluginDir}"`)
  console.log('')
  console.log('Claude Code marketplace install:')
  console.log(`  /plugin marketplace add "${pluginDir}"`)
  console.log('  /plugin install dev-flow@dev-flow-local')
  console.log('')
  console.log('Codex:')
  console.log('  Open /plugins and install Dev Flow from your personal marketplace.')
}

function paths() {
  console.log(`Source plugin root: ${pluginRoot}`)
  console.log(`Install plugin dir: ${defaultPluginDir()}`)
  console.log(`Codex marketplace: ${defaultCodexMarketplacePath()}`)
}

const command = process.argv[2] || 'install'

try {
  if (command === 'install') install()
  else if (command === 'validate') {
    validatePluginRoot(pluginRoot)
    console.log('Dev Flow package structure is valid.')
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
