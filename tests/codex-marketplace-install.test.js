import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const { installCodexMarketplace, registerCodexMarketplace } = await import(
  new URL('../bin/dev-flow.js', import.meta.url)
)
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cuberhyk-dev-flow-install-'))
const previousMarketplacePath = process.env.DEV_FLOW_CODEX_MARKETPLACE

try {
  const marketplacePath = path.join(tempRoot, '.agents', 'plugins', 'marketplace.json')
  process.env.DEV_FLOW_CODEX_MARKETPLACE = marketplacePath
  const writtenMarketplacePath = installCodexMarketplace(path.join(tempRoot, 'plugins', 'cuberhyk-dev-flow'))
  const marketplace = JSON.parse(fs.readFileSync(writtenMarketplacePath, 'utf8'))
  const calls = []
  const registered = registerCodexMarketplace(writtenMarketplacePath, (args) => {
    calls.push(args)
    if (args.join(' ') === 'plugin marketplace list --json') return JSON.stringify({ marketplaces: [] })
    return ''
  })

  assert.equal(marketplace.name, 'cuberhyk-plugins')
  assert.equal(marketplace.plugins[0].source.path, './plugins/cuberhyk-dev-flow')
  assert.deepEqual(calls, [
    ['plugin', 'marketplace', 'list', '--json'],
    ['plugin', 'marketplace', 'add', tempRoot],
  ])
  assert.equal(registered.status, 'registered')

  const unavailable = registerCodexMarketplace(writtenMarketplacePath, () => {
    throw new Error('Codex CLI was not found')
  })
  assert.equal(unavailable.status, 'manual-required')
  assert.equal(unavailable.marketplaceRoot, tempRoot)

  console.log('Codex marketplace installation scenarios passed: 2')
} finally {
  if (previousMarketplacePath === undefined) delete process.env.DEV_FLOW_CODEX_MARKETPLACE
  else process.env.DEV_FLOW_CODEX_MARKETPLACE = previousMarketplacePath
  fs.rmSync(tempRoot, { recursive: true, force: true })
}
