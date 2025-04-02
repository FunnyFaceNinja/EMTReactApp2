import React from 'react';
import { View, StyleSheet } from 'react-native';
import InteractiveDiagram from '../../components/InteractiveDiagram';

export default function Diagram() {
  return (
    <View style={styles.container}>
      <InteractiveDiagram />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F7D9',
    width: '100%',
    height: '100%',
  },
});