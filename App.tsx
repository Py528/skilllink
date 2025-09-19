/**
 * App - Main entry point for MoveNet Squat Counter
 * React Native app with pose detection and squat counting
 */

import React from 'react';
import { StatusBar, SafeAreaView, StyleSheet } from 'react-native';
import { SquatCounter } from './src/screens/SquatCounter';

const App: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#000000" 
        translucent={false}
      />
      <SquatCounter />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

export default App;