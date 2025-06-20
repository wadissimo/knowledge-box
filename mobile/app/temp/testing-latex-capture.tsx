import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Button,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MathJaxSvg } from 'react-native-mathjax-html-to-svg';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';

const FormulaPreviewAndSave: React.FC = () => {
  const formulaViewRef = useRef<ViewShot>(null);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [inputFormula, setInputFormula] = useState<string>(
    'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}'
  );
  const [renderedFormula, setRenderedFormula] = useState<string>(inputFormula);
  const [formulaReady, setFormulaReady] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setFormulaReady(true), 500);
    return () => clearTimeout(timer);
  }, [renderedFormula]);

  const captureAndSaveFormula = async (): Promise<void> => {
    if (!formulaViewRef.current) {
      Alert.alert('Error', 'Formula view reference is not available.');
      return;
    }

    if (!formulaReady) {
      Alert.alert('Please Wait', 'Formula is still rendering. Please try again in a moment.');
      return;
    }

    setIsCapturing(true);
    setCapturedImageUri(null);

    try {
      const tempUri = await captureRef(formulaViewRef, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });

      const fileName = `formula_${Date.now()}.png`;
      const permanentUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.moveAsync({ from: tempUri, to: permanentUri });

      setCapturedImageUri(permanentUri);
      // Alert.alert('Success', `Image saved to: ${permanentUri}`);
    } catch (error: any) {
      console.error('Oops, capture failed', error);
      Alert.alert('Error', `Failed to capture or save image: ${error.message}`);
    } finally {
      setIsCapturing(false);
    }
  };

  const onPreviewFormula = () => {
    setFormulaReady(false);
    setRenderedFormula(inputFormula);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter LaTeX formula"
        value={inputFormula}
        onChangeText={setInputFormula}
        multiline
      />
      <Button title="Preview Formula" onPress={onPreviewFormula} />

      <ViewShot
        ref={formulaViewRef}
        options={{ format: 'png', quality: 1.0 }}
        style={styles.formulaContainer}
      >
        <MathJaxSvg fontSize={24} color="black" fontCache={true}>
          {`$$${renderedFormula}$$`}
        </MathJaxSvg>
      </ViewShot>

      <Button
        title={isCapturing ? 'Capturing...' : 'Capture and Save Formula as Image'}
        onPress={captureAndSaveFormula}
        disabled={isCapturing || !formulaReady}
      />

      {isCapturing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Capturing image...</Text>
        </View>
      )}

      {capturedImageUri && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewText}>Captured Image Preview:</Text>
          <Image
            source={{ uri: capturedImageUri }}
            style={styles.capturedImage}
            onError={e => console.log('Image load error:', e.nativeEvent.error)}
            onLoad={() => console.log('Image loaded successfully for preview')}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    minHeight: 60,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  formulaContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginVertical: 20,

    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  previewContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  previewText: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  capturedImage: {
    width: 250,
    height: 200,
    resizeMode: 'contain',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
});

export default FormulaPreviewAndSave;
