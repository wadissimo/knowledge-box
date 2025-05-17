import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export enum AIServiceRole {
  AI = 2,
  User = 1,
}
export type AIServiceMessage = {
  role: AIServiceRole;
  message: string;
};
export type AIServiceChatResponseCard = {
  front: string;
  back: string;
};

export type AIServiceChatResponse = {
  message?: string;
  cards?: AIServiceChatResponseCard[];
  original_response_parts?: any;
};

const JSON_START = '```json';
const JSON_END = '```';

const extractJsonAndRemoveFromMessage = (
  message: string
): { json: any | null; updatedMessage: string } => {
  const jsonRegex = /```json([\s\S]*?)```/;
  const match = message.match(jsonRegex);

  if (!match) {
    return { json: null, updatedMessage: message };
  }

  const jsonString = match[1].trim();

  try {
    const parsedJson = JSON.parse(jsonString);
    // Remove the matched JSON block from the message
    const updatedMessage = message.replace(match[0], '').trim();
    return { json: parsedJson, updatedMessage };
  } catch (error) {
    console.error('Invalid JSON format:', error);
    return { json: null, updatedMessage: message };
  }
};

// System prompt for flashcard generation
const get_flashcard_system_prompt = (
  language: string,
  boxTitle: string,
  boxDescription: string
): string => {
  return `You are an assistant in an app where users have their knowledge organized in boxes. Each box represents a topic and has collections of flashcards and notes.

When the user requests flashcards for a collection, you must generate them immediately. If the request is ambiguous (for example: missing topic, missing number of cards, or missing difficulty/level), return a JSON block with type: "ambiguous" and content set to one of the following predefined options (choose the one that fits the ambiguity):
- "missing_topic"
- "missing_num_cards"
- "missing_level"

If you return type: "ambiguous", do not generate any cards. If the request is not ambiguous, always return a JSON block in this format:
${JSON_START}
{
  "type": "new_cards",
  "content": {
    "card 1 face": "card 1 back",
    "card 2 face": "card 2 back",
    "card 3 face": "card 3 back"
  }
}
${JSON_END}
The "content" section can contain as many cards as needed. The "type" must be "new_cards" for the app to recognize new cards. All other types will be rejected.

User's language is ${language}. Reply in user's language.`;
};

const get_chat_system_prompt = (
  language: string,
  boxTitle: string,
  boxDescription: string
): string => {
  return `You are an assistant in an app where users have their knowledge organized in boxes.
  Each box should represent a particular topic and have collections of flashcards and notes that users use to learn the topic.
  Currently selected knowledge box:
  Title: "${boxTitle}"
  Description: "${boxDescription}"

  Users can use a chat with an assistant to help with learning information related to the above knowledge box.
  They can ask a question and an assistant should provide a concise answer. If a question is not related to the topic and assistant should politely decline and ask a user to stay on the topic.

  An assistant can help users to generate flash cards. When the user asks for flashcards, you must generate them immediately, without asking any clarifying questions. If any required information is missing or ambiguous, make reasonable assumptions and proceed to generate the cards. Do not ask the user for more information. Always generate and return the cards in the specified JSON format below.

  Your response MUST always include a JSON block in the following format:
  ${JSON_START}
  {
    "type":"new_cards",
    "content":{
      "card 1 face": "card 1 back",
      "card 2 face": "card 2 back",
      "card 3 face": "card 3 back"
    }
  }
  ${JSON_END}
  The "content" section can contain as many cards as needed. The "type" must be "new_cards" for the app to recognize new cards. All other types will be rejected.

  If the user prompt is ambiguous or does not specify a number of cards, generate a default set of 5 cards relevant to the topic. The JSON block must always be present in your reply, and your reply must always include at least one flashcard.

  User's language is ${language}. Reply in user's language.`;
};

const get_system_prompt = (language: string, boxTitle: string, boxDescription: string): string => {
  return `You are an assistant in an app where users have their knowledge organized in boxes.
  User's language is ${language}. Reply in user's language.`;
};

