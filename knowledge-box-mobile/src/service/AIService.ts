import OpenAI from "openai";
import { useEffect, useState } from "react";

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

const JSON_START = "```json";
const JSON_END = "```";

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
    const updatedMessage = message.replace(match[0], "").trim();
    return { json: parsedJson, updatedMessage };
  } catch (error) {
    console.error("Invalid JSON format:", error);
    return { json: null, updatedMessage: message };
  }
};

// const get_system_prompt = (
//   language: string,
//   boxTitle: string,
//   boxDescription: string
// ): string => {
//   return `You are an assistant in an app where users have their knowledge organized in boxes.

// User's language is ${language}. Reply in user's language.`;
// };
const get_system_prompt = (
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

  An assistant can help users to generate flash cards. In this case please clarify what kind of flash cards are needed (if not clear from the box description), i.e. specific topic, level, number of cards.
  When generating the cards include a JSON in the following format in your message:
  ${JSON_START}
  {
    "type":"new_cards",
    "content":{
      "card 1 face": "card 1 back",
      "card 2 face": "card 2 back",
      "card 3 face": "card 3 back",
    }
  }
  ${JSON_END}
  Please note "content" can contain as many cards as user needs. "type" must be "new_cards" in order for the app to recognize that new cards are needed, all other types will be rejected.
  
  User's language is ${language}. Reply in user's language.`;
};

export function useAIService(
  language: string,
  boxTitle: string,
  boxDescription: string
) {
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState<string>("");

  async function chat(message: string): Promise<AIServiceChatResponse | null> {
    try {
      setError("");

      const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      const URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" +
        key;

      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          system_instruction: {
            parts: {
              text: get_system_prompt(language, boxTitle, boxDescription),
            },
          },
          contents: [
            ...history,
            {
              role: "user",
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
      console.log("responseText", responseText);

      // Check if response contains JSON
      const { json: jsonResponse, updatedMessage } =
        extractJsonAndRemoveFromMessage(responseText);
      const aiResponse: AIServiceChatResponse = {
        message: responseText,
      };
      if (jsonResponse !== null) {
        console.log("found JSON");
        if (jsonResponse?.type === "new_cards" && jsonResponse?.content) {
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
      setHistory((h) => [...h, { role: "user", parts: [{ text: message }] }]);
      setHistory((h) => [
        ...h,
        { role: "model", parts: [{ text: responseText }] },
      ]);

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
        setError("An unexpected error occurred");
      }
      return null;
    }
    throw Error("Invalid server response");
  }

  return { chat, error };
}

export function useAIRemoteService() {
  const [history, setHistory] = useState<any[]>([]);
  async function chat(
    message: string,
    language: string
  ): Promise<AIServiceChatResponse> {
    //Update history:
    setHistory((h) => [...h, { role: AIServiceRole.User, parts: message }]);
    const key = "jclKjUk123dsahkjdhkjsa67FD213sadHAFDUd23213bvcBKJQhjgf12312";
    const URL = process.env.EXPO_PUBLIC_API_URL + "/api/ai/chat";

    const response = await fetch(URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
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
    setHistory((h) => [
      ...h,
      { role: AIServiceRole.AI, parts: data.original_response_parts },
    ]);

    console.log("ai response", data);
    if (data.result === "ok") {
      return data as AIServiceChatResponse;
    } else {
      throw Error("Invalid server response");
    }
  }

  return { chat };
}
