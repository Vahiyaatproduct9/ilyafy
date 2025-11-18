const { getDefaultConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

// --- SVG config ---
defaultConfig.transformer.babelTransformerPath = require.resolve(
  'react-native-svg-transformer',
);

defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts.filter(
  ext => ext !== 'svg',
);

defaultConfig.resolver.sourceExts = [
  ...defaultConfig.resolver.sourceExts,
  'svg',
];

// --- Path aliases ---
defaultConfig.resolver.extraNodeModules = {
  '@assets': path.resolve(__dirname, 'assets'),
  '@app': path.resolve(__dirname, 'app'),
  '@functions': path.resolve(__dirname, 'functions'),
  '@types': path.resolve(__dirname, 'types'),
};

module.exports = withNativeWind(
  {
    ...defaultConfig,
  },
  {
    input: './global.css',
  },
);

// const { getDefaultConfig } = require('@react-native/metro-config');
// const { withNativeWind } = require('nativewind/metro');
// const path = require('path');

// const defaultConfig = getDefaultConfig(__dirname);

// module.exports = withNativeWind(
//   {
//     ...defaultConfig,
//     resolver: {
//       ...defaultConfig.resolver,
//       extraNodeModules: {
//         '@assets': './assets',
//         '@app': './app',
//         '@functions': './functions',
//         '@types': './types',
//       },
//     },
//   },
//   {
//     input: './global.css',
//   },
// );
