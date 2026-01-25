const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix for "@react-native-google-signin/google-signin" and other ESM libraries
config.resolver.sourceExts.push('mjs');
config.resolver.sourceExts.push('cjs');

// Enable package exports for better module resolution in modern libraries
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
