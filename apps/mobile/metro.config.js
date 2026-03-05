const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Only watch the shared package, not the entire monorepo (big perf boost)
config.watchFolders = [
  ...(config.watchFolders || []),
  path.resolve(monorepoRoot, 'packages/shared'),
];

// Ensure Metro resolves packages from the monorepo root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Block unnecessary directories from being watched
config.resolver.blockList = [
  /apps\/web\/.*/,
  /packages\/database\/.*/,
];

module.exports = withNativeWind(config, { input: './global.css' });
