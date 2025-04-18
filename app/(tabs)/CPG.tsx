import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useCPG } from '@/context/CPGContext';
import SimplePDFViewer from '@/components/CPG/SimplePDFViewer';

interface HeaderProps {
  title: string;      
  onBack: () => void; 
  backText: string;   
}

const Header: React.FC<HeaderProps> = ({ title, onBack, backText }) => (
  <View style={styles.header}>
    {/* Back button with touch handler */}
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      {/* Text for the back button */}
      <Text style={styles.backButtonText}>{backText}</Text>
    </TouchableOpacity>
    {/* Title of the current view */}
    <Text style={styles.headerTitle}>{title}</Text>
  </View>
);

export default function CPGScreen() {
  const { 
    selectedSection, selectedCPG, setSelectedSection, setSelectedCPG,
    getSections, getCPGsForSection, getSectionName, getFileURL
  } = useCPG();
  
  if (selectedSection && selectedCPG) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header with section and CPG title */}
        <Header 
          title={`${getSectionName(selectedSection)} - CPG ${selectedCPG}`}
          onBack={() => setSelectedCPG(null)} 
          backText="← Back" 
        />
        {/* PDF viewer component */}
        <SimplePDFViewer uri={getFileURL(selectedSection, selectedCPG)} />
      </SafeAreaView>
    );
  }
  
  if (selectedSection) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header with section name */}
        <Header 
          title={getSectionName(selectedSection)}
          onBack={() => setSelectedSection(null)} 
          backText="← Back" 
        />
        {/* List of CPGs in the selected section */}
        <FlatList
          data={getCPGsForSection(selectedSection)}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => setSelectedCPG(item)}>
              <Text style={styles.itemText}>CPG {item}</Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Title for the main screen */}
      <Text style={styles.title}>Clinical Practice Guidelines</Text>
      {/* List of available CPG sections */}
      <FlatList
        data={getSections()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => setSelectedSection(item.id)}>
            <Text style={styles.itemText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Your existing styles
  container: { flex: 1, backgroundColor: '#F2F7D9' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f8f8f8', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', flex: 1, marginLeft: 8 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', margin: 20 },
  item: { backgroundColor: 'white', padding: 16, margin: 8, borderRadius: 5, elevation: 2 },
  itemText: { fontSize: 16 },
  backButton: { paddingVertical: 8, paddingHorizontal: 12 },
  backButtonText: { color: '#F26969', fontWeight: 'bold' }
});