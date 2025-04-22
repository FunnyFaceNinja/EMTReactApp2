import React, { useState } from 'react';
import { View, ActivityIndicator, Text, Platform, Linking, TouchableOpacity, StyleSheet } from 'react-native';

// Conditionally import WebView only on mobile platforms to avoid bundling it for web
let WebView: any = null;
if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').default;
}

interface PDFViewerProps {
  uri: string;
  title?: string;
}

const SimplePDFViewer: React.FC<PDFViewerProps> = ({ uri, title }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Use Google Docs Viewer on mobile, direct link on web
  const viewerUrl = Platform.OS === 'web' 
    ? uri 
    : `https://docs.google.com/viewer?url=${encodeURIComponent(uri)}&embedded=true`;

  // Web browser environment - use iframe
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        {title && <Text style={styles.title}>{title}</Text>}
        {isLoading && <ActivityIndicator color="#F26969" />}
        <iframe 
          src={viewerUrl} 
          style={{width:'100%',height:'90%'}} 
          onLoad={() => setIsLoading(false)} 
        />
      </View>
    );
  } 
  // Mobile environment with WebView capability
  else if (WebView) {
    return (
      <View style={styles.container}>
        {title && <Text style={styles.title}>{title}</Text>}
        {isLoading && <ActivityIndicator color="#F26969" />}
        <WebView 
          source={{uri: viewerUrl}} 
          style={{flex:1}} 
          onLoad={() => setIsLoading(false)} 
        />
      </View>
    );
  } 
  // Fallback for environments without PDF viewing capability
  else {
    return (
      <View style={styles.container}>
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={styles.center}>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', padding: 10, backgroundColor: '#f8f8f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  button: { backgroundColor: '#F26969', padding: 10, borderRadius: 5 },
  buttonText: { color: 'white', fontWeight: 'bold' }
});

export default SimplePDFViewer;
