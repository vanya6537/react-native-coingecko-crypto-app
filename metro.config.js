const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
  projectRoot: __dirname,
  watchFolders: [__dirname],
  maxWorkers: 2,
  resolver: {
    sourceExts: ['ts', 'tsx', 'js', 'jsx', 'json'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
