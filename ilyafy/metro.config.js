const { getDefaultConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');
const defaultConfig = getDefaultConfig(__dirname);

module.exports = withNativeWind(defaultConfig, {
  input: './global.css',
});
