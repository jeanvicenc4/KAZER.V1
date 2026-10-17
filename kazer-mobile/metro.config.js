const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// The shared kazer-core package lives outside the mobile project root.
config.watchFolders = [
  ...(config.watchFolders ?? []),
  require('path').resolve(__dirname, '..', 'kazer-core'),
];

config.resolver.sourceExts = [
  ...(config.resolver.sourceExts ?? []),
  '.ts',
  '.tsx',
  '.mjs',
];

module.exports = withNativeWind(config, { input: './global.css' });
