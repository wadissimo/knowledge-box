import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Button,
  ActivityIndicator,
  Text,
  ScrollView,
  Alert,
  Dimensions,
  KeyboardAvoidingView, // Good for handling keyboard pushing content
  Platform, // To differentiate between iOS and Android for KeyboardAvoidingView
} from 'react-native';
import { SvgXml } from 'react-native-svg'; // Import SvgXml for rendering SVG strings

// !!! IMPORTANT: REPLACE THIS WITH YOUR COMPUTER'S LOCAL IP ADDRESS !!!
//
// To find your IP:
// - Windows: Open Command Prompt, type `ipconfig`, look for IPv4 Address.
// - macOS/Linux: Open Terminal, type `ifconfig` or `ip a`, look for inet address.
//
// Example: 'http://192.168.1.100:3000/convert'
const API_URL = 'http://10.0.2.2:3000/convert';

// Get screen width for dynamic SVG container sizing
const { width: screenWidth } = Dimensions.get('window');

export default function LatexConverterScreen() {
  const [latexInput, setLatexInput] = useState<string>('\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}');
  const [svgString, setSvgString] = useState<string | null>(null); // Stores the raw SVG XML string
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const convertLatexToSvg = async () => {
    // Basic input validation
    if (!latexInput.trim()) {
      Alert.alert('Input Error', 'Please enter a LaTeX formula.');
      return;
    }

    setLoading(true);
    setError(null);
    setSvgString(null); // Clear previous SVG result

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latex: latexInput }),
      });

      if (!response.ok) {
        // Attempt to parse error message from API response
        let errorMessage = `HTTP error! Status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.details && Array.isArray(errorData.details)) {
            errorMessage = errorData.details.join('\n'); // Join MathJax errors
          }
        } catch (jsonError) {
          // If response is not JSON, use default error message
          console.warn('API error response was not JSON:', await response.text());
        }
        throw new Error(errorMessage);
      }

      const receivedSvgText = await response.text();
      setSvgString(receivedSvgText);
    } catch (err: any) {
      console.error('Conversion error:', err);
      setError(`Failed to convert: ${err.message}`);
      Alert.alert('Conversion Error', `Failed to convert LaTeX: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>LaTeX to SVG Converter</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter LaTeX formula here (e.g., \\sum_{i=1}^{n} i^2)"
          placeholderTextColor="#999"
          value={latexInput}
          onChangeText={setLatexInput}
          multiline
          numberOfLines={4}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Button
          title={loading ? 'Converting...' : 'Convert to SVG'}
          onPress={convertLatexToSvg}
          disabled={loading} // Disable button while loading
          color="#007bff" // Standard blue color for buttons
        />

        {loading && <ActivityIndicator size="large" color="#007bff" style={styles.spinner} />}

        {error && <Text style={styles.errorText}>{error}</Text>}

        {svgString && (
          <View style={styles.svgWrapper}>
            <Text style={styles.subtitle}>Resulting SVG:</Text>
            {/* SvgXml will scale the SVG content (using its viewBox) 
                            to fit the dimensions of this parent View (svgWrapper).
                            Setting width/height to "100%" makes it fill the parent.
                        */}
            <SvgXml xml={svgString} width="100%" height="100%" />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1, // Ensures it takes full height
  },
  container: {
    flexGrow: 1, // Allows content to grow and be scrollable
    padding: 20,
    backgroundColor: '#f8f8f8', // Light gray background
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'android' ? 40 : 60, // Adjust top padding for status bar
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 120, // Sufficient height for multi-line input
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    textAlignVertical: 'top', // For Android multi-line text input
    backgroundColor: '#fff',
    shadowColor: '#000', // Basic shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3, // Basic shadow for Android
  },
  spinner: {
    marginVertical: 20,
  },
  errorText: {
    color: '#dc3545', // Bootstrap danger red
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginTop: 15,
    marginBottom: 10,
  },
  svgWrapper: {
    width: screenWidth * 0.9, // Occupy 90% of screen width for responsiveness
    minHeight: 100, // Minimum height to always show a box
    maxHeight: 200, // Max height to prevent very large formulas from dominating the screen
    // backgroundColor: '#ffffff', // Explicit white background for the SVG area
    alignItems: 'flex-start', // Center SVG horizontally within this wrapper
    justifyContent: 'flex-start', // Center SVG vertically within this wrapper
    marginTop: 15,
    marginBottom: 20, // Space below the SVG
    borderWidth: 1,
    borderColor: '#e0e0e0', // Lighter border
    borderRadius: 10,
    overflow: 'hidden', // Crucial to clip any SVG content that goes beyond bounds
    padding: 10, // Padding inside the wrapper, around the SVG
    shadowColor: '#000', // Basic shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3, // Basic shadow for Android
  },
});
