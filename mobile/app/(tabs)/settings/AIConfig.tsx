import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AIConfig() {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const key = await AsyncStorage.getItem("gemini_api_key");
        setApiKey(key || "");
      } catch (e) {
        setError("Failed to load key");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveKey = async () => {
    setSaving(true);
    setError("");
    try {
      await AsyncStorage.setItem("ai_setup_completed", "true");
      await AsyncStorage.setItem("gemini_api_key", apiKey);
      Alert.alert("Saved", "Gemini API Key saved.");
    } catch (e) {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const resetKey = async () => {
    setSaving(true);
    setError("");
    try {
      await AsyncStorage.removeItem("gemini_api_key");
      await AsyncStorage.setItem("ai_setup_completed", "false");
      setApiKey("");
      Alert.alert("Reset", "Gemini API Key and AI setup have been reset.");
    } catch (e) {
      setError("Failed to reset. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Gemini AI Configuration</Text>
      <Text style={styles.instructions}>Paste your Gemini API Key below. You can get one at:</Text>
      <Text style={styles.link} onPress={() => {
        // @ts-ignore
        if (window && window.open) window.open('https://aistudio.google.com/app/apikey', '_blank');
      }}>
        https://aistudio.google.com/app/apikey
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Gemini API Key"
        value={apiKey}
        onChangeText={setApiKey}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!saving && !loading}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title={saving ? "Saving..." : "Save"} onPress={saveKey} disabled={saving || loading || !apiKey} />
      <View style={{ height: 20 }} />
      <Button title="Reset Gemini Key & AI Setup" onPress={resetKey} color="#d9534f" disabled={saving || loading} />
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
