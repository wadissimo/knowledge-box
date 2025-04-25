import AsyncStorage from '@react-native-async-storage/async-storage';

export async function isAISetupCompleted(): Promise<boolean> {
  const value = await AsyncStorage.getItem("ai_setup_completed");
  return value === "true";
}

export async function getGeminiApiKey(): Promise<string | null> {
  return await AsyncStorage.getItem("gemini_api_key");
}
