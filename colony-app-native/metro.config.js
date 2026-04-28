// Metro config — extend default to watch the shared packages/ directory at repo root
// so colony-app-native can import from packages/spice-shared/* via relative paths.
const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const config = getDefaultConfig(__dirname)
const projectRoot = __dirname
const repoRoot    = path.resolve(projectRoot, '..')

// Watch the parent (so packages/spice-shared/* changes are picked up)
config.watchFolders = [...(config.watchFolders || []), repoRoot]

// Tell Metro to also resolve modules from the repo root's node_modules
// in case shared packages later add transitive deps.
config.resolver.nodeModulesPaths = [
  ...(config.resolver.nodeModulesPaths || []),
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(repoRoot,    'node_modules'),
]

module.exports = config
