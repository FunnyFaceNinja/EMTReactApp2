import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, SafeAreaView, ScrollView, Platform } from 'react-native';
import Svg from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import SkeletonReactComponent from '../assets/images/SkeletonReactComponent';

const { width, height } = Dimensions.get('window');

const InteractiveDiagram = () => {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Handle when a bone is clicked
  const handlePartClick = (part: string) => {
    console.log("Part clicked:", part);
    
    // Only process if it's the femur (our only interactive bone)
    if (part.toLowerCase() === 'femur') {
      setSelectedPart(part);
      
      // Start pulse animation on the femur
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      // Animate the info card
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedPart(null);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  // For Android, provide an additional clickable area
  const FemurClickableArea = () => {
    if (Platform.OS !== 'android') return null;
    
    return (
      <TouchableOpacity
        onPress={() => handlePartClick('femur')}
        style={{
          position: 'absolute',
          left: '30%',
          top: '55%',
          width: '25%',
          height: '25%',
          backgroundColor: 'transparent',
          zIndex: 999,
        }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Human Skeleton</Text>
        <Text style={styles.headerSubtitle}>Interactive Anatomy Guide</Text>
      </View>

      {/* Main content area */}
      <View style={styles.diagramContainer}>
        {/* SVG Skeleton */}
        <View style={styles.svgContainer}>
          <Svg width={width} height={height * 0.8} viewBox={`0 0 ${width} ${height * 0.8}`}>
            <SkeletonReactComponent
              width="100%"
              height="100%"
              highlightedPart={selectedPart}
              onPartClick={handlePartClick}
            />
          </Svg>
          
          {/* Additional clickable area for Android */}
          <FemurClickableArea />
        </View>

        {/* Tip for user */}
        {!selectedPart && (
          <View style={styles.instructionContainer}>
            <Ionicons name="finger-print" size={24} color="#666" />
            <Text style={styles.instructionText}>Tap on the femur bone</Text>
          </View>
        )}

        {/* Information card for selected bone */}
        {selectedPart && selectedPart.toLowerCase() === 'femur' && (
          <Animated.View 
            style={[
              styles.infoCard,
              { opacity: fadeAnim }
            ]}
          >
            <View style={styles.infoCardHeader}>
              <Text style={styles.partTitle}>Femur</Text>
              <TouchableOpacity onPress={clearSelection} style={styles.closeButton}>
                <Ionicons name="close-circle" size={24} color="#F26969" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.infoContent}>
              <View style={styles.infoSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="information-circle" size={22} color="#F26969" style={styles.sectionIcon} />
                  <Text style={styles.sectionTitle}>Description</Text>
                </View>
                <Text style={styles.partDescription}>
                  The femur is the longest and strongest bone in the human body, connecting the hip to the knee. It supports the weight of the body and allows for movement of the leg.
                </Text>
              </View>
              
              <View style={styles.infoSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="medkit" size={22} color="#F26969" style={styles.sectionIcon} />
                  <Text style={styles.sectionTitle}>Common Injuries</Text>
                </View>
                <Text style={styles.partDescription}>
                  • Femoral shaft fractures from high-energy trauma{'\n'}
                  • Femoral neck fractures (common in elderly patients){'\n'}
                  • Stress fractures in athletes and military recruits
                </Text>
              </View>
              
              <View style={styles.infoSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="fitness" size={22} color="#F26969" style={styles.sectionIcon} />
                  <Text style={styles.sectionTitle}>Treatment Considerations</Text>
                </View>
                <Text style={styles.partDescription}>
                  Femur fractures are often emergency situations requiring immediate stabilization and advanced pain management. Traction splints may be indicated for shaft fractures. Assess for associated blood loss (500-1500 mL).
                </Text>
              </View>
            </ScrollView>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F7D9',
    width: '100%',
    height: '100%',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  diagramContainer: {
    flex: 1,
    position: 'relative',
  },
  svgContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionContainer: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  instructionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  infoCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    maxHeight: 400,
  },
  infoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 4,
  },
  partTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F26969',
  },
  infoContent: {
    maxHeight: 300,
  },
  infoSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },
  partDescription: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
});

export default InteractiveDiagram;