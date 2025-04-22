import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, SafeAreaView, ScrollView, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import SkeletonReactComponent from '../assets/images/SkeletonReactComponent';

const { width, height } = Dimensions.get('window');

// Optimized femur path for cross-platform rendering
const OPTIMIZED_FEMUR_PATH = "M9.7849 185.622C7.64341 187.905 6.91683 190.973 8.91492 194.369C12.8633 201.078 21.3432 202.015 25.999 195.926C26.9401 194.54 28.1057 193.408 29.4221 192.602C30.7386 191.796 32.1772 191.333 33.6472 191.242C37.0411 191.16 39.2591 189.872 39.7562 185.388C40.2534 180.903 40.3776 176.769 36.3432 174.849C32.3088 172.929 31.0947 169.17 30.674 164.416C26.797 120.621 24.723 76.6155 24.4599 32.5655C24.4599 27.4719 24.8518 22.425 27.9016 18.3852C30.5497 14.8724 32.3853 11.1018 29.5746 6.49996C26.7639 1.89809 22.978 1.81613 19.1157 3.94728C16.3145 5.52807 14.1348 5.53977 12.1367 2.31963C11.6029 1.49499 10.9047 0.852738 10.1092 0.454837C9.31383 0.0569354 8.4481 -0.0831895 7.5956 0.0479597C0.826961 -0.197942 -1.62044 4.14637 1.07555 12.0269C3.42737 18.877 6.46752 25.4461 7.37574 32.8817C12.6912 76.4883 16.5536 120.247 15.9799 164.439C15.8748 172.437 15.1673 179.919 9.7849 185.622Z";

const InteractiveDiagram = () => {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [svgDimensions, setSvgDimensions] = useState({ width: width, height: height * 0.8 });

  useEffect(() => {
    setSvgDimensions({ width: width, height: height * 0.8 });
  }, []);

  const handlePartClick = (part: string) => {
    console.log("Part clicked:", part);
    
    if (part.toLowerCase() === 'femur') {
      setSelectedPart(part);
      
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

  const clearSelection = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSelectedPart(null);
    });
  };

  // Helps with touch detection which can be inconsistent with SVG on Android
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Human Skeleton</Text>
        <Text style={styles.headerSubtitle}>Interactive Anatomy Guide</Text>
      </View>

      <View style={styles.diagramContainer}>
        <View style={[styles.svgContainer, { width: svgDimensions.width, height: svgDimensions.height }]}>
          <SkeletonReactComponent
            width={svgDimensions.width}
            height={svgDimensions.height}
            style={{ width: '100%', height: '100%' }}
            highlightedPart={selectedPart}
            onPartClick={handlePartClick}
          />
          
          <FemurClickableArea />
        </View>

        {!selectedPart && (
          <View style={styles.instructionContainer}>
            <Ionicons name="finger-print" size={24} color="#666" />
            <Text style={styles.instructionText}>Tap on the femur bone</Text>
          </View>
        )}

        {selectedPart && selectedPart.toLowerCase() === 'femur' && (
          <Animated.View 
            style={[
              styles.isolatedBoneContainer,
              { opacity: fadeAnim }
            ]}
          >
            <Svg 
              width={120} 
              height={240} 
              viewBox="-2 -1 45 220"
              style={{backgroundColor: 'transparent'}}
            >
              <Path 
                d={OPTIMIZED_FEMUR_PATH}
                fill="#F26969"
                stroke="#333"
                strokeWidth="0.5"
              />
            </Svg>
          </Animated.View>
        )}

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
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
  isolatedBoneContainer: {
    position: 'absolute',
    bottom: 340,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 1000,
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