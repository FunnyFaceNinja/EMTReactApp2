import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Svg from 'react-native-svg';
import SkeletonReactComponent from '../assets/images/SkeletonReactComponent'; // Import your React Native component

const { width, height } = Dimensions.get('window');

const InteractiveDiagram = () => {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);

  const handlePartClick = (part: string) => {
    setSelectedPart(part);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={{ width: '100%', height: '100%' }}>
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <SkeletonReactComponent
            width="100%"
            height="100%"
            highlightedPart={selectedPart}
            onPartClick={handlePartClick}
          />
        </Svg>
      </TouchableOpacity>
      {selectedPart && <Text style={styles.label}>{selectedPart}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F7D9',
    width: '100%',
    height: '100%',
  },
  label: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    fontSize: 24,
    color: 'black',
    textAlign: 'center',
  },
});

export default InteractiveDiagram;