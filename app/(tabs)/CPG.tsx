import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useCPG } from '@/context/CPGContext';
import SimplePDFViewer from '@/components/CPG/SimplePDFViewer';

export default function CPGScreen() {
  const { 
    selectedSection, selectedCPG, setSelectedSection, setSelectedCPG,
    getSections, getCPGsForSection, getSectionName, getFileURL
  } = useCPG();
  
  // Back button component
  const BackButton = ({ onPress, text }: { onPress: () => void, text: string }) => (
    <TouchableOpacity onPress={onPress} style={styles.backButton}>
      <Text style={styles.backButtonText}>{text}</Text>
    </TouchableOpacity>
  );
  
  // Header with back button
  const Header = ({ title, onBack, backText }: { title: string, onBack: () => void, backText: string }) => (
    <View style={styles.header}>
      <BackButton onPress={onBack} text={backText} />
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
  
  // If a specific CPG is selected, show the PDF viewer
  if (selectedSection && selectedCPG) {
    const pdfUrl = getFileURL(selectedSection, selectedCPG);
    const title = `${getSectionName(selectedSection)} - CPG ${selectedCPG}`;
    
    return (
      <SafeAreaView style={styles.container}>
        <Header 
          title={title} 
          onBack={() => setSelectedCPG(null)} 
          backText="← Back to CPGs" 
        />
        <SimplePDFViewer uri={pdfUrl} title={title} />
      </SafeAreaView>
    );
  }
  
  // If a section is selected, show the list of CPGs in that section
  if (selectedSection) {
    const cpgs = getCPGsForSection(selectedSection);
    const sectionName = getSectionName(selectedSection);
    
    return (
      <SafeAreaView style={styles.container}>
        <Header 
          title={sectionName} 
          onBack={() => setSelectedSection(null)} 
          backText="← Back to Sections" 
        />
        <FlatList
          data={cpgs}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.item}
              onPress={() => setSelectedCPG(item)}
            >
              <Text style={styles.itemText}>CPG {item}</Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }
  
  // Main view - show the list of sections
  const sections = getSections();
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Clinical Practice Guidelines</Text>
      <Text style={styles.subtitle}>Select a section to view CPGs</Text>
      
      <FlatList
        data={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.item}
            onPress={() => setSelectedSection(item.id)}
          >
            <Text style={styles.itemText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F7D9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  item: {
    backgroundColor: 'white',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  itemText: {
    fontSize: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: '#F26969',
    fontWeight: 'bold',
  },
});