export function useAIChatService(language: string, boxTitle: string, boxDescription: string) {
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  async function chat(message: string): Promise<AIServiceChatResponse | null> {
    try {
      setError('');

      const key = await getGeminiApiKey();
      if (!key) {
        throw new Error('Gemini API Key not found. Please set it up in AI Settings.');
      }
      const URL =
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' +
        key;

      const response = await fetch(URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: {
            parts: {
              text: get_chat_system_prompt(language, boxTitle, boxDescription),
            },
          },
          contents: [
            ...history,
            {
              role: 'user',
              parts: [
                {
                  text: message,
                },
              ],
            },
          ],
        }),
      });
      const data: any = await response.json();

      //console.log("ai response", data);
      //console.log("content", data.candidates[0].content);
      const content = data.candidates[0].content;
      const responseText = content.parts[0].text;
      console.log('responseText', responseText);

      // Check if response contains JSON
      const { json: jsonResponse, updatedMessage } = extractJsonAndRemoveFromMessage(responseText);
      const aiResponse: AIServiceChatResponse = {
        message: responseText,
      };
      if (jsonResponse !== null) {
        console.log('found JSON');
        if (jsonResponse?.type === 'new_cards' && jsonResponse?.content) {
          const content = jsonResponse.content;

          // Extract cards as an array of objects with face and back
          aiResponse.cards = Object.entries(content).map(([front, back]) => ({
            front: front.trim(),
            back: (back as string).trim(),
          }));
          aiResponse.message = updatedMessage;
        }
      }
      //Update history:
      setHistory(h => [...h, { role: 'user', parts: [{ text: message }] }]);
      setHistory(h => [...h, { role: 'model', parts: [{ text: responseText }] }]);

      return aiResponse;
      // if (data.result === "ok") {
      //   return data as AIServiceChatResponse;
      // } else {
      // }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unexpected error occurred');
      }
      return null;
    }
  }

  return { chat, error };
}

export async function generateFlashcardsWithAI({
  apiKey,
  prompt,
  language,
  collectionName,
  boxTitle,
  boxDescription,
}: {
  apiKey: string;
  prompt: string;
  language: string;
  collectionName: string;
  boxTitle: string;
  boxDescription: string;
}): Promise<AIServiceChatResponseCard[] | { ambiguous: string }> {
  const fullPrompt = `Generate flashcards for the following collection and box.\n\nCollection: ${collectionName}\nBox: ${boxTitle}\nBox Description: ${boxDescription}\n\nUser instructions: ${prompt}`;

  console.log('AIService: Prompt sent to AI:', fullPrompt);

  // Get Gemini API Key from AsyncStorage

  if (!apiKey) {
    throw new Error('API Key not found. Please set it up in AI Settings.');
  }
  const URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' +
    apiKey;

  const response = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      system_instruction: {
        parts: {
          text: get_flashcard_system_prompt(language, boxTitle, boxDescription),
        },
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: fullPrompt,
            },
          ],
        },
      ],
    }),
  });
  const data: any = await response.json();
  const content = data.candidates?.[0]?.content;
  const responseText = content?.parts?.[0]?.text || '';

  console.log('AIService: Response from AI:', responseText);

  // Extract JSON block with cards or ambiguity
  const { json: jsonResponse } = extractJsonAndRemoveFromMessage(responseText);
  if (jsonResponse?.type === 'new_cards' && jsonResponse?.content) {
    return Object.entries(jsonResponse.content).map(([front, back]) => ({
      front: front.trim(),
      back: (back as string).trim(),
    }));
  }
  if (jsonResponse?.type === 'ambiguous' && typeof jsonResponse?.content === 'string') {
    if (['missing_topic', 'missing_num_cards', 'missing_level'].includes(jsonResponse.content)) {
      return { ambiguous: jsonResponse.content };
    }
  }
  // If not matching, return error
  throw new Error('AI response could not be parsed or did not match expected format.');
}

export function useAIRemoteService() {
  const [history, setHistory] = useState<any[]>([]);
  async function chat(message: string, language: string): Promise<AIServiceChatResponse> {
    //Update history:
    setHistory(h => [...h, { role: AIServiceRole.User, parts: message }]);
    const key = 'jclKjUk123dsahkjdhkjsa67FD213sadHAFDUd23213bvcBKJQhjgf12312';
    const URL = process.env.EXPO_PUBLIC_API_URL + '/api/ai/chat';

    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
        key,
        language,
      }),
    });
    const data: any = await response.json();
    //Update history:
    setHistory(h => [...h, { role: AIServiceRole.AI, parts: data.original_response_parts }]);

    console.log('ai response', data);
    if (data.result === 'ok') {
      return data as AIServiceChatResponse;
    } else {
      throw Error('Invalid server response');
    }
  }

  return { chat };
}

export async function resetAISetup(): Promise<void> {
  await AsyncStorage.removeItem('ai_setup_completed');
  await AsyncStorage.removeItem('gemini_api_key');
}

export async function isAISetupCompleted(): Promise<boolean> {
  const value = await AsyncStorage.getItem('ai_setup_completed');
  return value === 'true';
}
