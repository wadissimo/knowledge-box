import React, { useState } from "react";
import { View, Text, TextInput, Linking, Button, StyleSheet } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AISetup({ onSetupComplete }: { onSetupComplete?: () => void }) {
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const saveKey = async () => {
    setSaving(true);
    setError("");
    try {
      await AsyncStorage.setItem("ai_setup_completed", "true");
      await AsyncStorage.setItem("gemini_api_key", apiKey);
      console.log('[AISetup] Saved ai_setup_completed:true and gemini_api_key:', apiKey);
      if (onSetupComplete) onSetupComplete();
    } catch (e) {
      console.error('[AISetup] Failed to save AI setup:', e);
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Set up Gemini AI</Text>
      <Text style={styles.instructions}>
        To use AI card generation, you need a Gemini API Key. Paste your key below. You can get one at:
      </Text>
      <Text style={styles.link} onPress={() => Linking.openURL('https://aistudio.google.com/app/apikey')}>
        https://aistudio.google.com/app/apikey
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Gemini API Key"
        value={apiKey}
        onChangeText={setApiKey}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title={saving ? "Saving..." : "Save"} onPress={saveKey} disabled={saving || !apiKey} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  instructions: { fontSize: 16, marginBottom: 8, textAlign: 'center' },
  link: { color: '#007AFF', marginBottom: 16, textDecorationLine: 'underline' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, width: '100%', marginBottom: 16 },
  error: { color: 'red', marginBottom: 8 },
});
