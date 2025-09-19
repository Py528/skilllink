module.exports = {
  dependencies: {
    'react-native-vision-camera': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-vision-camera/android',
          packageImportPath: 'import io.invertase.react.RNFirebasePackage;',
        },
      },
    },
  },
};