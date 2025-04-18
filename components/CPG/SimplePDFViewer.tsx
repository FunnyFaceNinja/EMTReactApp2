// Import necessary React hooks and components from React Native
import React, { useState } from 'react';
import { View, ActivityIndicator, Text, Platform, Linking, TouchableOpacity, StyleSheet } from 'react-native';

// Conditionally import WebView only on mobile platforms to avoid bundling it for web
let WebView: any = null;
if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').default;
}

// Define the TypeScript interface for component props
interface PDFViewerProps {
  uri: string;        // Required: URL/path to the PDF file
  title?: string;     // Optional: Title to display above the PDF
}

// Define the main component with TypeScript typing
const SimplePDFViewer: React.FC<PDFViewerProps> = ({ uri, title }) => {
  // State to track if PDF is still loading
  const [isLoading, setIsLoading] = useState(true);
  
  // Create appropriate viewer URL based on platform:
  // - Web: use PDF URI directly
  // - Mobile: use Google Docs Viewer to render the PDF
  const viewerUrl = Platform.OS === 'web' 
    ? uri 
    : `https://docs.google.com/viewer?url=${encodeURIComponent(uri)}&embedded=true`;

  // PLATFORM SPECIFIC RENDERING: 
  // Check platform type first, then capabilities
  
  // Case 1: Web browser environment - use iframe
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        {/* Show title if provided */}
        {title && <Text style={styles.title}>{title}</Text>}
        {/* Show loading spinner while PDF loads */}
        {isLoading && <ActivityIndicator color="#F26969" />}
        {/* Render PDF in iframe, hide spinner when loaded */}
        <iframe 
          src={viewerUrl} 
          style={{width:'100%',height:'90%'}} 
          onLoad={() => setIsLoading(false)} 
        />
      </View>
    );
  } 
  // Case 2: Mobile environment with WebView capability
  else if (WebView) {
    return (
      <View style={styles.container}>
        {/* Show title if provided */}
        {title && <Text style={styles.title}>{title}</Text>}
        {/* Show loading spinner while PDF loads */}
        {isLoading && <ActivityIndicator color="#F26969" />}
        {/* Render PDF in WebView, hide spinner when loaded */}
        <WebView 
          source={{uri: viewerUrl}} 
          style={{flex:1}} 
          onLoad={() => setIsLoading(false)} 
        />
      </View>
    );
  } 
  // Case 3: Fallback for environments without PDF viewing capability
  else {
    return (
      <View style={styles.container}>
        {/* Show title if provided */}
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={styles.center}>
          {/* Provide button to open PDF in external viewer */}
          <TouchableOpacity 
            onPress={() => Linking.openURL(uri)} 
            style={styles.button}
          >
            <Text style={styles.buttonText}>Open PDF</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
};

// Define styles for the component
const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', padding: 10, backgroundColor: '#f8f8f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  button: { backgroundColor: '#F26969', padding: 10, borderRadius: 5 },
  buttonText: { color: 'white', fontWeight: 'bold' }
});

export default SimplePDFViewer;
