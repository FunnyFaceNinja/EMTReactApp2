import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CPGScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CPG Guidelines</Text>
      <Text style={styles.subtitle}>Clinical Practice Guidelines content will appear here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F2F7D9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});