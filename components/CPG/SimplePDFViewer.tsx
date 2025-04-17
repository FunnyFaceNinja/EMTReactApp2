import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Platform, Linking, TouchableOpacity } from 'react-native';

// Import WebView conditionally to avoid web bundling issues
let WebView: any = null;
if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').default;
}

interface SimplePDFViewerProps {
  uri: string;
  title?: string;
}

const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ uri, title }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create Google PDF Viewer URL for mobile
  const viewerUrl = Platform.OS === 'web' 
    ? uri 
    : `https://docs.google.com/viewer?url=${encodeURIComponent(uri)}&embedded=true`;

  // Loading indicator and error display
  const renderLoadingAndError = () => (
    <>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F26969" />
          <Text style={styles.loadingText}>Loading PDF...</Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          {Platform.OS !== 'web' && (
            <TouchableOpacity 
              onPress={() => Linking.openURL(uri)}
              style={styles.openButton}
            >
              <Text style={styles.openButtonText}>Open Externally</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </>
  );

  // Web implementation using iframe
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        {title && <Text style={styles.title}>{title}</Text>}
        {renderLoadingAndError()}
        
        <iframe 
          src={viewerUrl}
          style={{ width: '100%', height: '90%', border: 'none', backgroundColor: '#f8f8f8' }}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setError('Failed to load PDF');
            setIsLoading(false);
          }}
        />
      </View>
    );
  }
  
  // Native implementation using WebView
  if (WebView) {
    return (
      <View style={styles.container}>
        {title && <Text style={styles.title}>{title}</Text>}
        {renderLoadingAndError()}
        
        <WebView
          source={{ uri: viewerUrl }}
          style={styles.webview}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setError('Failed to load PDF');
            setIsLoading(false);
          }}
        />
      </View>
    );
  }
  
  // Fallback if WebView is not available
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>
          Cannot display PDF. Please install react-native-webview.
        </Text>
        <TouchableOpacity 
          onPress={() => Linking.openURL(uri)}
          style={styles.openButton}
        >
          <Text style={styles.openButtonText}>Open PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  loadingText: {
    marginTop: 10,
    color: '#444',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  urlText: {
    fontSize: 14,
    color: 'blue',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  webview: {
    flex: 1,
  },
  openButton: {
    backgroundColor: '#F26969',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  openButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SimplePDFViewer;
